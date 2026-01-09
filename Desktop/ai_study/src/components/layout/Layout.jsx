import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useNotifications } from '../../hooks/useNotifications';

export default function Layout() {
    useNotifications();

    return (
        <div className="flex h-screen w-full bg-slate-900 text-slate-100 overflow-hidden font-sans">
            {/* Sidebar - Hidden on mobile to prevent overlap */}
            <div className="hidden md:block">
                <Sidebar />
            </div>
            <main className="flex-1 h-full overflow-y-auto relative z-0">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-pink-500/5 pointer-events-none" />
                <Outlet />
            </main>
        </div>
    );
}
