"use client";
import Link from "next/link";

export default function Home() {
  return (
    <div className="container py-5">
      <h1 className="text-center mb-5">Selamat Datang di Sistem Sekolah</h1>
      
      <div className="row justify-content-center">
        {/* Card Dashboard Admin */}
        <div className="col-md-4 mb-4">
          <Link href="/login" className="text-decoration-none">
            <div className="card text-center shadow-sm h-100">
              <div className="card-body d-flex flex-column justify-content-center align-items-center">
                <i className="bi bi-speedometer2" style={{ fontSize: '3rem' }}></i>
                <h5 className="card-title mt-3">Dashboard Admin</h5>
                <p className="card-text">Kelola siswa, guru, kelas, dan tugas</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Card Scan RFID */}
        <div className="col-md-4 mb-4">
          <Link href="/public-scan" className="text-decoration-none">
            <div className="card text-center shadow-sm h-100">
              <div className="card-body d-flex flex-column justify-content-center align-items-center">
                <i className="bi bi-card-checklist" style={{ fontSize: '3rem' }}></i>
                <h5 className="card-title mt-3">Scan RFID</h5>
                <p className="card-text">Absensi siswa dengan kartu RFID</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
