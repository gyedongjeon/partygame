"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSocket } from '@/hooks/useSocket';

export default function LobbyPage() {
    const router = useRouter();
    const socket = useSocket();
    const [joinRoomId, setJoinRoomId] = useState('');

    const handleCreateRoom = () => {
        if (!socket) return;
        const userId = `user_${Math.floor(Math.random() * 1000)}`;
        // For MVP, user ID is just socket ID or we can fetch from API. 
        // Sending dummy userId for now, backend will use socket ID mostly.
        socket.emit('createRoom', { userId }, (response: { event: string; data: { id: string } }) => {
            if (response.event === 'roomCreated') {
                // Store userId in sessionStorage to reuse in RoomPage
                sessionStorage.setItem('userId', userId);
                router.push(`/lobby/${response.data.id}`);
            }
        });
    };

    const handleJoinRoom = (e: React.FormEvent) => {
        e.preventDefault();
        if (!socket || !joinRoomId) return;

        const userId = `user_${Math.floor(Math.random() * 1000)}`;
        sessionStorage.setItem('userId', userId);
        // We navigate first, the room page will handle the actual join event
        router.push(`/lobby/${joinRoomId}`);
    };

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-zinc-950 text-white">
            <h1 className="mb-8 text-4xl font-bold">Lobby</h1>

            <div className="flex flex-col gap-4">
                <button
                    onClick={handleCreateRoom}
                    className="rounded-md bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-500"
                >
                    Create New Room
                </button>

                <div className="flex items-center gap-2">
                    <div className="h-px flex-1 bg-zinc-800"></div>
                    <span className="text-zinc-500">OR</span>
                    <div className="h-px flex-1 bg-zinc-800"></div>
                </div>

                <form onSubmit={handleJoinRoom} className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Enter Room Code"
                        value={joinRoomId}
                        onChange={(e) => setJoinRoomId(e.target.value)}
                        className="rounded-md border border-zinc-700 bg-zinc-900 px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    <button
                        type="submit"
                        className="rounded-md bg-zinc-800 px-4 py-2 font-semibold text-white hover:bg-zinc-700"
                    >
                        Join
                    </button>
                </form>
            </div>
        </div>
    );
}
