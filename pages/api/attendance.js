import { db } from '../../lib/firebase';
import { collection, addDoc, serverTimestamp, getDocs, query, where } from 'firebase/firestore';

export default async function handler(req, res){
  if(req.method !== 'POST'){
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { rfid } = req.body;

    // cari siswa dengan RFID cocok
    const q = query(collection(db, 'students'), where('rfid', '==', rfid));
    const snapshot = await getDocs(q);

    if(snapshot.empty){
      return res.status(404).json({ error: 'RFID tidak terdaftar' });
    }

    const student = snapshot.docs[0];
    await addDoc(collection(db, 'attendance'), {
      studentId: student.id,
      rfid,
      status: 'Hadir',
      timestamp: serverTimestamp()
    });

    return res.status(200).json({ message: 'Absensi berhasil', student: student.data() });
  } catch (err){
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}
