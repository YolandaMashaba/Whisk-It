import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Input } from '../components/Index';

export default function LoginPage() {
    const { login, isAuthenticated, user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const from = location.state?.from?.pathname;

    if (isAuthenticated) {
        if (from && from !== '/login') {
            return <Navigate to={from} replace />;
        }
        const fallback = user?.is_admin || user?.role === 'admin' ? '/admin' : '/kitchen';
        return <Navigate to={fallback} replace />;
    }

    async function onSubmit(e) {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await login(username, password);
            let dest;
            if (from && from !== '/login') {
                if (from.startsWith('/admin') && !res.user.is_admin && res.user.role !== 'admin') {
                    dest = '/kitchen';
                } else {
                    dest = from;
                }
            } else {
                dest = res.user.is_admin || res.user.role === 'admin' ? '/admin' : '/kitchen';
            }
            navigate(dest, { replace: true });
        } catch (err) {
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-12">
            <div>
                <h1 className="text-2xl font-bold text-[#8b4513]">Staff login</h1>
                <p className="mt-1 text-sm text-[#a0826d]">
                    Admins use the Admin dashboard. Kitchen and counter staff use Kitchen after signing in.
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
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                />
                {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
                <Button type="submit" variant="primary" loading={loading} className="w-full">
                    Sign in
                </Button>
                <p className="mt-4 text-center text-sm text-[#a0826d]">
                    New here?{' '}
                    <Link to="/register" className="font-semibold text-[#8b4513] underline">
                        Create an account
                    </Link>
                </p>
                <p className="mt-2 text-center text-xs text-[#a0826d]">
                    Seed users (after running <code className="rounded bg-amber-50 px-1">server/db/schema.sql</code>):{' '}
                    <strong>admin</strong> / admin123 · <strong>kitchen</strong> / kitchen123
                </p>
            </form>
        </div>
    );
}
