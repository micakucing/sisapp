"use client";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../lib/firebase";

export default function StudentDashboard({ studentId, kelasId }) {
  const [exams, setExams] = useState([]);
  const [results, setResults] = useState([]);
  const [attendances, setAttendances] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!kelasId) {
        setLoading(false);
        return;
      }

      try {
        const today = new Date();

        // 1️⃣ Jadwal ujian kelas siswa
        const qExams = query(
          collection(db, "exams"),
          where("kelasId", "==", kelasId)
        );
        const snapExams = await getDocs(qExams);
        const examsData = snapExams.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(e => e.date && e.date.toDate() >= today);
        setExams(examsData);

        // 2️⃣ Nilai ujian siswa
        const snapResults = await getDocs(
          query(collection(db, "examResults"), where("studentId", "==", studentId))
        );
        setResults(snapResults.docs.map(d => ({ id: d.id, ...d.data() })));

        // 3️⃣ Absensi siswa
        const snapAttendances = await getDocs(
          query(collection(db, "attendances"), where("studentId", "==", studentId))
        );
        setAttendances(snapAttendances.docs.map(d => ({ id: d.id, ...d.data() })));

        // 4️⃣ Tugas siswa
        const qTasks = query(collection(db, "tasks"), where("kelasId", "==", kelasId));
        const snapTasks = await getDocs(qTasks);
        setTasks(snapTasks.docs.map(d => ({ id: d.id, ...d.data() })));

        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchData();
  }, [studentId, kelasId]);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="container py-5">
      <h2 className="mb-4">Dashboard Siswa</h2>

      {/* 1️⃣ Nilai Ujian */}
      <div className="mb-5">
        <h4>Nilai Ujian</h4>
        <div className="table-responsive">
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Ujian</th>
                <th>Score</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {results.map(r => {
                const exam = exams.find(e => e.id === r.examId);
                return (
                  <tr key={r.id}>
                    <td>{exam?.title || "-"}</td>
                    <td>{r.score}</td>
                    <td>{r.status}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2️⃣ Jadwal Ujian */}
      <div className="mb-5">
        <h4>Jadwal Ujian</h4>
        {exams.length > 0 ? (
          <div className="list-group">
            {exams.map(e => (
              <div key={e.id} className="list-group-item">
                <strong>{e.title}</strong> - {e.description} ({e.duration} menit)
                <div className="text-muted">
                  Tanggal: {e.date?.toDate().toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted">Belum ada jadwal ujian.</p>
        )}
      </div>

      {/* 3️⃣ Absensi */}
      <div className="mb-5">
        <h4>Absensi</h4>
        {attendances.length > 0 ? (
          <div className="table-responsive">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {attendances.map(a => (
                  <tr key={a.id}>
                    <td>{a.tanggal}</td>
                    <td>{a.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-muted">Belum ada data absensi.</p>
        )}
      </div>

      {/* 4️⃣ Tugas */}
      <div className="mb-5">
        <h4>Tugas</h4>
        {tasks.length > 0 ? (
          <div className="list-group">
            {tasks.map(t => (
              <div key={t.id} className="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <strong>{t.title}</strong> - {t.description} (Deadline: {t.dueDate?.toDate?.().toLocaleDateString() || new Date(t.dueDate).toLocaleDateString()})
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted">Belum ada tugas.</p>
        )}
      </div>
    </div>
  );
}
