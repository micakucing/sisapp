"use client";
import { useEffect, useState, useRef } from "react";
import { collection, getDoc, addDoc, getDocs, serverTimestamp, doc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import Sidebar from "../../components/Sidebar";

export default function ScanRFIDPage() {
    const [rfid, setRfid] = useState(""); // input RFID
    const [lastScan, setLastScan] = useState(null); // info siswa terakhir
    const [students, setStudents] = useState([]);
    const inputRef = useRef(null);

    // Ambil semua siswa
    useEffect(() => {
        async function fetchStudents() {
            const snap = await getDocs(collection(db, "students"));
            setStudents(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        }
        fetchStudents();
    }, []);

    // Fokus input selalu aktif untuk scan RFID
    useEffect(() => {
        if (inputRef.current) inputRef.current.focus();
    }, []);

    // Handle scan RFID

    // Ambil jam dinamis sebelum scan
    const fetchSettings = async () => {
        const docRef = doc(db, "settings", "attendance");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) return docSnap.data();
        return { jamMasuk: "07:30", jamPulang: "15:00" };
    };

    const handleScan = async (e) => {
        e.preventDefault();
        if (!rfid) return;

        const student = students.find((s) => s.rfid === rfid);
        if (!student) {
            alert("RFID tidak terdaftar");
            setRfid("");
            return;
        }

        const settings = await fetchSettings();
        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

        let status = "Hadir";
        if (currentTime > settings.jamMasuk) status = "Telat"; // dibandingkan jam masuk dinamis

        await addDoc(collection(db, "attendance"), {
            siswaId: student.id,
            status,
            timestamp: serverTimestamp(),
        });

        setLastScan({ ...student, status });
        setRfid("");
    };

    return (
        <div className="d-flex flex-column flex-lg-row">
            <div className="col-lg-2 p-0">      <Sidebar />
            </div>
            <div className="flex-grow-1 p-3">
                <h2 className="mb-4">Scan RFID Siswa</h2>

                {/* Input RFID */}
                <form onSubmit={handleScan} className="mb-4">
                    <input
                        type="text"
                        ref={inputRef}
                        value={rfid}
                        onChange={(e) => setRfid(e.target.value)}
                        className="form-control"
                        placeholder="Tempel kartu RFID di reader"
                        autoFocus
                    />
                </form>

                {/* Info siswa terakhir */}
                {lastScan && (
                    <div className="card shadow-sm w-100 w-md-50">
                        {lastScan.photo && (
                            <img
                                src={lastScan.photo}
                                alt="Foto Siswa"
                                className="card-img-top"
                                style={{ height: "180px", objectFit: "cover" }}
                            />
                        )}
                        <div className="card-body">
                            <h5 className="card-title">{lastScan.name}</h5>
                            <p className="card-text">NIS: {lastScan.nis}</p>
                            <span className="badge bg-success">Hadir</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
