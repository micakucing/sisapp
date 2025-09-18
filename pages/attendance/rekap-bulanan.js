import { useEffect, useState } from "react";
import ProtectedRoute from "../../components/ProtectedRoute";
import { db } from "../../lib/firebase";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function RekapBulanan() {
    const [kelas, setKelas] = useState("X IPA 1");
    const [month, setMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
    const [rekap, setRekap] = useState([]);

    useEffect(() => {
        async function fetchData() {
            // ambil semua siswa di kelas
            const snapStudents = await getDocs(query(collection(db, "students"), where("kelas", "==", kelas)));
            const listStudents = snapStudents.docs.map(d => ({ id: d.id, ...d.data() }));

            // tentukan range tanggal bulan ini
            const [y, m] = month.split("-");
            const start = new Date(y, m - 1, 1, 0, 0, 0);
            const end = new Date(y, m, 0, 23, 59, 59); // akhir bulan

            // ambil absensi bulan ini
            const snapAbsensi = await getDocs(query(
                collection(db, "attendance"),
                where("timestamp", ">=", start),
                where("timestamp", "<=", end),
                orderBy("timestamp", "asc")
            ));

            const absensi = snapAbsensi.docs.map(d => ({ id: d.id, ...d.data() }));

            // hitung hadir / bolos per siswa
            const hasil = listStudents.map(s => {
                const dataSiswa = absensi.filter(a => a.studentId === s.id);
                const hadir = dataSiswa.length; // setiap tap = hadir
                // total hari efektif bisa dihitung manual, sementara kita hitung bolos = jumlah hari dalam bulan - hadir
                const totalHari = new Date(y, m, 0).getDate();
                const bolos = totalHari - hadir;
                return {
                    ...s,
                    hadir,
                    bolos
                };
            });

            setRekap(hasil);
        }
        fetchData();

        async function fetchKelas() {
            const snap = await getDocs(collection(db, "classes"));
            const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            setDaftarKelas(list);
            if (list.length > 0) setKelas(list[0].name); // default pilih kelas pertama
        }
        fetchKelas();

    }, [kelas, month]);

    // Export Excel
    const exportExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(rekap.map((s, i) => ({
            No: i + 1,
            Nama: s.name,
            NIS: s.nis,
            Kelas: s.kelas,
            Hadir: s.hadir,
            "Tidak Hadir": s.bolos
        })));
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Rekap Bulanan");
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        saveAs(new Blob([excelBuffer], { type: "application/octet-stream" }), `Rekap_Bulanan_${kelas}_${month}.xlsx`);
    };

    // Export PDF
    const exportPDF = () => {
        const doc = new jsPDF();
        doc.text(`Rekap Absensi Bulanan ${kelas} - ${month}`, 14, 15);

        const tableData = rekap.map((s, i) => [
            i + 1, s.name, s.nis, s.kelas, s.hadir, s.bolos
        ]);

        doc.autoTable({
            head: [["No", "Nama", "NIS", "Kelas", "Hadir", "Tidak Hadir"]],
            body: tableData,
            startY: 20
        });

        doc.save(`Rekap_Bulanan_${kelas}_${month}.pdf`);
    };

    return (
        <ProtectedRoute>
            <div>
                <h2>Rekap Absensi Bulanan</h2>

                <div className="row my-3">
                    <div className="col-md-3">
                        <select
                            className="form-select"
                            value={kelas}
                            onChange={e => setKelas(e.target.value)}
                        >
                            {daftarKelas.map(k => (
                                <option key={k.id} value={k.name}>
                                    {k.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="col-md-3">
                        <input
                            type="month"
                            className="form-control"
                            value={month}
                            onChange={e => setMonth(e.target.value)}
                        />
                    </div>
                    <div className="col-md-6 text-end">
                        <button className="btn btn-success me-2" onClick={exportExcel}>Export Excel</button>
                        <button className="btn btn-danger" onClick={exportPDF}>Export PDF</button>
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="table table-bordered table-striped">
                        <thead className="table-dark">
                            <tr>
                                <th>No</th>
                                <th>Nama</th>
                                <th>NIS</th>
                                <th>Kelas</th>
                                <th>Hadir</th>
                                <th>Tidak Hadir</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rekap.map((s, i) => (
                                <tr key={s.id}>
                                    <td>{i + 1}</td>
                                    <td>{s.name}</td>
                                    <td>{s.nis}</td>
                                    <td>{s.kelas}</td>
                                    <td><span className="badge bg-success">{s.hadir}</span></td>
                                    <td><span className="badge bg-danger">{s.bolos}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </ProtectedRoute>
    );
}
