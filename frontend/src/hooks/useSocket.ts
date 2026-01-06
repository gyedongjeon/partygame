import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:4000';

export const useSocket = () => {
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        const socketInstance = io(SOCKET_URL, {
            transports: ['websocket'],
            withCredentials: true, // Important for cookies (JWT)
            autoConnect: true,
        });

        socketInstance.on('connect', () => {
            console.log('Connected to WebSocket server');
        });

        socketInstance.on('disconnect', () => {
            console.log('Disconnected from WebSocket server');
        });

        setSocket(socketInstance);

        return () => {
            socketInstance.disconnect();
        };
    }, []);

    return socket;
};
