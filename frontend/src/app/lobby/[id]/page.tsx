"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSocket } from '@/hooks/useSocket';

interface Player {
    id: string;
    socketId: string;
}

interface Room {
    id: string;
    hostId: string;
    players: Player[];
}

export default function RoomPage() {
    const { id } = useParams(); // Room ID from URL
    const router = useRouter();
    const socket = useSocket();
    const [room, setRoom] = useState<Room | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!socket) return;

        // Listen for updates
        socket.on('playerJoined', (updatedRoom: Room) => {
            console.log("Player joined", updatedRoom);
            setRoom(updatedRoom);
        });

        socket.on('playerLeft', (updatedRoom: Room) => {
            setRoom(updatedRoom);
        });

        // Join the room
        // Assuming we are "myself" - in real app, userId comes from Auth Context
        const userId = sessionStorage.getItem('userId') || `user_${Math.floor(Math.random() * 1000)}`;

        socket.emit('joinRoom', { roomId: id, userId }, (response: any) => {
            if (response.event === 'error') {
                setError(response.data);
            } else if (response.event === 'roomJoined') {
                setRoom(response.data);
            }
        });

        return () => {
            const userId = sessionStorage.getItem('userId');
            if (userId) {
                socket.emit('leaveRoom', { roomId: id, userId });
            }
            socket.off('playerJoined');
            socket.off('playerLeft');
        };
    }, [socket, id]);

    if (error) {
        return (
            <div className="flex h-screen w-full flex-col items-center justify-center bg-zinc-950 text-white">
                <h1 className="text-2xl text-red-500">Error: {error}</h1>
                <button onClick={() => router.push('/lobby')} className="mt-4 text-blue-400 hover:underline">
                    Back to Lobby
                </button>
            </div>
        );
    }

    if (!room) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-zinc-950 text-white">
                Loading Room...
            </div>
        );
    }

    return (
        <div className="flex h-screen w-full flex-col items-center bg-zinc-950 p-8 text-white">
            <h1 className="text-3xl font-bold">Room: {room.id}</h1>
            <p className="mb-8 text-zinc-400">Host: {room.hostId}</p>

            <div className="w-full max-w-md rounded-lg border border-zinc-800 bg-zinc-900 p-6">
                <h2 className="mb-4 text-xl font-semibold">Players ({room.players.length})</h2>
                <ul className="space-y-2">
                    {room.players.map((p) => (
                        <li key={p.socketId} className="flex items-center gap-2 rounded-md bg-zinc-800 p-2">
                            <div className="h-2 w-2 rounded-full bg-green-500"></div>
                            <span className="text-sm text-zinc-300">{p.id === 'myself' ? 'Me' : p.id} ({p.socketId.slice(0, 4)})</span>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="mt-8">
                <button className="rounded-md bg-green-600 px-8 py-3 font-bold hover:bg-green-500">
                    START GAME
                </button>
            </div>
        </div>
    );
}
