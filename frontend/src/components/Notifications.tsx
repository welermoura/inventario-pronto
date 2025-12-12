import React, { useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { getWebSocketUrl } from '../utils/websocket';

const Notifications: React.FC = () => {
    const { user, token } = useAuth();

    useEffect(() => {
        if (!user || !token) return;

        const wsUrl = getWebSocketUrl(token);
        const socket = new WebSocket(wsUrl);

        socket.onopen = () => {
            console.log('WebSocket Connected');
        };

        socket.onmessage = (event) => {
            if (user.role === 'admin' || user.role === 'approver') {
                // Simple alert for now, could be a toast
                alert(`Notificação: ${event.data}`);
            }
        };

        socket.onclose = () => {
            console.log('WebSocket Disconnected');
        };

        socket.onerror = (error) => {
             console.error('WebSocket Error:', error);
        };

        return () => {
            socket.close();
        };
    }, [user, token]);

    return null; // Componente sem UI, apenas lógica
};

export default Notifications;
