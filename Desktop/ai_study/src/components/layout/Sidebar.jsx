import React from 'react';
import { NavLink } from 'react-router-dom';
import { Calendar, BrainCircuit, Settings, BookOpen } from 'lucide-react';
import clsx from 'clsx';

const NavItem = ({ to, icon: Icon, label }) => (
    <NavLink
        to={to}
        className={({ isActive }) =>
            clsx(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                isActive
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
            )
        }
    >
        <Icon className="w-5 h-5" />
        <span className="font-medium">{label}</span>
    </NavLink>
);

export default function Sidebar() {
    return (
        <div className="w-64 h-full bg-slate-950 border-r border-white/5 flex flex-col p-6 z-10 glass-panel">
            <div className="flex items-center gap-3 mb-10">
                <img src="/logo.png" alt="NERMEXITY" className="w-10 h-10 object-contain" />
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
                    NERMEXITY
                </h1>
            </div>

            <nav className="space-y-2 flex-1">
                <NavItem to="/planner" icon={Calendar} label="Daily Planner" />
                <NavItem to="/doubt-room" icon={BrainCircuit} label="Doubt Room" />
            </nav>

            <div className="mt-auto">
                <button className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-white transition-colors w-full">
                    <Settings className="w-5 h-5" />
                    <span>Settings</span>
                </button>
            </div>
        </div>
    );
}
