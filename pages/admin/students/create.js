"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import Sidebar from "../../../components/Sidebar";

export default function CreateStudentPage() {
    const router = useRouter();
    const [student, setStudent] = useState({
        name: "",
        nis: "",
        kelasId: "",
        photo: "",
    });
    const [kelasList, setKelasList] = useState([]);
    const [errors, setErrors] = useState({});

    // Ambil daftar kelas
    useEffect(() => {
        async function fetchKelas() {
            const snap = await getDocs(collection(db, "classes"));
            setKelasList(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        }
        fetchKelas();
    }, []);

    // Validasi semua field
    const validate = async () => {
        let tempErrors = {};
        if (!student.name) tempErrors.name = "Nama wajib diisi";
        if (!student.nis) tempErrors.nis = "NIS wajib diisi";

        // cek NIS unik
        if (student.nis) {
            const snap = await getDocs(collection(db, "students"));
            const nisExists = snap.docs.some((d) => d.data().nis === student.nis);
            if (nisExists) tempErrors.nis = "NIS sudah digunakan";
        }
                // cek RFID 

   if (student.rfid) {
            const snap = await getDocs(collection(db, "students"));
            const rfidExists = snap.docs.some((d) => d.data().rfid === student.rfid);
            if (rfidExists) tempErrors.rfid = "RFID sudah digunakan";
        }

        if (!student.kelasId) tempErrors.kelasId = "Kelas wajib dipilih";

        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    // Handle form submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        const isValid = await validate();
        if (!isValid) return;

        await addDoc(collection(db, "students"), student);
        alert("Siswa berhasil ditambahkan");
        router.push("/students");
    };

    // Handle input change
    const handleChange = (e) => {
        setStudent({ ...student, [e.target.name]: e.target.value });
    };

    // Handle upload foto Base64
    const handlePhoto = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            setStudent({ ...student, photo: reader.result });
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="d-flex flex-column flex-lg-row">
            <div className="col-lg-2 p-0">

                <Sidebar />
            </div>
            <div className="flex-grow-1 p-3">
                <h2 className="mb-4">Tambah Siswa</h2>

                <form onSubmit={handleSubmit} className="col-12 col-md-6">
                    {/* Nama */}
                    <div className="mb-3">
                        <label className="form-label">Nama</label>
                        <input
                            type="text"
                            name="name"
                            className={`form-control ${errors.name ? "is-invalid" : ""}`}
                            value={student.name}
                            onChange={handleChange}
                        />
                        {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                    </div>

                    {/* NIS */}
                    <div className="mb-3">
                        <label className="form-label">NIS</label>
                        <input
                            type="text"
                            name="nis"
                            className={`form-control ${errors.nis ? "is-invalid" : ""}`}
                            value={student.nis}
                            onChange={handleChange}
                        />
                        {errors.nis && <div className="invalid-feedback">{errors.nis}</div>}
                    </div>


 {/* RFID */}
                    <div className="mb-3">
                        <label className="form-label">RFID</label>
                        <input
                            type="text"
                            name="rfid"
                            className={`form-control ${errors.rfid ? "is-invalid" : ""}`}
                            value={student.rfid}
                            onChange={handleChange}
                        />
                        {errors.rfid && <div className="invalid-feedback">{errors.rfid}</div>}
                    </div>

                 
                    {/* Kelas */}
                    <div className="mb-3">
                        <label className="form-label">Kelas</label>
                        <select
                            name="kelasId"
                            className={`form-select ${errors.kelasId ? "is-invalid" : ""}`}
                            value={student.kelasId}
                            onChange={handleChange}
                        >
                            <option value="">Pilih Kelas</option>
                            {kelasList.map((k) => (
                                <option key={k.id} value={k.id}>
                                    {k.name}
                                </option>
                            ))}
                        </select>
                        {errors.kelasId && <div className="invalid-feedback">{errors.kelasId}</div>}
                    </div>

                    {/* Foto */}
                    <div className="mb-3">
                        <label className="form-label">Foto Siswa</label>
                        <input
                            type="file"
                            className="form-control"
                            accept="image/*"
                            onChange={handlePhoto}
                        />
                        {student.photo && (
                            <img
                                src={student.photo}
                                alt="Foto Siswa"
                                className="mt-2 rounded"
                                style={{ width: "120px", height: "120px", objectFit: "cover" }}
                            />
                        )}
                    </div>

                    <button type="submit" className="btn btn-primary">
                        Tambah Siswa
                    </button>
                </form>
            </div>
        </div>
    );
}
