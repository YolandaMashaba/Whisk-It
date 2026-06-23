import React, {  } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, AppLayout } from '@/components/Index';
import { Login, Register, StaffLogin, Dashboard, Kitchen, SalesTerminal } from '@/views/Index';

export default function AppNavigation() {
    return (
        <Routes>
            <Route element={<AppLayout />}>
                <Route index element={<SalesTerminal />} />
                <Route path="login" element={<Login />} />
                <Route path="staff/login" element={<StaffLogin />} />
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

