"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";

export default function GradeTask() {
  const router = useRouter();
  const { id } = router.query; // taskId
  const [submissions, setSubmissions] = useState([]);
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!id) return;

    // Task info
    const tDoc = await getDocs(collection(db, "tasks"));
    setTask(tDoc.docs.find(d => d.id === id)?.data() || null);

    // Submissions
    const snap = await getDocs(collection(db, "tasks", id, "submissions"));
    setSubmissions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleGrade = async (submissionId, score) => {
    if (score === "" || isNaN(score)) return alert("Masukkan nilai valid");
    await updateDoc(doc(db, "tasks", id, "submissions", submissionId), {
      score: Number(score),
      status: "Dinilai"
    });
    fetchData();
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="container py-5">
      <h2 className="mb-4">Nilai Tugas: {task?.title || "-"}</h2>
      <div className="table-responsive">
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Siswa ID</th>
              <th>Jawaban</th>
              <th>Status</th>
              <th>Score</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map(s => (
              <tr key={s.id}>
                <td>{s.studentId}</td>
                <td>{s.answer}</td>
                <td>{s.status}</td>
                <td>{s.score ?? "-"}</td>
                <td>
                  {s.status === "Terkirim" && (
                    <div className="d-flex gap-2">
                      <input
                        type="number"
                        placeholder="Nilai"
                        className="form-control form-control-sm"
                        style={{width: '80px'}}
                        onChange={e => s.tempScore = e.target.value}
                      />
                      <button className="btn btn-success btn-sm" onClick={() => handleGrade(s.id, s.tempScore)}>Nilai</button>
                    </div>
                  )}
                  {s.status === "Dinilai" && <span className="badge bg-success">Sudah Dinilai</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
