import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { db } from '../config/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';

export const useTaskStore = create(
    persist(
        (set, get) => ({
            tasks: [],
            useFirebase: !!db, // Auto-detect if Firebase is configured

            // Initialize Firestore listener
            initFirestore: () => {
                if (!db) return;

                const q = query(collection(db, 'tasks'), orderBy('startTime', 'asc'));
                onSnapshot(q, (snapshot) => {
                    const tasks = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    set({ tasks });
                });
            },

            addTask: async (task) => {
                const newTask = {
                    ...task,
                    completed: false,
                    createdAt: new Date().toISOString()
                };

                if (db) {
                    // Use Firestore
                    try {
                        await addDoc(collection(db, 'tasks'), newTask);
                    } catch (error) {
                        console.error('Error adding task to Firestore:', error);
                    }
                } else {
                    // Fallback to localStorage
                    set((state) => ({
                        tasks: [...state.tasks, {
                            id: Date.now().toString(),
                            ...newTask
                        }].sort((a, b) => a.startTime.localeCompare(b.startTime))
                    }));
                }
            },

            toggleTask: async (id) => {
                if (db) {
                    // Use Firestore
                    try {
                        const task = get().tasks.find(t => t.id === id);
                        const taskRef = doc(db, 'tasks', id);
                        await updateDoc(taskRef, { completed: !task.completed });
                    } catch (error) {
                        console.error('Error updating task in Firestore:', error);
                    }
                } else {
                    // Fallback to localStorage
                    set((state) => ({
                        tasks: state.tasks.map((t) =>
                            t.id === id ? { ...t, completed: !t.completed } : t
                        )
                    }));
                }
            },

            deleteTask: async (id) => {
                if (db) {
                    // Use Firestore
                    try {
                        await deleteDoc(doc(db, 'tasks', id));
                    } catch (error) {
                        console.error('Error deleting task from Firestore:', error);
                    }
                } else {
                    // Fallback to localStorage
                    set((state) => ({
                        tasks: state.tasks.filter((t) => t.id !== id)
                    }));
                }
            },
        }),
        {
            name: 'study-planner-storage',
            // Only persist to localStorage if not using Firebase
            storage: {
                getItem: (name) => {
                    if (db) return null; // Don't use localStorage with Firebase
                    return localStorage.getItem(name);
                },
                setItem: (name, value) => {
                    if (!db) localStorage.setItem(name, value);
                },
                removeItem: (name) => {
                    if (!db) localStorage.removeItem(name);
                },
            },
        }
    )
);
