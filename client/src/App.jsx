import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminDashboard from './views/AdminDashboard';
import KitchenDisplay from './views/KitchenDisplay';
import LoginPage from './views/LoginPage';
import RegisterPage from './views/RegisterPage';
import SalesTerminal from './views/SalesTerminal';
import './App.scss';

export default function App() {
    return (
        <Routes>
            <Route element={<AppLayout />}>
                <Route index element={<SalesTerminal />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />
                <Route
                    path="kitchen"
                    element={
                        <ProtectedRoute>
                            <KitchenDisplay />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="admin"
                    element={
                        <ProtectedRoute adminOnly>
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
        </Routes>
    );
}
