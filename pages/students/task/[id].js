"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { doc, getDoc, collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "../../../lib/firebase";

export default function StudentTask({ studentId }) {
  const router = useRouter();
  const { id } = router.query; // taskId
  const [task, setTask] = useState(null);
  const [submission, setSubmission] = useState("");
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    if (!id) return;

    const fetchTask = async () => {
      const tDoc = await getDoc(doc(db, "tasks", id));
      if (tDoc.exists()) setTask(tDoc.data());

      const snap = await getDocs(collection(db, "tasks", id, "submissions"));
      setSubmissions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    };

    fetchTask();
  }, [id]);

  const handleSubmit = async () => {
    if (!submission) return alert("Isi jawaban");
    await addDoc(collection(db, "tasks", id, "submissions"), {
      studentId,
      answer: submission,
      status: "Terkirim",
      score: null,
      timestamp: new Date()
    });
    alert("Tugas berhasil dikirim");
    setSubmission("");
  };

  if (!task) return <p>Loading...</p>;

  const mySubmission = submissions.find(s => s.studentId === studentId);

  return (
    <div className="container py-5">
      <h2>{task.title}</h2>
      <p>{task.description}</p>
      <p>Deadline: {task.dueDate?.toDate ? task.dueDate.toDate().toLocaleDateString() : new Date(task.dueDate).toLocaleDateString()}</p>

      {!mySubmission ? (
        <div className="mb-3">
          <textarea className="form-control mb-2" rows={5} value={submission} onChange={e=>setSubmission(e.target.value)} placeholder="Jawaban anda"></textarea>
          <button className="btn btn-primary" onClick={handleSubmit}>Kirim Jawaban</button>
        </div>
      ) : (
        <div className="alert alert-success">
          Status: {mySubmission.status} | Score: {mySubmission.score ?? "-"}
        </div>
      )}
    </div>
  );
}
