'use client';

import Link from 'next/link';
import { useState } from 'react';
import { subscribeToNewsletter } from '@/app/server/newsletter';

export default function Footer() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<{
        type: 'success' | 'error' | null;
        message: string;
    }>({ type: null, message: '' });
    const [isLoading, setIsLoading] = useState(false);

    const handleNewsletterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const result = await subscribeToNewsletter(email);

            setStatus({
                type: result.success ? 'success' : 'error',
                message: result.message
            });

            if (result.success) {
                setEmail('');
                // Reset success message after 5 seconds
                setTimeout(() => {
                    setStatus({ type: null, message: '' });
                }, 5000);
            }
        } catch (error) {
            console.log(error)
            setStatus({
                type: 'error',
                message: 'Something went wrong. Please try again later.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <footer className="bg-black text-white border-t border-yellow-400/20">
            {/* Newsletter Section */}
            <div className="border-b border-white/10 py-12">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="text-center max-w-2xl mx-auto">
                        <h3 className="text-2xl md:text-3xl font-bold text-yellow-400 mb-4">
                            Stay in the Loop
                        </h3>
                        <p className="text-white/70 mb-6">
                            Get the latest updates on events, tickets, and exclusive rave content straight to your inbox.
                        </p>

                        <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                className={`flex-1 px-4 py-3 bg-white/10 border text-white placeholder-white/50 focus:outline-none transition-colors ${status.type === 'error'
                                        ? 'border-red-500 focus:border-red-500'
                                        : 'border-white/20 focus:border-yellow-400'
                                    }`}
                                required
                                disabled={isLoading}
                            />
                            <button
                                type="submit"
                                className={`bg-yellow-400 text-black font-semibold py-3 px-6 transition-all duration-300 ${isLoading
                                        ? 'opacity-50 cursor-not-allowed'
                                        : 'hover:bg-white'
                                    }`}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Subscribing...' : 'Subscribe'}
                            </button>
                        </form>

                        {/* Social Media Icons */}
                        <div className="flex justify-center mt-10">
                            <div className="flex space-x-4">
                                <Link href="#" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="hover:text-yellow-400 duration-200 cursor-pointer">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43V7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.43z"/>
                                </svg>
                            </Link>

                                <Link href="https://x.com/shutupnraveee" target="_blank" rel="noopener noreferrer" aria-label="X" className="hover:text-yellow-400 duration-200 cursor-pointer">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                                </svg>
                            </Link>

                                <Link href="https://www.instagram.com/shutupnraveee" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-yellow-400 duration-200 cursor-pointer">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                </svg>
                            </Link>
                            </div>
                        </div>

                        {/* Status Message */}
                        {status.message && (
                            <div className={`mt-4 text-sm font-medium ${status.type === 'success' ? 'text-green-400' : 'text-red-400'
                                }`}>
                                {status.message}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-white/10 py-6">
                <div className="max-w-6xl mx-auto px-4">
                    <p className="text-white/50 text-sm text-center">© 2025 Lifestack Technologies Limited. All rights reserved.</p>
                </div>
            </div>

            {/* Floating Background Elements */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute bottom-20 left-10 text-yellow-400 text-xl opacity-5 animate-pulse">🎵</div>
                <div className="absolute bottom-32 right-20 text-yellow-400 text-lg opacity-5 animate-bounce">⚡</div>
                <div className="absolute bottom-16 right-1/3 text-yellow-400 text-2xl opacity-5 animate-pulse">💻</div>
            </div>
        </footer>
    );
}