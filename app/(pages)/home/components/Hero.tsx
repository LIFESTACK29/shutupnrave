import Navbar from "@/app/components/Navbar";
import Image from "next/image";
import Link from "next/link";

export default function Hero() {
    return (
        <section className="h-screen text-white">

            <Navbar />

            {/* Collage background using grid */}
            <div className="absolute inset-0 -z-50 grid grid-cols-1 md:grid-cols-2 grid-rows-1 md:grid-rows-2 h-full">
                {/* Single image on mobile, top left on desktop */}
                <div className="relative">
                    <Image
                        priority
                        src="/bg-img.jpg"
                        alt="Background"
                        className="w-full h-full object-cover"
                        fill
                    />
                </div>
                {/* Hidden on mobile, top right on desktop */}
                <div className="relative hidden md:block">
                    <Image
                        priority
                        src="/bg-img2.jpg"
                        alt="Background Top Right"
                        className="w-full h-full object-cover"
                        fill
                    />
                </div>
                {/* Hidden on mobile, bottom image spanning full width on desktop */}
                <div className="relative hidden md:block col-span-2">
                    <Image
                        priority
                        src="/bg-img3.jpg"
                        alt="Background Bottom"
                        className="w-full h-full object-cover"
                        fill
                    />
                </div>
            </div>

            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/80 to-black/80"></div>

            {/* Text content for the bg-image */}
            <div className="relative z-10 flex items-center justify-center h-full px-6">
                <div className="text-center max-w-4xl mx-auto">
                    {/* Main heading */}
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight">
                      For the <span className="text-yellow-400"> Tech bros</span>, <span className="text-yellow-400">Baddies</span>, and <span className="text-yellow-400">Everyone</span> who just wants to dance.
                    </h1>

                    {/* Subtitle
                    <p className="text-lg md:text-xl lg:text-2xl mb-8 text-gray-200 max-w-2xl mx-auto">
                        Experience the ultimate tech rave where music meets innovation.
                        Join us for an unforgettable night of beats, lights, and pure energy.
                    </p> */}

                    {/* Event details */}
                    <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-12 mb-10 text-sm md:text-base">
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                            </svg>
                            <span>November 29, 2025</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                            <span>PH, Nigeria</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                            <span>12:00 PM - 10:00 PM</span>
                        </div>
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                        <Link href="/tickets" className="bg-yellow-400 text-black font-semibold py-3 px-8 duration-300 cursor-pointer hover:bg-white active:scale-95 md:w-full w-[55%] inline-block text-center">
                            Get Tickets Now
                        </Link>
                        <Link href="#about" className="border-2 border-yellow-400 text-yellow-400 hover:text-black font-semibold py-3 px-8 duration-300 cursor-pointer hover:bg-white hover:border-white active:scale-95 md:w-full w-[55%] inline-block text-center">
                            Learn More
                        </Link>
                    </div>

                    {/* Additional info
                    <div className="mt-8 md:mt-12 text-sm text-center text-gray-300">
                        <p>🎵 Featuring Top DJs • 🎪 Multiple Stages • <br className="block md:hidden" />
                            🍹 Premium Bar</p>
                    </div> */}
                </div>
            </div>
        </section>
    )
}