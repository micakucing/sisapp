"use client";
import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import Sidebar from "../../../components/Sidebar";
import Link from "next/link";

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(6); // jumlah data per halaman

  // fetch siswa
  const fetchStudents = async () => {
    const snap = await getDocs(collection(db, "students"));
    setStudents(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // handle delete
  const handleDelete = async (id) => {
    if (!confirm("Apakah yakin ingin menghapus siswa ini?")) return;
    await deleteDoc(doc(db, "students", id));
    fetchStudents();
  };

  // filter & search
  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.nis.toLowerCase().includes(search.toLowerCase())
  );

  // pagination
  const indexOfLast = currentPage * perPage;
  const indexOfFirst = indexOfLast - perPage;
  const currentStudents = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / perPage);

  return (
    <>
    <div className="d-flex flex-column flex-lg-row">
           <div className="col-lg-2 p-0">  
      <Sidebar />
</div>
      <div className="flex-grow-1 p-3">
        <h2 className="mb-4">Daftar Siswa</h2>
        <Link href="/admin/students/create" className="btn btn-primary mb-4">
            Tambah Siswa
          </Link>
        {/* Search & Tambah */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start mb-3 gap-2">
          <input
            type="text"
            className="form-control w-md-50"
            placeholder="Cari nama atau NIS..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
         
        </div>

        {/* Cards responsive */}
        <div className="row g-3">
          {currentStudents.length === 0 && (
            <div className="col-12 text-center">Tidak ada siswa</div>
          )}
          {currentStudents.map((s) => (
            <div key={s.id} className="col-12 col-sm-6 col-lg-4">
              <div className="card shadow-sm">
                {s.photo && (
                  <img
                    src={s.photo}
                    alt="Foto Siswa"
                    className="card-img-top"
                    style={{ height: "180px", objectFit: "cover" }}
                  />
                )}
                <div className="card-body">
                  <h5 className="card-title">{s.name}</h5>
                  <p className="card-text">NIS: {s.nis}</p>
                  <div className="d-flex gap-2 flex-wrap">
                    <Link
                      href={`/admin/students/edit/${s.id}`}
                      className="btn btn-sm btn-warning flex-grow-1"
                    >
                      Edit
                    </Link>
                    <button
                      className="btn btn-sm btn-danger flex-grow-1"
                      onClick={() => handleDelete(s.id)}
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <nav className="mt-4">
            <ul className="pagination justify-content-center flex-wrap">
              {[...Array(totalPages)].map((_, i) => (
                <li
                  key={i}
                  className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
                >
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
      </div>
      </>
  );
}
