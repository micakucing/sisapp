"use client";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function ExamResults() {
  const [results, setResults] = useState([]);
  const [exams, setExams] = useState([]);
  const [kelasList, setKelasList] = useState([]);
  const [selectedExam, setSelectedExam] = useState("");
  const [selectedKelas, setSelectedKelas] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch semua ujian & kelas unik
  useEffect(() => {
    const fetchData = async () => {
      const snapExams = await getDocs(collection(db, "exams"));
      const examsData = snapExams.docs.map(d => ({ id: d.id, ...d.data() }));
      setExams(examsData);

      const kelasSet = new Set(examsData.map(e => e.kelasId).filter(Boolean));
      setKelasList(Array.from(kelasSet));
    };
    fetchData();
  }, []);

  // Fetch hasil ujian
  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      let q = collection(db, "examResults");

      if (selectedExam) {
        q = query(q, where("examId", "==", selectedExam));
      }

      const snapResults = await getDocs(q);
      let data = snapResults.docs.map(d => ({ id: d.id, ...d.data() }));

      // Filter kelas jika dipilih
      if (selectedKelas) {
        data = data.filter(r => {
          const exam = exams.find(e => e.id === r.examId);
          return exam?.kelasId === selectedKelas;
        });
      }

      setResults(data);
      setLoading(false);
    };

    fetchResults();
  }, [selectedExam, selectedKelas, exams]);

  const handleExport = () => {
  if (!results.length) return alert("Tidak ada data untuk diexport");

  // Format data untuk Excel
  const data = results.map(r => {
    const exam = exams.find(e => e.id === r.examId);
    return {
      "Siswa ID": r.studentId,
      "Ujian": exam?.title || "-",
      "Score": r.score,
      "Status": r.status,
      "Waktu": r.timestamp?.toDate ? r.timestamp.toDate().toLocaleString() : "-"
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Hasil Ujian");

  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
  saveAs(blob, "Hasil_Ujian.xlsx");
};

  // Data untuk grafik
  const chartData = [];
  results.forEach(r => {
    chartData.push({
      name: r.studentId,
      score: r.score
    });
  });

  if (loading) return <p>Loading...</p>;

  return (
    <div className="container py-5">
      <h2 className="mb-4">Dashboard Hasil Ujian</h2>
<div className="d-flex justify-content-between align-items-center mb-3">
  <h5 className="mb-0">Tabel Hasil</h5>
  <button className="btn btn-success" onClick={handleExport}>Export ke Excel</button>
</div>

      {/* Filter */}
      <div className="row mb-4">
        <div className="col-md-6 mb-2">
          <select className="form-select" value={selectedExam} onChange={e => setSelectedExam(e.target.value)}>
            <option value="">-- Pilih Ujian --</option>
            {exams.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
          </select>
        </div>
        <div className="col-md-6 mb-2">
          <select className="form-select" value={selectedKelas} onChange={e => setSelectedKelas(e.target.value)}>
            <option value="">-- Pilih Kelas --</option>
            {kelasList.map(k => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>
      </div>

      {/* Tabel Hasil */}
      <div className="table-responsive mb-5">
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Siswa ID</th>
              <th>Ujian</th>
              <th>Score</th>
              <th>Status</th>
              <th>Waktu</th>
            </tr>
          </thead>
          <tbody>
            {results.map(r => {
              const exam = exams.find(e => e.id === r.examId);
              return (
                <tr key={r.id}>
                  <td>{r.studentId}</td>
                  <td>{exam?.title || "-"}</td>
                  <td>{r.score}</td>
                  <td>{r.status}</td>
                  <td>{r.timestamp?.toDate ? r.timestamp.toDate().toLocaleString() : "-"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Grafik Skor */}
      <h5 className="mb-3">Grafik Skor Siswa</h5>
      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="score" fill="#6498FE" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
