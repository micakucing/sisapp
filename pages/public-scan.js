"use client";
import { useState, useEffect } from "react";
import { collection, query, where, getDocs, doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";

export default function PublicScan() {
  const [rfidInput, setRfidInput] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!rfidInput) return;
    const timeout = setTimeout(() => processScan(rfidInput), 200);
    return () => clearTimeout(timeout);
  }, [rfidInput]);

  const processScan = async (rfid) => {
    try {
      // Ambil jam masuk & pulang dari settings
      const settingsSnap = await getDoc(doc(db, "settings", "attendance"));
      const settings = settingsSnap.exists() ? settingsSnap.data() : { jamMasuk: "07:30", jamPulang: "15:00" };
      const [jamMasukH, jamMasukM] = settings.jamMasuk.split(":").map(Number);
      const [jamPulangH, jamPulangM] = settings.jamPulang.split(":").map(Number);

      const now = new Date();
      const jamMasukDate = new Date();
      jamMasukDate.setHours(jamMasukH, jamMasukM, 0, 0);

      const jamPulangDate = new Date();
      jamPulangDate.setHours(jamPulangH, jamPulangM, 0, 0);

      // Cari siswa berdasarkan RFID
      const q = query(collection(db, "users"), where("rfid", "==", rfid), where("role", "==", "siswa"));
      const snap = await getDocs(q);

      if (snap.empty) {
        setMessage("RFID tidak valid!");
        setRfidInput("");
        return;
      }

      const student = snap.docs[0].data();
      const studentId = snap.docs[0].id;
      const todayStr = new Date().toISOString().split("T")[0];
      const attendanceDocId = `${studentId}_${todayStr}`;
      const attendanceRef = doc(db, "attendance", attendanceDocId);
      const attendanceSnap = await getDoc(attendanceRef);

      // Hitung terlambat
      const terlambat = now > jamMasukDate;

      if (!attendanceSnap.exists()) {
        // Belum check-in → buat record baru
        await setDoc(attendanceRef, {
          studentId,
          name: student.name,
          kelasId: student.kelasId,
          rfid: student.rfid,
          checkIn: serverTimestamp(),
          checkOut: null,
          date: now,
          status: terlambat ? "Terlambat" : "Hadir"
        });
        setMessage(`${student.name} berhasil check-in ${terlambat ? "(Terlambat)" : ""}`);
      } else {
        const data = attendanceSnap.data();

        if (data.checkOut) {
          setMessage(`${student.name} sudah check-out hari ini`);
        } else {
          // Cek apakah sudah mencapai jam pulang
          if (now < jamPulangDate) {
            setMessage(`${student.name} belum bisa check-out sebelum jam pulang (${settings.jamPulang})`);
          } else {
            await updateDoc(attendanceRef, { checkOut: serverTimestamp() });
            setMessage(`${student.name} berhasil check-out`);
          }
        }
      }

      setRfidInput("");
    } catch (err) {
      console.error(err);
      setMessage("Gagal memproses absensi: " + err.message);
      setRfidInput("");
    }
  };

  return (
    <div className="container py-4">
      <h2 className="mb-4">Scan RFID Siswa</h2>
      <div className="card p-3 mb-4">
        <input
          className="form-control mb-2"
          placeholder="Scan RFID"
          value={rfidInput}
          onChange={e => setRfidInput(e.target.value)}
          autoFocus
        />
        {message && <div className="mt-2 alert alert-info">{message}</div>}
      </div>
    </div>
  );
}
