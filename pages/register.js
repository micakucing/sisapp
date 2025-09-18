import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';


export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { signup } = useAuth();
    const router = useRouter();


    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        try {
            await signup(email, password);
            router.push('/dashboard');
        } catch (err) {
            setError(err.message);
        }
    }


    return (
        <div className="col-md-6 offset-md-3">
            <div className="card p-4">
                <h2 className="mb-3">Register</h2>
                {error && <div className="alert alert-danger">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <input type="email" className="form-control" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
                    </div>
                    <div className="mb-3">
                        <input type="password" className="form-control" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
                    </div>
                    <button className="btn btn-primary w-100">Daftar</button>
                </form>
            </div>
        </div>
    );
}