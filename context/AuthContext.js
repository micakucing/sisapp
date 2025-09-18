import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';


const AuthContext = createContext();


export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);


    const signup = (email, password) => createUserWithEmailAndPassword(auth, email, password);
    const login = (email, password) => signInWithEmailAndPassword(auth, email, password);
    const logout = () => signOut(auth);


    return (
        <AuthContext.Provider value={{ user, signup, login, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}


export const useAuth = () => useContext(AuthContext);