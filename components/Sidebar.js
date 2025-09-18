import Link from "next/link";
import { useRouter } from "next/router";
import { getAuth, signOut } from "firebase/auth";
import { useState, useEffect } from "react";

export default function Sidebar() {
  const router = useRouter();
  const auth = getAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  // cek ukuran layar
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 992); // lg breakpoint
      if (window.innerWidth >= 992) setIsOpen(true); // desktop always open
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const menu = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Kelas", href: "/classes" },
    { name: "Siswa", href: "/admin/students/siswa" },
    { name: "Absensi", href: "/attendance" },
    { name: "Rekap", href: "/reports" },
  ];

  return (
    <>
      {/* Hamburger button untuk mobile */}
      {isMobile && (
        <button
        style={{
          position: "absolute",
          right: "0px"
        }}
          className="btn btn-dark m-2"
          onClick={() => setIsOpen(!isOpen)}
        >
          ☰ Menu
        </button>
      )}

      {/* Sidebar */}
      <div
        className={`bg-dark text-light position-fixed vh-100 p-3 transition`}
        style={{
          width: "220px",
          zIndex: 1000,
          top: "0px",
          left: isOpen ? "0" : "-240px",
          transition: "left 0.3s ease",
        }}
      >
        <div className="mb-4">
          <h5>SIS Dashboard</h5>
        </div>
        <ul className="nav nav-pills flex-column mb-auto">
          {menu.map((item) => (
            <li className="nav-item" key={item.href}>
              <Link
                href={item.href}
                className={`nav-link text-light ${
                  router.pathname === item.href ? "active bg-primary" : ""
                }`}
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      
      </div>
    </>
  );
}
