'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSocket } from '@/hooks/useSocket';

export default function LobbyPage() {
    const router = useRouter();
    const socket = useSocket();
    const [joinRoomId, setJoinRoomId] = useState('');
    const [userId, setUserId] = useState<string | null>(null);
    const [userName, setUserName] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch current user
        const fetchUser = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/v1/users/me`, { credentials: 'include' });
                if (res.ok) {
                    const user = await res.json();
                    // Use googleId (or email as fallback) as the unique user ID
                    const uid = user.googleId || user.email || `user_${Math.floor(Math.random() * 1000)}`;
                    const name = user.displayName || user.email?.split('@')[0] || `User_${Math.floor(Math.random() * 1000)}`;

                    setUserId(uid);
                    setUserName(name);
                    sessionStorage.setItem('userId', uid);
                    setLoading(false);
                } else {
                    console.error('Failed to fetch user', res.status);
                    router.push('/');
                }
            } catch (error) {
                console.error('Auth error', error);
                router.push('/');
            }
        };
        fetchUser();
    }, [router]);

    const handleCreateRoom = () => {
        console.log('[LobbyPage] handleCreateRoom clicked');

        if (!socket) {
            console.error('[LobbyPage] Socket is null/undefined');
            return;
        }
        if (!userId) {
            console.error('[LobbyPage] UserID is null/undefined');
            return;
        }
        if (!userName) {
            console.error('[LobbyPage] UserName is null/undefined');
            return;
        }

        console.log('[LobbyPage] Emitting createRoom with userId:', userId, 'name:', userName);
        socket.emit('createRoom', { userId, name: userName }, (response: { type: string; data: { id: string } }) => {
            console.log('[LobbyPage] createRoom response:', response);
            if (response.type === 'roomCreated') {
                router.push(`/lobby/${response.data.id}`);
            }
        });
    };

    const handleJoinRoom = (e: React.FormEvent) => {
        e.preventDefault();
        if (!socket || !joinRoomId || !userId) return;

        // We navigate first, the room page will handle the actual join event
        router.push(`/lobby/${joinRoomId}`);
    };

    if (loading) {
        return <div className="flex h-screen w-full items-center justify-center bg-zinc-950 text-white">Loading...</div>;
    }

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-zinc-950 text-white">
            <h1 className="mb-8 text-4xl font-bold">Lobby</h1>
            <p className="mb-4 text-zinc-400">Welcome, {userName || userId}</p>

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
