import { useEffect, useState } from "react";
import ProtectedRoute from "../../components/ProtectedRoute";
import { db } from "../../lib/firebase";
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore";
import Sidebar from "../../components/Sidebar";

export default function ClassesPage() {
    const [classes, setClasses] = useState([]);
    const [name, setName] = useState("");
    const [wali, setWali] = useState("");
    const [editId, setEditId] = useState(null);

    // Fetch classes
    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        const snap = await getDocs(collection(db, "classes"));
        setClasses(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name) return alert("Nama kelas wajib diisi!");

        if (editId) {
            // Update
            const ref = doc(db, "classes", editId);
            await updateDoc(ref, { name, wali });
            setEditId(null);
        } else {
            // Create
            await addDoc(collection(db, "classes"), { name, wali });
        }

        setName("");
        setWali("");
        fetchClasses();
    };

    const handleEdit = (kelas) => {
        setName(kelas.name);
        setWali(kelas.wali || "");
        setEditId(kelas.id);
    };

    const handleDelete = async (id) => {
        if (!confirm("Yakin ingin hapus kelas ini?")) return;
        await deleteDoc(doc(db, "classes", id));
        fetchClasses();
    };

    return (
        <ProtectedRoute allowedRoles={["admin", "guru"]}>
            <div className="d-flex flex-column flex-lg-row">
                <div className="col-lg-2 p-0">       
                     <Sidebar />
                </div>
                <div className="flex-grow-1 p-3">        <h2>Manajemen Kelas</h2>

                    {/* Form Tambah/Edit */}
                    <form className="row g-3 my-3" onSubmit={handleSubmit}>
                        <div className="col-md-4">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Nama Kelas"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="col-md-4">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Wali Kelas"
                                value={wali}
                                onChange={(e) => setWali(e.target.value)}
                            />
                        </div>
                        <div className="col-md-4">
                            <button type="submit" className="btn btn-primary w-100">
                                {editId ? "Update Kelas" : "Tambah Kelas"}
                            </button>
                        </div>
                    </form>

                    {/* Tabel Kelas */}
                    <div className="table-responsive">
                        <table className="table table-bordered table-striped">
                            <thead className="table-dark">
                                <tr>
                                    <th>No</th>
                                    <th>Nama Kelas</th>
                                    <th>Wali Kelas</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {classes.map((kelas, i) => (
                                    <tr key={kelas.id}>
                                        <td>{i + 1}</td>
                                        <td>{kelas.name}</td>
                                        <td>{kelas.wali}</td>
                                        <td>
                                            <button
                                                className="btn btn-sm btn-warning me-2"
                                                onClick={() => handleEdit(kelas)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="btn btn-sm btn-danger"
                                                onClick={() => handleDelete(kelas.id)}
                                            >
                                                Hapus
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {classes.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="text-center">
                                            Belum ada data kelas.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
