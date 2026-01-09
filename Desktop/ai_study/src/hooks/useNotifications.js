import { useEffect } from 'react';
import { useTaskStore } from '../store/useTaskStore';

export function useNotifications() {
    const tasks = useTaskStore((state) => state.tasks);

    useEffect(() => {
        // Request notification permission on mount
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    useEffect(() => {
        const notifiedTasks = new Set();

        const checkTasks = () => {
            if (Notification.permission !== 'granted') return;

            const now = new Date();
            const currentTime = now.toTimeString().slice(0, 5); // HH:MM format

            tasks.forEach(task => {
                const taskKey = `${task.id}-${task.startTime}`;

                // Check if it's time to notify and we haven't notified yet
                if (!task.completed && task.startTime === currentTime && !notifiedTasks.has(taskKey)) {
                    // Play notification sound
                    try {
                        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZJQ==');
                        audio.play().catch(() => { });
                    } catch (e) { }

                    // Send notification
                    const notification = new Notification('⏰ Time to Study!', {
                        body: `${task.title}\nDuration: ${task.duration} minutes`,
                        icon: '/vite.svg',
                        badge: '/vite.svg',
                        tag: taskKey,
                        requireInteraction: true,
                        vibrate: [200, 100, 200],
                        actions: [
                            { action: 'start', title: 'Start Now' },
                            { action: 'snooze', title: 'Snooze 5min' }
                        ]
                    });

                    // Mark as notified
                    notifiedTasks.add(taskKey);

                    // Handle notification click
                    notification.onclick = () => {
                        window.focus();
                        notification.close();
                    };

                    // Auto-dismiss after 10 seconds
                    setTimeout(() => {
                        notification.close();
                    }, 10000);
                }
            });

            // Clean up old notifications from set
            const currentTaskKeys = tasks.map(t => `${t.id}-${t.startTime}`);
            Array.from(notifiedTasks).forEach(key => {
                if (!currentTaskKeys.includes(key)) {
                    notifiedTasks.delete(key);
                }
            });
        };

        // Check every 10 seconds for more accuracy
        const interval = setInterval(checkTasks, 10000);

        // Initial check
        checkTasks();

        return () => clearInterval(interval);
    }, [tasks]);
}
