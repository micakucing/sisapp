import { auth } from "../../lib/firebaseAdmin";
import { db } from "../../lib/firebase";
import { doc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";

export default async function handler(req, res) {
  try {
    if (req.method === "POST") {
      const { email, password, name, role, kelasId, rfid } = req.body;

      // Validasi
      if (!email || !password || !name || !role) {
        return res.status(400).json({ error: "Semua field wajib diisi" });
      }

      const userRecord = await auth.createUser({ email, password, displayName: name });

      await setDoc(doc(db, "users", userRecord.uid), {
        uid: userRecord.uid,
        name,
        email,
        role,
        kelasId: role === "siswa" ? kelasId : "",
        rfid: role === "siswa" ? rfid : "",
        createdAt: new Date(),
      });

      return res.status(200).json({ uid: userRecord.uid });
    }

    if (req.method === "PUT") {
      const { uid, email, password, name, role, kelasId, rfid } = req.body;
      if (!uid) return res.status(400).json({ error: "User UID wajib diisi" });

      const updateData = {};
      if (email) updateData.email = email;
      if (password) updateData.password = password;
      if (name) updateData.displayName = name;

      await auth.updateUser(uid, updateData);

      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, {
        name,
        email,
        role,
        kelasId: role === "siswa" ? kelasId : "",
        rfid: role === "siswa" ? rfid : "",
      });

      return res.status(200).json({ message: "User updated" });
    }

    if (req.method === "DELETE") {
      const { uid } = req.body;
      if (!uid) return res.status(400).json({ error: "User UID wajib diisi" });

      await auth.deleteUser(uid);
      await deleteDoc(doc(db, "users", uid));

      return res.status(200).json({ message: "User deleted" });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || "Server error" });
  }
}
