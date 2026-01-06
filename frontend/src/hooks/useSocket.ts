import { useEffect, useMemo } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:4000';

export const useSocket = () => {
    const socket: Socket = useMemo(() => {
        return io(SOCKET_URL, {
            transports: ['websocket'],
            withCredentials: true, // Important for cookies (JWT)
            autoConnect: true,
        });
    }, []);

    useEffect(() => {
        socket.on('connect', () => {
            console.log('Connected to WebSocket server');
        });

        socket.on('disconnect', () => {
            console.log('Disconnected from WebSocket server');
        });

        return () => {
            socket.disconnect();
        };
    }, [socket]);

    return socket;
};
