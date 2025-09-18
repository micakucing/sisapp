"use client";
import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import Sidebar from "../../components/Sidebar";

export default function AttendanceRekapPage() {
  const [attendanceList, setAttendanceList] = useState([]);
  const [students, setStudents] = useState([]);
  const [date] = useState(new Date().toISOString().substring(0, 10));

  // Ambil semua siswa
  useEffect(() => {
    async function fetchStudents() {
      const snap = await getDocs(collection(db, "students"));
      setStudents(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    }
    fetchStudents();
  }, []);

  // Realtime fetch attendance hari ini
  useEffect(() => {
    const q = query(
      collection(db, "attendance"),
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      const list = snap.docs
        .map((d) => {
          const data = d.data();
          const ts = data.timestamp?.toDate
            ? data.timestamp.toDate()
            : new Date(data.timestamp?.seconds * 1000 || Date.now());
          return { id: d.id, ...data, dateObj: ts };
        })
        .filter(
          (a) => a.dateObj.toISOString().substring(0, 10) === date
        );
      setAttendanceList(list);
    });

    return () => unsubscribe();
  }, [date]);

  // Cari info siswa
  const getStudent = (id) => students.find((s) => s.id === id);

  return (
    <div className="d-flex flex-column flex-lg-row">
      <Sidebar />

      <div className="flex-grow-1 p-3">
        <h2 className="mb-4">Rekap Absensi Hari Ini</h2>

        {attendanceList.length === 0 && (
          <div className="text-center">Belum ada absensi hari ini</div>
        )}

        <div className="row g-3">
          {attendanceList.map((a) => {
            const s = getStudent(a.siswaId);
            if (!s) return null;

            return (
              <div key={a.id} className="col-12 col-sm-6 col-lg-4">
                <div className="card shadow-sm">
                  {s.photo && (
                    <img
                      src={s.photo}
                      alt="Foto Siswa"
                      className="card-img-top"
                      style={{ height: "180px", objectFit: "cover" }}
                    />
                  )}
                  <div className="card-body">
                    <h5 className="card-title">{s.name}</h5>
                    <p className="card-text">NIS: {s.nis}</p>
                    <span className="badge bg-success">{a.status}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
