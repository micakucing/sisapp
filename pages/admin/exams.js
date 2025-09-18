"use client";
import { useEffect, useState } from "react";
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import ProtectedRoute from "../../components/ProtectedRoute";

export default function AdminExams() {
  const [exams, setExams] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState(60);
  const [kelasId, setKelasId] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch semua ujian
  const fetchExams = async () => {
    const snap = await getDocs(collection(db, "exams"));
    setExams(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  useEffect(() => {
    fetchExams();
  }, []);

  // Tambah ujian baru
  const handleAddExam = async () => {
    if (!title || !description) return alert("Isi semua field");
    await addDoc(collection(db, "exams"), {
      title,
      description,
      duration: Number(duration),
      kelasId
    });
    setTitle("");
    setDescription("");
    setDuration(60);
    setKelasId("");
    fetchExams();
  };

  // Hapus ujian
  const handleDeleteExam = async (id) => {
    if (!confirm("Hapus ujian ini?")) return;
    await deleteDoc(doc(db, "exams", id));
    fetchExams();
  };

  if (loading) return <p>Loading...</p>;

  return (
    <ProtectedRoute allowedRoles={["admin", "guru"]}>
    <div className="container py-5">
      <h2 className="mb-4">Dashboard Ujian - Admin/Guru</h2>

      {/* Form Tambah Ujian */}
      <div className="card p-3 mb-4">
        <h5>Tambah Ujian Baru</h5>
        <div className="mb-2">
          <input
            className="form-control mb-2"
            placeholder="Judul Ujian"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            className="form-control mb-2"
            placeholder="Deskripsi Ujian"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
          <input
            className="form-control mb-2"
            type="number"
            placeholder="Durasi (menit)"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          />
          <input
            className="form-control mb-2"
            placeholder="Kelas ID (opsional)"
            value={kelasId}
            onChange={(e) => setKelasId(e.target.value)}
          />
        </div>
        <button className="btn btn-success" onClick={handleAddExam}>Tambah Ujian</button>
      </div>

      {/* Daftar Ujian */}
      <div className="row g-3">
        {exams.map((exam) => (
          <div key={exam.id} className="col-12 col-md-6 col-lg-4">
            <div className="card shadow-sm h-100">
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">{exam.title}</h5>
                <p className="card-text">{exam.description}</p>
                <p className="card-text">Durasi: {exam.duration} menit</p>
                <p className="card-text">Kelas ID: {exam.kelasId || "-"}</p>
                <div className="mt-auto d-flex gap-2">
                  <button
                    className="btn btn-primary"
                    onClick={() => window.location.href = `/admin/exam/${exam.id}`}
                  >
                    Kelola Soal
                  </button>
                  <button className="btn btn-danger" onClick={() => handleDeleteExam(exam.id)}>Hapus</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
    </ProtectedRoute>
      );
}
