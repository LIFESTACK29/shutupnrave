'use client';

import Link from 'next/link';
import { useState } from 'react';

interface FAQItem {
    question: string;
    answer: string;
}

const faqData: FAQItem[] = [
    {
        question: "What is shutupnraveee?",
        answer: "A party, a reset, a much-needed escape. Think of it as the night we all agreed to log off and actually enjoy ourselves. No deadlines. No panels. No pressure. Just music, dancing, and vibes."
    },
    {
        question: "Who is this for?",
        answer: "If you've ever felt tired of being tired — this is for you. Whether you're tech bro/sis, baddie, creative, 9–5er, remote worker, or just outside for the vibes, this is your crowd."
    },
    {
        question: "Do I have to work in tech to come?",
        answer: "Not at all. The rave is open to everyone. If you've got good vibes, you're good to go."
    },
    {
        question: "What's the dress code?",
        answer: "Whatever lets you move. Come comfy, come cute, come correct. Just be you."
    },
    {
        question: "Can I come alone?",
        answer: "Yes! You won't stay solo for long. This is the kind of night where strangers turn into friends before the beat even drops."
    },
    {
        question: "How do I get tickets?",
        answer: "Tickets are live here, don't snooze."
    },
    {
        question: "What if I don't know how to dance?",
        answer: "Perfect. Neither do we. Just show up, move however you want, and feel the music."
    }
];

export default function FAQ() {
    const [openItem, setOpenItem] = useState<number | null>(null);

    const toggleItem = (index: number) => {
        setOpenItem(prev => prev === index ? null : index);
    };

    return (
        <section className="bg-black text-white pt-20 px-4 pb-16">
            {/* FAQ Heading */}
            <div className="mb-12 text-center">
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white text-center">
                    FAQ
                </h1>
            </div>

            {/* FAQ Content */}
            <div className="max-w-4xl mx-auto">
                <div className="space-y-4">
                    {faqData.map((item, index) => (
                        <div
                            key={index}
                            className="border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-300 group"
                        >
                            <button
                                onClick={() => toggleItem(index)}
                                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-yellow-400/10 transition-colors duration-300"
                                aria-expanded={openItem === index}
                            >
                                <h3 className="text-lg md:text-xl font-semibold text-white group-hover:text-yellow-400 transition-colors duration-300">
                                    {item.question}
                                </h3>
                                <div className="ml-4 flex-shrink-0">
                                    <svg
                                        className={`w-6 h-6 text-yellow-400 transition-transform duration-300 ${openItem === index ? 'rotate-180' : ''
                                            }`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 9l-7 7-7-7"
                                        />
                                    </svg>
                                </div>
                            </button>

                            <div className={`overflow-hidden transition-all duration-300 ${openItem === index
                                    ? 'max-h-96 opacity-100'
                                    : 'max-h-0 opacity-0'
                                }`}>
                                <div className="px-6 pb-4">
                                    <p className="text-white/80 leading-relaxed">
                                        {item.answer}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Call to Action */}
                <div className="mt-12 text-center">
                    <p className="text-white/70 mb-4">
                        Still have questions?
                    </p>
                    <Link href="mailto:info@shutupnrave.com.ng"
                        className="border-2 border-yellow-400 text-yellow-400 hover:bg-white hover:border-white hover:text-black font-semibold py-3 px-8 transition-colors duration-300 inline-block cursor-pointer"
                    >
                        Contact Us
                    </Link>
                </div>
            </div>

            {/* Floating elements for visual appeal */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/4 left-10 text-yellow-400 text-xl opacity-5 animate-pulse">🎵</div>
                <div className="absolute top-1/2 right-20 text-yellow-400 text-2xl opacity-5 animate-bounce">⚡</div>
                <div className="absolute bottom-1/3 left-1/4 text-yellow-400 text-lg opacity-5 animate-pulse">💻</div>
                <div className="absolute bottom-20 right-1/3 text-yellow-400 text-xl opacity-5 animate-bounce">🚀</div>
            </div>
        </section>
    );
}