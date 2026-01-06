'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Menu as MenuIcon, LogOut } from 'lucide-react';

export default function Menu() {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = async () => {
        try {
            const res = await fetch('http://localhost:4000/v1/auth/logout', {
                method: 'POST',
                credentials: 'include',
            });

            if (res.ok) {
                // Clear local session logic if any
                sessionStorage.removeItem('userId');
                router.push('/');
                router.refresh(); // Refresh to clear any server-side cached states if existing
            } else {
                console.error('Logout failed');
            }
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    if (pathname === '/') return null;

    return (
        <div className="fixed top-4 right-4 z-50 text-white" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="rounded-full bg-zinc-800 p-3 hover:bg-zinc-700 transition"
            >
                <MenuIcon className="h-6 w-6" />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md bg-zinc-800 py-1 shadow-lg ring-1 ring-black ring-opacity-5">
                    <div className="px-4 py-2 text-sm text-zinc-400 border-b border-zinc-700">
                        Menu
                    </div>
                    <button
                        onClick={() => {
                            setIsOpen(false);
                            router.push('/games');
                        }}
                        className="flex w-full items-center px-4 py-2 text-sm text-white hover:bg-zinc-700"
                    >
                        <MenuIcon className="mr-2 h-4 w-4" />
                        Games
                    </button>
                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center px-4 py-2 text-sm text-white hover:bg-zinc-700"
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                    </button>
                </div>
            )}
        </div>
    );
}
