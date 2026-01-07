import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Helper to read cookies in browser
const getCookie = (name: string) => {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
    return null;
};

// Singleton instance with dynamic auth
const socket: Socket = io(SOCKET_URL, {
    transports: ['websocket'],
    withCredentials: true,
    autoConnect: true,
    auth: (cb) => {
        const token = getCookie('auth_token');
        cb({ token });
    }
});

export const useSocket = () => {

    useEffect(() => {
        if (!socket.connected) {
            socket.on('connect', () => {
                console.log('Connected to WebSocket server');
            });
            socket.on('disconnect', () => {
                console.log('Disconnected from WebSocket server');
            });
        }

        return () => {
            // Do NOT disconnect on unmount to keep connection alive across pages
            // OR manage it carefully. For now, keeping it alive is safer for this bug.
            // If we really want to disconnect, we should do it in a layout or truly global context.
            // socket.disconnect(); 
        };
    }, []);

    return socket;
};
