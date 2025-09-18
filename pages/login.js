"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Ambil role dari Firestore
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();

      if (!userData?.role) {
        alert("Role belum ditentukan. Hubungi admin!");
        setLoading(false);
        return;
      }

      // Redirect berdasarkan role
      if (userData.role === "siswa") {
        router.push("/students/dashboard");
      } else if (["admin", "guru"].includes(userData.role)) {
        router.push("/admin/dashboard");
      } else {
        alert("Role tidak dikenali");
      }

    } catch (err) {
      console.error(err);
      alert("Login gagal! Periksa email/password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-5">
          <div className="card shadow-sm p-4">
            <h3 className="mb-4 text-center">Login Sistem Sekolah</h3>
            <form onSubmit={handleLogin}>
              <input
                type="email"
                className="form-control mb-3"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                className="form-control mb-3"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button className="btn btn-primary w-100" type="submit" disabled={loading}>
                {loading ? "Memuat..." : "Login"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
