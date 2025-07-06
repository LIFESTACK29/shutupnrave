import Hero from "./components/Hero";
import About from "./components/About";
import Event from "./components/Event";
import FAQ from "./components/FAQ";
import Footer from "@/app/components/Footer";

export default function HomePage() {
    return (
        <>
            <Hero />
            <About />
            <Event />
            <FAQ />
            <Footer />
        </>
    )
}