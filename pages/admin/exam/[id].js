"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { collection, getDocs, addDoc, doc, deleteDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";

export default function ManageQuestions() {
  const router = useRouter();
  const { id } = router.query; // examId
  const [questions, setQuestions] = useState([]);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [answer, setAnswer] = useState("");

  const fetchQuestions = async () => {
    if (!id) return;
    const snap = await getDocs(collection(db, "exams", id, "questions"));
    setQuestions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => {
    fetchQuestions();
  }, [id]);

  const handleAddQuestion = async () => {
    if (!question || !answer || options.some(opt => !opt)) return alert("Isi semua field");
    await addDoc(collection(db, "exams", id, "questions"), {
      question,
      options,
      answer
    });
    setQuestion("");
    setOptions(["", "", "", ""]);
    setAnswer("");
    fetchQuestions();
  };

  const handleDeleteQuestion = async (qId) => {
    if (!confirm("Hapus soal ini?")) return;
    await deleteDoc(doc(db, "exams", id, "questions", qId));
    fetchQuestions();
  };

  return (
    <div className="container py-5">
      <h2 className="mb-4">Kelola Soal Ujian</h2>

      {/* Form Tambah Soal */}
      <div className="card p-3 mb-4">
        <h5>Tambah Soal Baru</h5>
        <input
          className="form-control mb-2"
          placeholder="Pertanyaan"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        {options.map((opt, idx) => (
          <input
            key={idx}
            className="form-control mb-2"
            placeholder={`Opsi ${idx + 1}`}
            value={opt}
            onChange={(e) => {
              const newOpts = [...options];
              newOpts[idx] = e.target.value;
              setOptions(newOpts);
            }}
          />
        ))}
        <input
          className="form-control mb-2"
          placeholder="Jawaban Benar"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
        />
        <button className="btn btn-success" onClick={handleAddQuestion}>Tambah Soal</button>
      </div>

      {/* Daftar Soal */}
      <div className="list-group">
        {questions.map((q) => (
          <div key={q.id} className="list-group-item d-flex justify-content-between align-items-start">
            <div>
              <p className="mb-1"><strong>{q.question}</strong></p>
              <p className="mb-1">Opsi: {q.options.join(", ")}</p>
              <p className="mb-1">Jawaban: {q.answer}</p>
            </div>
            <button className="btn btn-danger btn-sm" onClick={() => handleDeleteQuestion(q.id)}>Hapus</button>
          </div>
        ))}
      </div>
    </div>
  );
}
