export default function Event() {
    return (
        <section className="text-white pt-20 px-4">
       
                {/* Events Heading */}
                <div className="mb-12 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white text-center">
                        Events
                    </h1>
                </div>

                {/* Event Cards Container */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    
                    {/* ShutUpNRave Event Card */}
                    <div className="relative bg-gradient-to-br from-yellow-600 to-yellow-800 p-8 overflow-hidden group hover:scale-105 transition-transform duration-300">
                        {/* Status Badge */}
                        <h1 className="absolute top-4 right-4 bg-green-500 text-black px-3 py-1 rounded-full text-sm font-bold">
                            Active
                        </h1>
                        
                        {/* Distressed Background Pattern */}
                        <div className="absolute inset-0 opacity-20">
                            <div className="w-full h-full bg-black" style={{
                                backgroundImage: `repeating-linear-gradient(
                                    45deg,
                                    transparent,
                                    transparent 2px,
                                    rgba(0,0,0,0.3) 2px,
                                    rgba(0,0,0,0.3) 4px
                                )`
                            }}></div>
                        </div>
                        
                        {/* Card Content */}
                        <div className="relative z-10">
                            {/* Main Event Title */}
                            <div className="mb-4">
                                <div className="text-2xl md:text-3xl font-black text-black mb-1 tracking-tight transform -skew-x-12">
                                    SHUTUP
                                </div>
                                <div className="text-xl md:text-2xl font-black text-black mb-1 tracking-tight">
                                    &RAVE
                                </div>
                                <div className="text-2xl md:text-3xl font-black text-black tracking-tight">
                                    2025
                                </div>
                            </div>
                            
                            {/* Event Details */}
                            <div className="mb-4 space-y-1">
                                <div className="text-black font-bold text-base">
                                    November 29, 2025 / Nigeria
                                </div>
                                <div className="text-lg font-bold text-black">
                                    Tech Rave <span className="text-sm">(Port Harcourt)</span>
                                </div>
                            </div>
                            
                            {/* CTA Button */}
                            <button className="bg-black text-yellow-400 font-bold py-3 px-6 hover:bg-white hover:text-black transition-colors duration-300 w-full cursor-pointer">
                                Buy Event Tickets
                            </button>
                            
                            {/* Additional Info
                            <div className="mt-4 text-black text-sm font-medium">
                                🎧 Tech Professionals • 💻 Code & Rave • 🇳🇬 PH Vibes
                            </div> */}
                        </div>
                        
                        {/* Decorative Elements */}
                        <div className="absolute bottom-4 left-4 text-black opacity-30">
                            <div className="text-6xl font-black">⚡</div>
                        </div>
                        <div className="absolute top-1/2 right-4 text-black opacity-20">
                            <div className="text-4xl font-black">🚀</div>
                        </div>
                    </div>

                    {/* Placeholder for Future Events */}
                    <div className="bg-white/5 border-2 border-dashed border-yellow-400/30 p-8 flex items-center justify-center text-center">
                        <div className="space-y-4">
                           
                            <div className="text-white/60 font-medium">
                                More Events
                                <br />
                                Coming Soon
                            </div>
                            <div className="text-yellow-400 text-sm">
                                Stay Tuned
                            </div>
                        </div>
                    </div>

                </div>

             

       
        </section>
    )
}