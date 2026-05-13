import React, { useState, useEffect } from 'react';
import { ShoppingCart, Utensils } from 'lucide-react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute, AppLayout } from './components/Index';
import { Login, Register, Dashboard, Kitchen, SalesTerminal } from './views/Index';

export default function AppNavigation() {
    return (
        <Routes>
            <Route element={<AppLayout />}>
                <Route index element={<SalesTerminal />} />
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
                <Route
                    path="kitchen"
                    element={
                        <ProtectedRoute>
                            <Kitchen />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="admin"
                    element={
                        <ProtectedRoute adminOnly>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
        </Routes>
    );
}

