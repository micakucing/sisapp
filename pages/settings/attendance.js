"use client";
import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import Sidebar from "../../components/Sidebar";

export default function AttendanceSettings() {
    const [jamMasuk, setJamMasuk] = useState("");
    const [jamPulang, setJamPulang] = useState("");

    useEffect(() => {
        async function fetchSettings() {
            const docRef = doc(db, "settings", "attendance");
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                setJamMasuk(data.jamMasuk || "");
                setJamPulang(data.jamPulang || "");
            }
        }
        fetchSettings();
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        await setDoc(doc(db, "settings", "attendance"), { jamMasuk, jamPulang });
        alert("Jam masuk & jam pulang berhasil diperbarui");
    };

    return (
        <div className="d-flex flex-column flex-lg-row">
            <div className="col-lg-2 p-0">        <Sidebar />
            </div>
            <div className="flex-grow-1 p-3">
                <h2 className="mb-4">Pengaturan Absensi</h2>
                <form onSubmit={handleSave} className="col-12 col-md-6">
                    <div className="mb-3">
                        <label className="form-label">Jam Masuk</label>
                        <input
                            type="time"
                            className="form-control"
                            value={jamMasuk}
                            onChange={(e) => setJamMasuk(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Jam Pulang</label>
                        <input
                            type="time"
                            className="form-control"
                            value={jamPulang}
                            onChange={(e) => setJamPulang(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary">Simpan</button>
                </form>
            </div>
        </div>
    );
}
