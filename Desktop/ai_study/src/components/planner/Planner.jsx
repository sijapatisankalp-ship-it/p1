import React, { useState } from 'react';
import { Plus, Trash2, CheckCircle, Circle, Clock, Calendar, Bell, BellOff } from 'lucide-react';
import { useTaskStore } from '../../store/useTaskStore';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

export default function Planner() {
    const { tasks, addTask, toggleTask, deleteTask } = useTaskStore();
    const [isAdding, setIsAdding] = useState(false);
    const [newTask, setNewTask] = useState({ title: '', startTime: '', duration: '60' });
    const [notificationEnabled, setNotificationEnabled] = useState(Notification.permission === 'granted');

    const handleAdd = (e) => {
        e.preventDefault();
        if (!newTask.title || !newTask.startTime) return;
        addTask(newTask);
        setNewTask({ title: '', startTime: '', duration: '60' });
        setIsAdding(false);

        // Haptic feedback
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
    };

    const handleToggle = (id) => {
        toggleTask(id);
        if (navigator.vibrate) {
            navigator.vibrate([30, 20, 30]);
        }
    };

    const enableNotifications = async () => {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            setNotificationEnabled(permission === 'granted');
        }
    };

    const today = new Date();
    const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    return (
        <div className="h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 overflow-hidden flex flex-col">
            {/* iOS-style Header */}
            <div className="bg-slate-900/80 backdrop-blur-xl border-b border-white/10 px-6 py-4 sticky top-0 z-20">
                <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-indigo-400" />
                        <h2 className="text-2xl font-bold text-white">Today's Schedule</h2>
                    </div>
                    <button
                        onClick={enableNotifications}
                        className={clsx(
                            "p-2 rounded-full transition-all",
                            notificationEnabled
                                ? "bg-green-500/20 text-green-400"
                                : "bg-slate-700/50 text-slate-400 hover:bg-slate-700"
                        )}
                        title={notificationEnabled ? "Notifications Enabled" : "Enable Notifications"}
                    >
                        {notificationEnabled ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
                    </button>
                </div>
                <p className="text-sm text-slate-400">{dateStr}</p>
            </div>

            {/* Tasks Area */}
            <div className="flex-1 overflow-y-auto px-4 py-4 pb-24">
                {/* Add Task Button */}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsAdding(true)}
                    className="w-full mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-4 py-3 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg"
                >
                    <Plus className="w-5 h-5" />
                    <span className="font-medium">Add New Task</span>
                </motion.button>

                {/* Add Task Form */}
                <AnimatePresence>
                    {isAdding && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, scale: 0.95 }}
                            animate={{ opacity: 1, height: 'auto', scale: 1 }}
                            exit={{ opacity: 0, height: 0, scale: 0.95 }}
                            transition={{ type: "spring", duration: 0.3 }}
                            className="mb-6 bg-slate-800/60 backdrop-blur-xl rounded-3xl p-5 border border-white/10 overflow-hidden"
                        >
                            <form onSubmit={handleAdd} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">Task Name</label>
                                    <input
                                        type="text"
                                        value={newTask.title}
                                        onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                        className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-white placeholder:text-slate-600 transition-all"
                                        placeholder="e.g., Study Physics Chapter 1"
                                        autoFocus
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">Start Time</label>
                                        <input
                                            type="time"
                                            value={newTask.startTime}
                                            onChange={(e) => setNewTask({ ...newTask, startTime: e.target.value })}
                                            className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-white transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">Duration (min)</label>
                                        <input
                                            type="number"
                                            value={newTask.duration}
                                            onChange={(e) => setNewTask({ ...newTask, duration: e.target.value })}
                                            className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-white transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="button"
                                        onClick={() => setIsAdding(false)}
                                        className="flex-1 px-4 py-3 text-slate-400 hover:text-white transition-colors font-medium rounded-2xl hover:bg-white/5"
                                    >
                                        Cancel
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-2xl transition-colors font-medium shadow-lg"
                                    >
                                        Add Task
                                    </motion.button>
                                </div>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Tasks List */}
                <div className="space-y-3">
                    {tasks.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-20"
                        >
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-600/20 flex items-center justify-center mx-auto mb-4">
                                <Clock className="w-10 h-10 text-indigo-400" />
                            </div>
                            <p className="text-slate-400 text-sm">No tasks scheduled yet</p>
                            <p className="text-slate-500 text-xs mt-1">Start your day by adding one!</p>
                        </motion.div>
                    ) : (
                        tasks.map((task, index) => (
                            <motion.div
                                key={task.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                layout
                                whileHover={{ scale: 1.01, y: -2 }}
                                className={clsx(
                                    "bg-slate-800/60 backdrop-blur-sm rounded-3xl p-4 flex items-center gap-4 group border-l-4 transition-all cursor-pointer",
                                    task.completed
                                        ? "border-l-green-500/30 opacity-60"
                                        : "border-l-indigo-500 hover:bg-slate-800/80 hover:shadow-xl hover:shadow-indigo-500/10"
                                )}
                            >
                                <motion.button
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleToggle(task.id)}
                                    className={clsx(
                                        "p-1 rounded-full transition-all flex-shrink-0",
                                        task.completed
                                            ? "text-green-400"
                                            : "text-slate-500 hover:text-indigo-400"
                                    )}
                                >
                                    {task.completed ? (
                                        <CheckCircle className="w-7 h-7" />
                                    ) : (
                                        <Circle className="w-7 h-7" />
                                    )}
                                </motion.button>

                                <div className="flex-1 min-w-0">
                                    <h3 className={clsx(
                                        "text-base font-medium",
                                        task.completed ? "line-through text-slate-500" : "text-white"
                                    )}>
                                        {task.title}
                                    </h3>
                                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {task.startTime}
                                        </span>
                                        <span>•</span>
                                        <span>{task.duration} min</span>
                                    </div>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => deleteTask(task.id)}
                                    className="opacity-0 group-hover:opacity-100 p-2 text-slate-500 hover:text-red-400 transition-all rounded-full hover:bg-red-500/10"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </motion.button>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
