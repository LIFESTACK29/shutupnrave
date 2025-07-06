import Link from "next/link";

export default function About() {
    return (
        <section className="text-white relative pt-20 p-4" id="about">
            {/* Events Heading */}
            <div className="mb-12 text-center">
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white text-center">
                    About {" "}
                    <span className="text-yellow-400">Us</span>
                </h1>
            </div>
            {/* Subtle floating elements */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-20 left-10 text-yellow-400 text-2xl opacity-10 animate-pulse">⚡</div>
                <div className="absolute top-1/3 right-16 text-yellow-400 text-xl opacity-10 animate-bounce">💻</div>
                <div className="absolute bottom-1/4 left-1/4 text-yellow-400 text-lg opacity-10 animate-pulse">🎵</div>
                <div className="absolute bottom-20 right-20 text-yellow-400 text-2xl opacity-10 animate-bounce">🚀</div>
            </div>

            <div className="relative z-10 flex items-center justify-center h-full px-6">
                <div className="mx-auto text-center space-y-8">

                    {/* Main message */}
                    <div className="space-y-6 text-center">
                        <div className="text-lg md:text-xl font-medium text-white/90 max-w-3xl mx-auto leading-relaxed text-center">
                            We&apos;re not an event company. We&apos;re just a bunch of people who got tired of being <span className="text-yellow-400">&quot;too busy&quot;</span> to have fun.
                        </div>

                        <div className="text-base md:text-lg text-white/80 max-w-3xl mx-auto leading-relaxed text-center">
                            <span className="text-yellow-400 font-semibold">shutupnraveee</span> was born from one simple idea — tech folks (and everyone else stuck in the loop of work) deserve a space to log off, link up, and let go.
                        </div>

                        <div className="text-base md:text-lg text-white/80 max-w-3xl mx-auto leading-relaxed text-center">
                            No panels. No awkward networking. Just <span className="text-yellow-400">music</span>, <span className="text-yellow-400">movement</span>, and <span className="text-yellow-400">mad energy</span>.
                        </div>
                    </div>

                    {/* Who it's for */}
                    <div className="space-y-6 text-center">
                        <div className="text-base md:text-lg text-white/80 max-w-3xl mx-auto leading-relaxed text-center">
                            Whether you work a 9-5, write code, build startups, or just want to dance till your phone dies, this is your invite to <span className="text-yellow-400 font-semibold">come outside</span>.
                        </div>

                        <div className="text-xl md:text-2xl font-bold text-yellow-400 tracking-wide text-center">
                            Shut up.. and rave.
                        </div>
                    </div>

                    {/* Simple CTA */}
                    <div className="space-y-3">
                        <Link href='/tickets' className="bg-yellow-400 text-black font-semibold py-2 px-6 cursor-pointer hover:bg-white duration-300 inline-block active:scale-95">
                            GET TICKETS
                        </Link>
                    </div>


                </div>
            </div>
        </section>
    )
}