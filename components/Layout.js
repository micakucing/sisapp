import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useRouter } from "next/router";

export default function Layout({ children }) {
    const { user, logout } = useAuth();
    const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login"); // arahkan ke halaman login setelah logout
    } catch (err) {
      console.error("Gagal logout:", err);
      alert("Gagal logout: " + err.message);
    }
  };
    return (
        <div className="bg-light min-vh-100 d-flex flex-column">
            <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
                <div className="container">
                    <div className="collapse navbar-collapse">
                        <ul className="navbar-nav ms-auto">
                            <li className="nav-item"><Link href="/" className="nav-link">Home</Link></li>
                            {user && <li className="nav-item"><Link href="/dashboard" className="nav-link">Dashboard</Link></li>}
                            {user && <li className="nav-item"><Link href="/students" className="nav-link">Students</Link></li>}
                            {!user && <li className="nav-item"><Link href="/login" className="nav-link">Login</Link></li>} 
                            {user && <li className="nav-item"><button className="btn btn-sm btn-light ms-2" onClick={handleLogout}>Logout</button></li>}
                        </ul>
                    </div>
                </div>
            </nav>


            <main className="container-fluid">{children}</main>


            <footer className="bg-dark text-white text-center py-3 mt-auto">
                © {new Date().getFullYear()} SIS
            </footer>
        </div>
    );
}