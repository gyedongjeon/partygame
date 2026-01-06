import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:4000';

// Singleton instance
const socket: Socket = io(SOCKET_URL, {
    transports: ['websocket'],
    withCredentials: true,
    autoConnect: true,
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
