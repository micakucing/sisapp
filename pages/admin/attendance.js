"use client";
import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../../lib/firebase";
import Sidebar from "../../components/Sidebar";

export default function AttendanceDashboard() {
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [kelasList, setKelasList] = useState([]);
  const [selectedKelas, setSelectedKelas] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  // Ambil semua kelas
  const fetchKelas = async () => {
    const snapshot = await getDocs(collection(db, "classes"));
    setKelasList(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  // Ambil semua absensi
  const fetchRecords = async () => {
    const q = query(collection(db, "attendance"), orderBy("date", "desc"));
    const snap = await getDocs(q);
    setRecords(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => {
    fetchKelas();
    fetchRecords();
  }, []);

  // Filter & search
  useEffect(() => {
  let filtered = records;

  // Filter kelas
  if (selectedKelas) {
    filtered = filtered.filter(r => r.kelasId === selectedKelas);
  }

  // Filter pencarian nama
  if (search) {
    const keyword = search.toLowerCase();
    filtered = filtered.filter(r => r.name.toLowerCase().includes(keyword));
  }

  setFilteredRecords(filtered);
  setCurrentPage(1); // reset pagination
}, [records, selectedKelas, search]);


  // Pagination
  const indexOfLast = currentPage * perPage;
  const indexOfFirst = indexOfLast - perPage;
  const currentRecords = filteredRecords.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredRecords.length / perPage);

 const exportCSV = () => {
  if (!filteredRecords || filteredRecords.length === 0) {
    alert("Tidak ada data untuk diexport!");
    return;
  }

  const header = ["Nama", "Kelas", "Check-In", "Check-Out", "Status", "Tanggal"];
  const rows = filteredRecords.map(r => [
    r.name,
    r.kelasId,
    r.checkIn?.toDate ? r.checkIn.toDate().toLocaleTimeString() : "-",
    r.checkOut?.toDate ? r.checkOut.toDate().toLocaleTimeString() : "-",
    r.status,
    r.date?.toDate ? r.date.toDate().toLocaleDateString() : "-"
  ]);

  const csvContent = [header, ...rows].map(e => e.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `absensi_${new Date().toISOString().split("T")[0]}.csv`;
  link.click();
};


  return (
    <div className="d-flex">
      <Sidebar />
      <div className="flex-grow-1 p-4" style={{ marginLeft: "220px" }}>
        <h2 className="mb-4">Rekap Absensi</h2>

        {/* Filter & Search */}
        <div className="row mb-3">
          <div className="col-md-3 mb-2">
            <select className="form-select" value={selectedKelas} onChange={e => setSelectedKelas(e.target.value)}>
              <option value="">-- Semua Kelas --</option>
              {kelasList.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
            </select>
          </div>
          <div className="col-md-3 mb-2">
            <input
              type="text"
              className="form-control"
              placeholder="Cari nama siswa"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="col-md-3 mb-2">
            <button className="btn btn-primary" onClick={exportCSV}>Export CSV</button>
          </div>
        </div>

        {/* Tabel Absensi */}
        <div className="table-responsive">
          <table className="table table-bordered table-hover">
            <thead className="table-light">
              <tr>
                <th>Nama</th>
                <th>Kelas</th>
                <th>Check-In</th>
                <th>Check-Out</th>
                <th>Status</th>
                <th>Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {currentRecords.length === 0 ? (
                <tr><td colSpan={6} className="text-center">Tidak ada data</td></tr>
              ) : currentRecords.map(r => (
                <tr key={r.id}>
                  <td>{r.name}</td>
                  <td>{r.kelasId}</td>
                  <td>{r.checkIn?.toDate ? r.checkIn.toDate().toLocaleTimeString() : "-"}</td>
                  <td>{r.checkOut?.toDate ? r.checkOut.toDate().toLocaleTimeString() : "-"}</td>
                  <td>{r.status}</td>
                  <td>{r.date?.toDate ? r.date.toDate().toLocaleDateString() : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <nav>
          <ul className="pagination">
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <button className="page-link" onClick={() => setCurrentPage(prev => prev - 1)}>Prev</button>
            </li>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <li key={page} className={`page-item ${page === currentPage ? "active" : ""}`}>
                <button className="page-link" onClick={() => setCurrentPage(page)}>{page}</button>
              </li>
            ))}
            <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
              <button className="page-link" onClick={() => setCurrentPage(prev => prev + 1)}>Next</button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
