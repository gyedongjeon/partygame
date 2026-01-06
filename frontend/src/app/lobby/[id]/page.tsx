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
    const [gameState, setGameState] = useState<'waiting' | 'playing' | 'finished'>('waiting');
    const [role, setRole] = useState<'imposter' | 'civilian' | null>(null);
    const [secret, setSecret] = useState('');
    const [userId, setUserId] = useState<string | null>(null);

    const [hasVoted, setHasVoted] = useState(false);
    const [winner, setWinner] = useState<'imposter' | 'civilians' | null>(null);
    const [imposterId, setImposterId] = useState('');

    useEffect(() => {
        // Initialize userId on client side to avoid hydration mismatch
        const storedUserId = sessionStorage.getItem('userId');
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setUserId(storedUserId);
    }, []);

    useEffect(() => {
        if (!socket) return;
        if (!userId) return; // Wait for userId to be loaded

        // Listen for updates
        socket.on('playerJoined', (updatedRoom: Room) => {
            console.log("Player joined", updatedRoom);
            setRoom(updatedRoom);
        });

        socket.on('playerLeft', (updatedRoom: Room) => {
            setRoom(updatedRoom);
        });

        socket.on('gameStarted', (data: { gameState: 'playing'; role: 'imposter' | 'civilian'; secret: string }) => {
            console.log("Game Started", data);
            setGameState(data.gameState);
            setRole(data.role);
            setSecret(data.secret);
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

        // Join the room
        socket.emit('joinRoom', { roomId: id, userId }, (response: { event: string; data: Room | string }) => {
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
        };
    }, [socket, id, userId]); // Depend on userId so we join after it's loaded

    const handleStartGame = () => {
        if (!userId) return;
        socket.emit('startGame', { roomId: id, userId });
    };

    const handleVote = (targetId: string) => {
        if (!userId) return;
        socket.emit('vote', { roomId: id, userId, targetId });
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
                    <p className="text-xl">The Imposter was: <span className="font-bold">{imposterId}</span></p>

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
                </div>

                <div className="w-full max-w-md">
                    <h3 className="text-xl font-semibold mb-4">Vote for Imposter</h3>
                    {hasVoted ? (
                        <div className="text-center text-green-500 font-bold p-4 bg-zinc-900 rounded-md">Vote Cast! Waiting for others...</div>
                    ) : (
                        <ul className="space-y-2">
                            {room.players.filter(p => p.id !== userId).map((p) => (
                                <li key={p.socketId} className="flex items-center justify-between gap-2 rounded-md bg-zinc-800 p-3">
                                    <span className="text-zinc-300">{p.id}</span>
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

    return (
        <div className="flex h-screen w-full flex-col items-center bg-zinc-950 p-8 text-white">
            <h1 className="text-3xl font-bold text-white">Room: {room.id}</h1>
            <p className="mb-8 text-zinc-400">Host: {room.hostId}</p>

            <div className="w-full max-w-md rounded-lg border border-zinc-800 bg-zinc-900 p-6">
                <h2 className="mb-4 text-xl font-semibold text-white">Players ({room.players.length})</h2>
                <ul className="space-y-2">
                    {room.players.map((p) => (
                        <li key={p.socketId} className="flex items-center gap-2 rounded-md bg-zinc-800 p-2">
                            <div className="h-2 w-2 rounded-full bg-green-500"></div>
                            <span className="text-sm text-zinc-300">{p.id === userId ? 'Me' : p.id} ({p.socketId.slice(0, 4)})</span>
                        </li>
                    ))}
                </ul>
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
