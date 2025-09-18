"use client";
import { useEffect, useState } from "react";
import { collection, getDocs, addDoc, doc, deleteDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import ProtectedRoute from "../../components/ProtectedRoute";

export default function AdminTasks({ guruId }) {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [kelasId, setKelasId] = useState("");
  const [dueDate, setDueDate] = useState("");

  const fetchTasks = async () => {
    const snap = await getDocs(collection(db, "tasks"));
    setTasks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleAddTask = async () => {
    if (!title || !description || !kelasId || !dueDate) return alert("Isi semua field");
    await addDoc(collection(db, "tasks"), {
      title,
      description,
      kelasId,
      dueDate: new Date(dueDate),
      createdBy: guruId,
      timestamp: new Date()
    });
    setTitle(""); setDescription(""); setKelasId(""); setDueDate("");
    fetchTasks();
  };

  const handleDelete = async (id) => {
    if (!confirm("Hapus tugas ini?")) return;
    await deleteDoc(doc(db, "tasks", id));
    fetchTasks();
  };

  return (
        <ProtectedRoute allowedRoles={["admin", "guru"]}>
    
    <div className="container py-5">
      <h2 className="mb-4">Kelola Tugas Guru</h2>

      {/* Form Tambah Tugas */}
      <div className="card p-3 mb-4">
        <h5>Buat Tugas Baru</h5>
        <input className="form-control mb-2" placeholder="Judul" value={title} onChange={e=>setTitle(e.target.value)} />
        <textarea className="form-control mb-2" placeholder="Deskripsi" value={description} onChange={e=>setDescription(e.target.value)} />
        <input className="form-control mb-2" placeholder="Kelas ID" value={kelasId} onChange={e=>setKelasId(e.target.value)} />
        <input className="form-control mb-2" type="date" value={dueDate} onChange={e=>setDueDate(e.target.value)} />
        <button className="btn btn-success" onClick={handleAddTask}>Tambah Tugas</button>
      </div>

      {/* Daftar Tugas */}
      <div className="list-group">
        {tasks.map(t => (
          <div key={t.id} className="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <strong>{t.title}</strong> - {t.description} (Deadline: {t.dueDate?.toDate ? t.dueDate.toDate().toLocaleDateString() : new Date(t.dueDate).toLocaleDateString()})
            </div>
            <div className="d-flex gap-2">
              <a href={`/admin/task/${t.id}`} className="btn btn-primary btn-sm">Lihat Submission</a>
              <button className="btn btn-danger btn-sm" onClick={()=>handleDelete(t.id)}>Hapus</button>
            </div>
          </div>
        ))}
      </div>
    </div>
    </ProtectedRoute>
  );
}
