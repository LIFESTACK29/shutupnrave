import Image from "next/image";

export default function Navbar() {
    return (
        <section className="absolute p-3 md:p-8 z-20">
            <Image src='/shutupnrave-wb.png' alt="logo" width={160} height={150} priority className="md:w-44 w-40" />
        </section>
    )
}