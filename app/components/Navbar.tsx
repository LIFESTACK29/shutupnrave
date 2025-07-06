import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
    return (
        <section className="absolute p-3 md:p-4 z-20">
            <Link href={'/'}><Image src='/shutupnrave-wb.png' alt="logo" width={160} height={150} priority className="md:w-56 w-44" /></Link>
        </section>
    )
}