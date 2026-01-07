'use client';

import { useRouter } from 'next/navigation';

interface Game {
    id: string;
    name: string;
    description: string;
    color: string;
    path: string;
}

const GAMES: Game[] = [
    {
        id: 'imposter',
        name: 'Imposter Game',
        description: 'Find the spy among us! One player is the imposter, others must find them.',
        color: 'from-red-500 to-orange-500',
        path: '/lobby'
    },
    // Future games can be added here
];

export default function GamesPage() {
    const router = useRouter();

    return (
        <div className="flex min-h-screen w-full flex-col items-center bg-zinc-950 p-8 text-white">
            <h1 className="mb-12 text-4xl font-bold tracking-tight">Select a Game</h1>

            <div className="grid w-full max-w-4xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {GAMES.map((game) => (
                    <div
                        key={game.id}
                        onClick={() => router.push(game.path)}
                        className={`group cursor-pointer overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 transition-all hover:scale-105 hover:border-zinc-700 hover:shadow-xl`}
                    >
                        <div className={`h-32 w-full bg-gradient-to-br ${game.color} opacity-80 transition-opacity group-hover:opacity-100`}></div>
                        <div className="p-6">
                            <h2 className="mb-2 text-2xl font-bold">{game.name}</h2>
                            <p className="text-zinc-400">{game.description}</p>
                        </div>
                    </div>
                ))}

                {/* Placeholder for "Coming Soon" */}
                <div className="flex h-full min-h-[250px] items-center justify-center rounded-xl border border-dashed border-zinc-800 bg-zinc-900/50 p-6 text-zinc-600">
                    <p>More games coming soon...</p>
                </div>
            </div>
        </div>
    );
}
