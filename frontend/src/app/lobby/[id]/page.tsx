"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSocket } from '@/hooks/useSocket';

interface Player {
    id: string;
    socketId: string;
    name: string;
}

interface GameSettings {
    maxPlayers: number;
    imposterCount: number;
    timeLimitEnabled: boolean;
    timeLimitDuration: number;
}

interface Room {
    id: string;
    hostId: string;
    players: Player[];
    settings: GameSettings;
}

import { authFetch } from '@/utils/auth';

export default function RoomPage() {
    const { id } = useParams(); // Room ID from URL
    const router = useRouter();
    const socket = useSocket();
    const [room, setRoom] = useState<Room | null>(null);
    const [error, setError] = useState('');
    const [gameState, setGameState] = useState<'waiting' | 'playing' | 'finished'>('waiting');
    const [role, setRole] = useState<'imposter' | 'civilian' | null>(null);
    const [secret, setSecret] = useState('');
    const [userId, setUserId] = useState<string | null>(null);
    const [userName, setUserName] = useState<string>('');

    const [hasVoted, setHasVoted] = useState(false);
    const [winner, setWinner] = useState<'imposter' | 'civilians' | null>(null);
    const [imposterId, setImposterId] = useState('');

    useEffect(() => {
        // Initialize userId on client side to avoid hydration mismatch
        const storedUserId = sessionStorage.getItem('userId');
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setUserId(storedUserId);

        // Fetch current profile name
        authFetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/v1/users/me`)
            .then(res => res.json())
            .then(data => {
                setUserName(data.displayName || data.email?.split('@')[0] || 'Guest');
            })
            .catch(() => setUserName('Guest'));
    }, []);

    const [endTime, setEndTime] = useState<number | undefined>(undefined);
    const [timeLeft, setTimeLeft] = useState<number | null>(null);

    useEffect(() => {
        if (!endTime) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setTimeLeft(null);
            return;
        }

        const interval = setInterval(() => {
            const now = Date.now();
            const remaining = Math.max(0, Math.ceil((endTime - now) / 1000));
            setTimeLeft(remaining);

            if (remaining <= 0) {
                clearInterval(interval);
            }
        }, 500); // Check every 500ms for smoothness

        return () => clearInterval(interval);
    }, [endTime]);

    useEffect(() => {
        if (!socket) return;
        if (!userId) return; // Wait for userId to be loaded
        if (!userName) return; // Wait for userName to be loaded

        // Listen for updates
        socket.on('playerJoined', (updatedRoom: Room) => {
            console.log("Player joined", updatedRoom);
            setRoom(updatedRoom);
        });

        socket.on('playerLeft', (updatedRoom: Room) => {
            setRoom(updatedRoom);
        });

        socket.on('gameStarted', (data: { gameState: 'playing'; role: 'imposter' | 'civilian'; secret: string; endTime?: number }) => {
            console.log("Game Started", data);
            setGameState(data.gameState);
            setRole(data.role);
            setSecret(data.secret);
            setEndTime(data.endTime);
            setHasVoted(false); // Reset voting
            setWinner(null);
        });

        socket.on('voteAccepted', () => {
            setHasVoted(true);
        });

        socket.on('gameEnded', (result: { winner: 'imposter' | 'civilians'; imposterId: string }) => {
            setGameState('finished');
            setWinner(result.winner);
            setImposterId(result.imposterId);
        });

        socket.on('settingsUpdated', (newSettings: GameSettings) => {
            setRoom((prev) => prev ? { ...prev, settings: newSettings } : null);
        });

        // Join the room
        socket.emit('joinRoom', { roomId: id, userId, name: userName }, (response: { event: string; data: Room | string }) => {
            if (response.event === 'error') {
                setError(response.data as string);
            } else if (response.event === 'roomJoined') {
                setRoom(response.data as Room);
            }
        });

        return () => {
            if (userId) {
                socket.emit('leaveRoom', { roomId: id, userId });
            }
            socket.off('playerJoined');
            socket.off('playerLeft');
            socket.off('gameStarted');
            socket.off('voteAccepted');
            socket.off('gameEnded');
            socket.off('settingsUpdated');
        };
    }, [socket, id, userId, userName]); // Depend on userId and userName

    const handleStartGame = () => {
        if (!userId) return;
        socket.emit('startGame', { roomId: id, userId });
    };

    const handleVote = (targetId: string) => {
        if (!userId) return;
        socket.emit('vote', { roomId: id, userId, targetId });
    };

    const handleUpdateSettings = (key: keyof GameSettings, value: number | boolean) => {
        if (!room || !userId) return;
        const newSettings = { ...room.settings, [key]: value };
        socket.emit('updateSettings', { roomId: id, userId, settings: newSettings });
    };

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

    if (gameState === 'finished') {
        return (
            <div className="flex h-screen w-full flex-col items-center bg-zinc-950 p-8 text-white">
                <h1 className="text-4xl font-bold text-yellow-500 mb-8">GAME OVER</h1>
                <div className="bg-zinc-900 p-8 rounded-lg border border-zinc-800 text-center">
                    <h2 className="text-2xl mb-4">Winner: <span className={winner === 'imposter' ? 'text-red-500' : 'text-blue-500'}>{winner?.toUpperCase()}</span></h2>
                    <p className="text-xl">The Imposter was: <span className="font-bold">
                        {room?.players.find(p => p.id === imposterId)?.name || 'Unknown'}
                    </span></p>

                    {room.hostId === userId && (
                        <button
                            onClick={handleStartGame}
                            className="mt-8 rounded-md bg-green-600 px-8 py-3 font-bold hover:bg-green-500"
                        >
                            PLAY AGAIN
                        </button>
                    )}
                </div>
            </div>
        );
    }

    if (gameState === 'playing') {
        return (
            <div className="flex h-screen w-full flex-col items-center bg-zinc-950 p-8 text-white">
                <h1 className="text-4xl font-bold text-yellow-500 mb-8">GAME ON!</h1>
                <div className="text-center p-8 bg-zinc-900 rounded-lg border border-zinc-800 mb-8">
                    <h2 className="text-2xl mb-4">Your Role: <span className={role === 'imposter' ? 'text-red-500' : 'text-blue-500'}>{role?.toUpperCase()}</span></h2>
                    <div className="text-3xl font-mono bg-black p-4 rounded-md border border-zinc-700">
                        {secret}
                    </div>
                    {timeLeft !== null ? (
                        <div className={`mt-4 text-2xl font-bold font-mono ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-zinc-400'}`}>
                            ⏱ {timeLeft}s
                        </div>
                    ) : endTime ? (
                        <div className="mt-4 text-xl text-yellow-500">Loading timer...</div>
                    ) : (
                        <div className="mt-4 text-sm text-zinc-600">(No time limit set)</div>
                    )}
                </div>

                <div className="w-full max-w-md">
                    <h3 className="text-xl font-semibold mb-4">Vote for Imposter</h3>
                    {hasVoted ? (
                        <div className="text-center text-green-500 font-bold p-4 bg-zinc-900 rounded-md">Vote Cast! Waiting for others...</div>
                    ) : (
                        <ul className="space-y-2">
                            {room.players.filter(p => p.id !== userId).map((p) => (
                                <li key={p.socketId} className="flex items-center justify-between gap-2 rounded-md bg-zinc-800 p-3">
                                    <span className="text-zinc-300">{p.name}</span>
                                    <button
                                        onClick={() => handleVote(p.id)}
                                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-bold"
                                    >
                                        VOTE
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        );
    }

    const isHost = room.hostId === userId;
    const hostName = room.players.find(p => p.id === room.hostId)?.name || 'Unknown Host';

    return (
        <div className="flex min-h-screen w-full flex-col items-center bg-zinc-950 p-8 text-white">
            <div className="flex w-full max-w-4xl items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Room: {room.id}</h1>
                    <p className="mb-8 text-zinc-400">Host: {hostName}</p>
                </div>
                <button
                    onClick={() => router.push('/lobby')}
                    className="rounded-md border border-red-600 px-4 py-2 text-red-600 hover:bg-red-600 hover:text-white transition"
                >
                    Leave Room
                </button>
            </div>

            <div className="grid w-full max-w-4xl grid-cols-1 gap-8 md:grid-cols-2">
                {/* Players List */}
                <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
                    <h2 className="mb-4 text-xl font-semibold text-white">Players ({room.players.length})</h2>
                    <ul className="space-y-2">
                        {room.players.map((p) => (
                            <li key={p.socketId} className="flex items-center gap-2 rounded-md bg-zinc-800 p-2">
                                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                <span className="text-sm text-zinc-300">
                                    {p.name} {p.id === userId && '(Me)'}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Settings Panel */}
                <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
                    <h2 className="mb-4 text-xl font-semibold text-white">Game Settings</h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-zinc-400">Max Players</label>
                            {isHost ? (
                                <input
                                    type="number"
                                    value={room.settings.maxPlayers}
                                    onChange={(e) => handleUpdateSettings('maxPlayers', parseInt(e.target.value))}
                                    className="w-20 rounded bg-zinc-800 p-1 text-right text-white"
                                    min={2}
                                    max={16}
                                />
                            ) : (
                                <span className="text-white">{room.settings.maxPlayers}</span>
                            )}
                        </div>
                        <div className="flex items-center justify-between">
                            <label className="text-zinc-400">Imposters</label>
                            {isHost ? (
                                <input
                                    type="number"
                                    value={room.settings.imposterCount}
                                    onChange={(e) => handleUpdateSettings('imposterCount', parseInt(e.target.value))}
                                    className="w-20 rounded bg-zinc-800 p-1 text-right text-white"
                                    min={1}
                                    max={room.settings.maxPlayers - 1}
                                />
                            ) : (
                                <span className="text-white">{room.settings.imposterCount}</span>
                            )}
                        </div>
                        <div className="flex items-center justify-between">
                            <label className="text-zinc-400">Time Limit</label>
                            {isHost ? (
                                <button
                                    onClick={() => handleUpdateSettings('timeLimitEnabled', !room.settings.timeLimitEnabled)}
                                    className={`px-3 py-1 rounded ${room.settings.timeLimitEnabled ? 'bg-green-600' : 'bg-red-600'}`}
                                >
                                    {room.settings.timeLimitEnabled ? 'ON' : 'OFF'}
                                </button>
                            ) : (
                                <span className={room.settings.timeLimitEnabled ? 'text-green-500' : 'text-red-500'}>
                                    {room.settings.timeLimitEnabled ? 'ON' : 'OFF'}
                                </span>
                            )}
                        </div>
                        {room.settings.timeLimitEnabled && (
                            <div className="flex items-center justify-between">
                                <label className="text-zinc-400">Duration (sec)</label>
                                {isHost ? (
                                    <input
                                        type="number"
                                        value={room.settings.timeLimitDuration}
                                        onChange={(e) => handleUpdateSettings('timeLimitDuration', parseInt(e.target.value))}
                                        className="w-20 rounded bg-zinc-800 p-1 text-right text-white"
                                        min={10}
                                        max={300}
                                    />
                                ) : (
                                    <span className="text-white">{room.settings.timeLimitDuration}s</span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-8">
                {isHost ? (
                    <button
                        onClick={handleStartGame}
                        className="rounded-md bg-green-600 px-8 py-3 font-bold text-white hover:bg-green-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={room.players.length < 2}
                    >
                        START GAME
                    </button>
                ) : (
                    <p className="text-zinc-500 animate-pulse">Waiting for host to start...</p>
                )}
            </div>
        </div>
    );
}
