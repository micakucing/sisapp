// components/ProtectedRoute.js
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function ProtectedRoute({ allowedRoles, children }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const checkRole = async () => {
      const user = auth.currentUser;
      if (!user) {
        router.push("/");
        return;
      }

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();

      if (!userData?.role) {
        alert("Role belum ditentukan. Hubungi admin!");
        router.push("/");
        return;
      }

      if (allowedRoles.includes(userData.role)) {
        setHasAccess(true);
      } else if (userData.role === "siswa") {
        router.push("/student/dashboard");
      } else {
        router.push("/");
      }

      setLoading(false);
    };

    checkRole();
  }, [router, allowedRoles]);

  if (loading) return <p>Loading...</p>;
  if (!hasAccess) return null;

  return <>{children}</>;
}
