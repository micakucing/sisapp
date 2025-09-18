"use client";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../lib/firebase";
import Link from "next/link";

export default function ExamList({ studentId, kelasId }) {
  const [exams, setExams] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!studentId) {
          console.warn("Student ID belum tersedia");
          setLoading(false);
          return;
        }
        // 1️⃣ Ambil daftar ujian
        let q = collection(db, "exams");
        if (kelasId) {
          // Tambahkan filter kelas hanya jika kelasId valid
          q = query(q, where("kelasId", "==", kelasId));
        }
        const snapExams = await getDocs(q);
        const examsData = snapExams.docs.map((d) => ({ id: d.id, ...d.data() }));
        setExams(examsData);

        // 2️⃣ Ambil hasil ujian siswa
        const snapResults = await getDocs(
          query(
            collection(db, "examResults"),
            where("studentId", "==", studentId)
          )
        );
        const resultsData = snapResults.docs.map((d) => ({ id: d.id, ...d.data() }));
        setResults(resultsData);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching exams:", err);
        setLoading(false);
      }
    };

    fetchData();
  }, [kelasId, studentId]);

  if (loading) return <p>Loading...</p>;

  if (exams.length === 0)
    return <p className="text-center mt-5">Belum ada ujian tersedia.</p>;

  return (
    <div className="container py-5">
      <h2 className="mb-4">Daftar Ujian</h2>

      <div className="row g-3">
        {exams.map((exam) => {
          const hasCompleted = results.some(r => r.examId === exam.id);
          return (
            <div key={exam.id} className="col-12 col-md-6 col-lg-4">
              <div className="card shadow-sm h-100">
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{exam.title}</h5>
                  <p className="card-text">{exam.description}</p>
                  <p className="card-text">Durasi: {exam.duration} menit</p>
                  <p className="card-text">
                    Status:{" "}
                    
                    <span className={hasCompleted ? "text-success" : "text-warning"}>
                      {hasCompleted ? "Selesai" : "Belum Selesai"}
                    </span>
                  </p>

                  <Link
                    href={`/exam/${exam.id}`}
                    className={`btn mt-auto ${hasCompleted ? "btn-secondary disabled" : "btn-primary"}`}
                  >
                    Mulai Ujian
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
