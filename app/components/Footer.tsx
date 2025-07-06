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
                        <div className="flex justify-center gap-6 mt-6">
                            {/* TikTok */}
                            <Link href="#" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="hover:text-yellow-400 duration-200">
                                <svg width="28" height="28" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M41 17.5c-3.7 0-6.7-3-6.7-6.7V7h-6.1v25.2c0 2.7-2.2 4.9-4.9 4.9s-4.9-2.2-4.9-4.9 2.2-4.9 4.9-4.9c.5 0 1 .1 1.5.2v-6.2c-.5-.1-1-.1-1.5-.1-6.1 0-11 4.9-11 11s4.9 11 11 11 11-4.9 11-11V23c2 1.1 4.3 1.7 6.7 1.7V17.5z" fill="currentColor" />
                                </svg>
                            </Link>
                            {/* X (Twitter) */}
                            <Link href="https://x.com/shutupnraveee" target="_blank" rel="noopener noreferrer" aria-label="X" className="hover:text-yellow-400 duration-200">
                                <svg width="28" height="28" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M34.7 12H39l-10.3 11.8L40.5 36H31.2l-7.2-8.5L15 36h-4.3l10.8-12.3L7.5 12h9.6l6.3 7.5L34.7 12zm-2.1 21h2.3l-7.5-8.8-2.1 2.4 7.3 8.4zm-13.2 0h2.3l7.3-8.4-2.1-2.4-7.5 8.8zM10.5 14l7.7 8.8 2.1-2.4-7.5-8.4H10.5zm27 0h-2.3l-7.5 8.4 2.1 2.4 7.7-8.8z" fill="currentColor" />
                                </svg>
                            </Link>
                            {/* Instagram */}
                            <Link href="https://www.instagram.com/shutupnraveee" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-yellow-400 duration-200">
                                <svg width="28" height="28" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect x="9" y="9" width="30" height="30" rx="9" stroke="currentColor" strokeWidth="3" fill="none" />
                                    <circle cx="24" cy="24" r="7" stroke="currentColor" strokeWidth="3" fill="none" />
                                    <circle cx="33.5" cy="14.5" r="2.5" fill="currentColor" />
                                </svg>
                            </Link>
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