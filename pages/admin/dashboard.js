"use client";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../lib/firebase";
import ProtectedRoute from "../../components/ProtectedRoute";
import Sidebar from "../../components/Sidebar";

export default function AdminDashboard() {
  const [counts, setCounts] = useState({ siswa: 0, guru: 0, kelas: 0 });

  const fetchCounts = async () => {
    // Siswa
    const qSiswa = query(collection(db, "users"), where("role", "==", "siswa"));
    const snapSiswa = await getDocs(qSiswa);

    // Guru
    const qGuru = query(collection(db, "users"), where("role", "==", "guru"));
    const snapGuru = await getDocs(qGuru);

    // Kelas
    const snapKelas = await getDocs(collection(db, "kelas"));

    setCounts({ siswa: snapSiswa.size, guru: snapGuru.size, kelas: snapKelas.size });
  };

  useEffect(() => { fetchCounts(); }, []);

  return (
    <ProtectedRoute allowedRoles={["admin", "guru"]}>
         <div className="d-flex flex-column flex-lg-row">
                  <div className="col-lg-2 p-0">
      
                      <Sidebar />
                  </div>
      <div className="container py-5">
        <h2 className="mb-4">Dashboard Admin/Guru</h2>
        <div className="row">
          <div className="col-md-4 mb-3">
            <div className="card text-center shadow-sm p-3">
              <h5>Siswa</h5>
              <h3>{counts.siswa}</h3>
            </div>
          </div>
          <div className="col-md-4 mb-3">
            <div className="card text-center shadow-sm p-3">
              <h5>Guru</h5>
              <h3>{counts.guru}</h3>
            </div>
          </div>
          <div className="col-md-4 mb-3">
            <div className="card text-center shadow-sm p-3">
              <h5>Kelas</h5>
              <h3>{counts.kelas}</h3>
            </div>
          </div>
        </div>
      </div>
      </div>
    </ProtectedRoute>
  );
}
