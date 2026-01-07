'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Menu as MenuIcon, LogOut, User } from 'lucide-react';

export default function Menu() {
    const [isOpen, setIsOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [displayName, setDisplayName] = useState('');
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

    // Helper to read cookies
    const getCookie = (name: string) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift();
        return null;
    };

    const getAuthHeaders = (): HeadersInit => {
        const token = getCookie('auth_token');
        if (token) {
            return { 'Authorization': `Bearer ${token}` };
        }
        return {};
    };

    useEffect(() => {
        // Fetch current profile
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/v1/users/me`, {
            credentials: 'include',
            headers: getAuthHeaders(),
        })
            .then(res => res.json())
            .then(data => setDisplayName(data.displayName || ''));
    }, []);

    const handleLogout = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/v1/auth/logout`, {
                method: 'POST',
                credentials: 'include',
                headers: getAuthHeaders(),
            });

            if (res.ok) {
                // Clear cookies locally
                document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
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

    const handleSaveProfile = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/v1/users/me`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify({ displayName }),
                credentials: 'include',
            });
            if (res.ok) {
                setIsProfileOpen(false);
                router.refresh(); // Refresh to potentially update other components
            }
        } catch (error) {
            console.error('Failed to update profile', error);
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
                            console.log('Navigating to games');
                            router.push('/games');
                        }}
                        className="flex w-full items-center px-4 py-2 text-sm text-white hover:bg-zinc-700"
                    >
                        <MenuIcon className="mr-2 h-4 w-4" />
                        Games
                    </button>
                    <button
                        onClick={() => {
                            setIsOpen(false);
                            setIsProfileOpen(true);
                        }}
                        className="flex w-full items-center px-4 py-2 text-sm text-white hover:bg-zinc-700"
                    >
                        <User className="mr-2 h-4 w-4" />
                        Profile
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

            {isProfileOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="w-80 rounded-lg bg-zinc-900 p-6 shadow-xl border border-zinc-700">
                        <h2 className="mb-4 text-xl font-bold text-white">Edit Profile</h2>
                        <div className="mb-4">
                            <label className="mb-1 block text-sm text-zinc-400">Display Name</label>
                            <input
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                className="w-full rounded bg-zinc-800 p-2 text-white border border-zinc-700 focus:outline-none focus:border-blue-500"
                                placeholder="Enter your name"
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setIsProfileOpen(false)}
                                className="rounded px-4 py-2 text-sm text-zinc-400 hover:text-white"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveProfile}
                                className="rounded bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-500"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
