import React, { useState, useEffect } from 'react';
import { ShoppingCart, Utensils } from 'lucide-react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminDashboard from './pages/Admin';
import LoginPage from './views/LoginPage';
import RegisterPage from './views/RegisterPage';
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

