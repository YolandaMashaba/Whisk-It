import { NavLink, Outlet } from 'react-router-dom';
import { ChefHat, CupSoda, LayoutDashboard, LogIn, LogOut, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

function navClass({ isActive }) {
    return [
        'inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition-colors no-underline',
        isActive ? 'bg-[#8b4513] text-white' : 'text-[#8b4513] hover:bg-amber-100/80',
    ].join(' ');
}

export default function AppLayout() {
    const { isAuthenticated, isAdmin, logout, user } = useAuth();

    return (
        <div className="flex min-h-screen flex-col bg-[#fefcf8]">
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-900/15 bg-[#fffdf9] px-4 py-3">
                <NavLink to="/" className="text-lg font-extrabold text-[#8b4513] no-underline">
                    Whisk-It
                </NavLink>
                <nav className="flex flex-wrap items-center gap-1">
                    <NavLink to="/" className={navClass} end>
                        <CupSoda size={18} aria-hidden />
                        Sales
                    </NavLink>
                    <NavLink to="/kitchen" className={navClass}>
                        <ChefHat size={18} aria-hidden />
                        Kitchen
                    </NavLink>
                    {isAdmin && (
                        <NavLink to="/admin" className={navClass}>
                            <LayoutDashboard size={18} aria-hidden />
                            Admin
                        </NavLink>
                    )}
                    {!isAuthenticated ? (
                        <>
                            <NavLink to="/register" className={navClass}>
                                <UserPlus size={18} aria-hidden />
                                Register
                            </NavLink>
                            <NavLink to="/login" className={navClass}>
                                <LogIn size={18} aria-hidden />
                                Staff login
                            </NavLink>
                        </>
                    ) : (
                        <button
                            type="button"
                            onClick={logout}
                            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-[#8b4513] hover:bg-amber-100/80"
                        >
                            <LogOut size={18} aria-hidden />
                            {user?.username}
                        </button>
                    )}
                </nav>
            </header>
            <Outlet />
        </div>
    );
}
