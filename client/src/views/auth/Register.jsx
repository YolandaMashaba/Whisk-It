import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button, Input } from '@/components/Index';

export default function Register() {
    const { register, isAuthenticated, user } = useAuth();
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    if (isAuthenticated) {
        const dest = user?.is_admin || user?.role === 'admin' ? '/admin' : '/kitchen';
        return <Navigate to={dest} replace />;
    }

    async function onSubmit(e) {
        e.preventDefault();
        setError('');
        if (password !== confirm) {
            setError('Passwords do not match');
            return;
        }
        setLoading(true);
        try {
            const res = await register(username, password);
            const dest = res.user?.is_admin || res.user?.role === 'admin' ? '/admin' : '/kitchen';
            navigate(dest, { replace: true });
        } catch (err) {
            setError(err.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-12">
            <div>
                <h1 className="text-2xl font-bold text-[#8b4513]">Create account</h1>
                <p className="mt-1 text-sm text-[#a0826d]">
                    New accounts are <strong>not</strong> admins. An existing admin can grant admin in the Admin →
                    Users tab.
                </p>
            </div>
            <form onSubmit={onSubmit} className="rounded-2xl border border-amber-900/10 bg-white p-6 shadow-md">
                <Input
                    label="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                    required
                />
                <Input
                    label="Password (min 8 characters)"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                />
                <Input
                    label="Confirm password"
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    autoComplete="new-password"
                    required
                />
                {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
                <Button type="submit" variant="primary" loading={loading} className="w-full">
                    Register
                </Button>
                <p className="mt-4 text-center text-sm text-[#a0826d]">
                    Already have an account?{' '}
                    <Link to="/login" className="font-semibold text-[#8b4513] underline">
                        Sign in
                    </Link>
                </p>
            </form>
        </div>
    );
}
