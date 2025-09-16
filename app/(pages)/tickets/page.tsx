'use client';

import { Suspense, useState } from 'react';
// import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Navbar from '@/app/components/Navbar';
import CheckoutSheet from './components/CheckoutSheet';

// Ticket configuration
const TICKET_CONFIG = {
    single: {
        id: 'single',
        name: 'Solo Vibes',
        price: 3500,
        description: 'Individual tickets',
        badge: 'Solo',
        color: 'bg-yellow-400'
    },
    geng: {
        id: 'geng',
        name: 'Geng Energy',
        price: 15000,
        description: 'Group of 4',
        badge: 'Geng',
        color: 'bg-blue-500'
    }
} as const;

const PROCESSING_FEE_RATE = 0.05; // 5%
const MAX_TICKETS = 5;

type TicketType = keyof typeof TICKET_CONFIG;

export default function TicketsPage() {
    const [selectedTicketType, setSelectedTicketType] = useState<TicketType>('single');
    const [ticketQuantity, setTicketQuantity] = useState(0);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

    // Computed values
    const currentTicket = TICKET_CONFIG[selectedTicketType];
    const subtotal = currentTicket.price * ticketQuantity;
    const processingFee = subtotal * PROCESSING_FEE_RATE;
    const total = subtotal + processingFee;

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 0
        }).format(price);
    };

    const adjustQuantity = (delta: number) => {
        setTicketQuantity(prev => Math.max(0, Math.min(MAX_TICKETS, prev + delta)));
    };

    const handleTabChange = (value: string) => {
        setSelectedTicketType(value as TicketType);
        setTicketQuantity(0); // Reset quantity when switching ticket types
    };

    return (
        <section className="bg-black text-white min-h-screen px-4">
            <Navbar />

            {/* Event Header */}
            <section className="pt-12 md:pt-24 md:pb-12  px-4 border-b border-white/10 relative">
                <div className="max-w-4xl mx-auto text-center pt-14">

                    <h1 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">
                        Early Bird <span className="text-yellow-400">Tickets</span>
                    </h1>
                    <p className="text-white/70 text-lg mb-8">
                        Solo or with your geng? Either way, you&apos;re about to lose your mind to the beats.
                    </p>
                    <div className="flex-wrap justify-center gap-6 text-white/70 text-sm md:flex hidden">
                        <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                            </svg>
                            <span>November 29, 2025</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                            <span>12:00 PM - 10:00 PM</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                            <span>Port Harcourt, Nigeria</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Ticket Selection */}
            <section className="pb-16 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-8">
                        <div className="mb-6">
                            <h3 className="text-2xl font-bold text-white mb-2">Choose Your Experience</h3>
                            <p className="text-white/60 text-sm">Select your ticket type and quantity</p>
                        </div>

                        {/* Ticket Type Tabs */}
                        <Tabs value={selectedTicketType} onValueChange={handleTabChange} className="w-full max-w-2xl mx-auto mb-6">
                            <TabsList className="grid w-full grid-cols-2 bg-white/10 rounded-full p-1">
                                <TabsTrigger 
                                    value="single" 
                                    className="rounded-full data-[state=active]:bg-yellow-400 data-[state=active]:text-black text-white/70 font-semibold cursor-pointer hover:cursor-pointer active:scale-95 transition-transform duration-200"
                                >
                                    Solo Vibes
                                </TabsTrigger>
                                <TabsTrigger 
                                    value="geng"
                                    className="rounded-full data-[state=active]:bg-yellow-400 data-[state=active]:text-black text-white/70 font-semibold cursor-pointer hover:cursor-pointer active:scale-95 transition-transform duration-200"
                                >
                                    Geng Energy
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>

                    <Card className="bg-white/5 border-yellow-400/50 hover:border-yellow-400 transition-all duration-300 max-w-2xl mx-auto">
                        <CardContent className="space-y-6">
                            {/* Ticket Details */}
                            <div className="text-center space-y-2 pt-2">
                                <h4 className="text-2xl font-bold text-white">{currentTicket.name}</h4>
                                <p className="text-white/70">{currentTicket.description}</p>
                                <div className="text-3xl font-bold text-yellow-400">
                                    {formatPrice(currentTicket.price)}
                                </div>
                            </div>

                            {/* Quantity Selection */}
                            <div className="space-y-4">
                                <label className="text-white/80 font-medium text-center block">How Many?</label>
                                <div className="flex items-center justify-center gap-4">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => adjustQuantity(-1)}
                                        disabled={ticketQuantity === 0}
                                        className="w-12 h-12 rounded-full bg-white/10 border-white/20 text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:cursor-pointer active:scale-95 transition-transform duration-200"
                                    >
                                        -
                                    </Button>
                                    <div className="w-16 h-12 bg-yellow-400/10 border border-yellow-400/30 rounded-lg flex items-center justify-center">
                                        <span className="text-yellow-400 font-bold text-lg">{ticketQuantity}</span>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => adjustQuantity(1)}
                                        disabled={ticketQuantity >= MAX_TICKETS}
                                        className="w-12 h-12 rounded-full bg-white/10 border-white/20 text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:cursor-pointer active:scale-95 transition-transform duration-200"
                                    >
                                        +
                                    </Button>
                                </div>
                                <p className="text-white/50 text-xs text-center">Maximum {MAX_TICKETS} tickets per order</p>
                            </div>

                            {/* Order Summary */}
                            {ticketQuantity > 0 && (
                                <OrderSummary
                                    ticketName={currentTicket.badge}
                                    quantity={ticketQuantity}
                                    subtotal={subtotal}
                                    processingFee={processingFee}
                                    total={total}
                                    formatPrice={formatPrice}
                                />
                            )}

                            {/* Checkout Sheet */}
                            <Suspense fallback={<div className="text-center text-white/70">Loading checkout…</div>}>
                                <CheckoutSheet
                                    isOpen={isCheckoutOpen}
                                    onOpenChange={setIsCheckoutOpen}
                                    disabled={ticketQuantity === 0}
                                    ticketInfo={{
                                        name: currentTicket.name,
                                        quantity: ticketQuantity,
                                        subtotal,
                                        processingFee,
                                        total,
                                    }}
                                    formatPrice={formatPrice}
                                />
                            </Suspense>
                        </CardContent>
                    </Card>
                </div>
            </section>
        </section>
    );
}

// Component for order summary
function OrderSummary({ 
    ticketName, 
    quantity, 
    subtotal, 
    processingFee, 
    total, 
    formatPrice 
}: {
    ticketName: string;
    quantity: number;
    subtotal: number;
    processingFee: number;
    total: number;
    formatPrice: (price: number) => string;
}) {
    return (
        <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
                <span className="text-white/80">Subtotal ({ticketName} × {quantity}):</span>
                <span className="text-white">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
                <span className="text-white/80">Processing Fee (5%):</span>
                <span className="text-white">{formatPrice(processingFee)}</span>
            </div>
            <Separator className="bg-white/20" />
            <div className="flex justify-between font-bold">
                <span className="text-white">Total:</span>
                <span className="text-yellow-400 text-md md:text-xl">{formatPrice(total)}</span>
            </div>
        </div>
    );
}