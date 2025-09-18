"use client";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db, auth } from "../../lib/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import ProtectedRoute from "../../components/ProtectedRoute";
import Sidebar from "../../components/Sidebar";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "siswa", kelasId: "", rfid: "" });

  const fetchUsers = async () => {
    const snap = await getDocs(collection(db, "users"));
    setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleAddUser = async () => {
    if (!form.name || !form.email || !form.password) return alert("Nama, email, dan password wajib diisi");
    if (!/\S+@\S+\.\S+/.test(form.email)) return alert("Email tidak valid");
    if (form.password.length < 6) return alert("Password minimal 6 karakter");

    try {
      const res = await fetch("/api/adminUsers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json().catch(() => ({ error: "Response bukan JSON" }));
      if (!res.ok) throw new Error(data.error || "Gagal tambah user");

      alert("User berhasil ditambahkan!");
      setForm({ name: "", email: "", password: "", role: "siswa", kelasId: "", rfid: "" });
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert("Gagal tambah user: " + err.message);
    }
  };

  const handleUpdateUser = async () => {
    if (editingUser.password && editingUser.password.length < 6) return alert("Password minimal 6 karakter");

    try {
      const res = await fetch("/api/adminUsers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingUser),
      });

      const data = await res.json().catch(() => ({ error: "Response bukan JSON" }));
      if (!res.ok) throw new Error(data.error || "Gagal update user");

      alert("User berhasil diupdate!");
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert("Gagal update user: " + err.message);
    }
  };

  const handleDeleteUser = async (uid) => {
    if (!confirm("Hapus user ini?")) return;

    try {
      const res = await fetch("/api/adminUsers", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid }),
      });

      const data = await res.json().catch(() => ({ error: "Response bukan JSON" }));
      if (!res.ok) throw new Error(data.error || "Gagal hapus user");

      alert("User berhasil dihapus!");
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert("Gagal hapus user: " + err.message);
    }
  };

  const handleResetPassword = async (email) => {
    if (!confirm(`Kirim link reset password ke ${email}?`)) return;
    try {
      await sendPasswordResetEmail(auth, email);
      alert(`Link reset password berhasil dikirim ke ${email}`);
    } catch (err) {
      console.error(err);
      alert("Gagal kirim reset password: " + err.message);
    }
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ProtectedRoute allowedRoles={["admin","guru"]}>
      <div className="d-flex">
        <Sidebar />
        <div className="flex-grow-1 p-4" style={{ marginLeft: "220px" }}>
          <h2 className="mb-4">CRUD Users Admin/Guru</h2>

          {/* Form Tambah User */}
          {!editingUser && (
            <div className="card p-3 mb-4">
              <input className="form-control mb-2" placeholder="Nama" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              <input className="form-control mb-2" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              <input type="password" className="form-control mb-2" placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
              <select className="form-control mb-2" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                <option value="siswa">Siswa</option>
                <option value="guru">Guru</option>
                <option value="admin">Admin</option>
              </select>
              {form.role === "siswa" && <>
                <input className="form-control mb-2" placeholder="Kelas ID" value={form.kelasId} onChange={e => setForm({ ...form, kelasId: e.target.value })} />
                <input className="form-control mb-2" placeholder="RFID" value={form.rfid} onChange={e => setForm({ ...form, rfid: e.target.value })} />
              </>}
              <button className="btn btn-success" onClick={handleAddUser}>Tambah User</button>
            </div>
          )}

                {/* Form Edit User */}
          {editingUser && (
            <div className="card p-3 mb-4 border-primary">
              <h5>Edit User: {editingUser.name}</h5>
              <input className="form-control mb-2" placeholder="Nama" value={editingUser.name} onChange={e => setEditingUser({ ...editingUser, name: e.target.value })} />
              <input className="form-control mb-2" placeholder="Email" value={editingUser.email} onChange={e => setEditingUser({ ...editingUser, email: e.target.value })} />
              <input type="password" className="form-control mb-2" placeholder="Password baru (opsional)" value={editingUser.password || ""} onChange={e => setEditingUser({ ...editingUser, password: e.target.value })} />
              <select className="form-control mb-2" value={editingUser.role} onChange={e => setEditingUser({ ...editingUser, role: e.target.value })}>
                <option value="siswa">Siswa</option>
                <option value="guru">Guru</option>
                <option value="admin">Admin</option>
              </select>
              {editingUser.role === "siswa" && <>
                <input className="form-control mb-2" placeholder="Kelas ID" value={editingUser.kelasId || ""} onChange={e => setEditingUser({ ...editingUser, kelasId: e.target.value })} />
                <input className="form-control mb-2" placeholder="RFID" value={editingUser.rfid || ""} onChange={e => setEditingUser({ ...editingUser, rfid: e.target.value })} />
              </>}
              <button className="btn btn-primary me-2" onClick={handleUpdateUser}>Simpan</button>
              <button className="btn btn-secondary" onClick={() => setEditingUser(null)}>Batal</button>
            </div>
          )}

          {/* Search */}
          <input
            className="form-control mb-3"
            placeholder="Cari user (nama, email, role)"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />

          {/* Tabel Users */}
          <div className="table-responsive">
            <table className="table table-bordered table-hover">
              <thead className="table-light">
                <tr>
                  <th>Nama</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Kelas</th>
                  <th>RFID</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center">Tidak ada data</td>
                  </tr>
                ) : filteredUsers.map(u => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.role}</td>
                    <td>{u.kelasId || "-"}</td>
                    <td>{u.rfid || "-"}</td>
                    <td>
                      <button className="btn btn-warning btn-sm me-2" onClick={() => setEditingUser(u)}>Edit</button>
                      <button className="btn btn-danger btn-sm me-2" onClick={() => handleDeleteUser(u.uid)}>Hapus</button>
                      <button className="btn btn-info btn-sm" onClick={() => handleResetPassword(u.email)}>Reset Password</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
