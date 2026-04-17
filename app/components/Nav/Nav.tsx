import Image from "next/image";
import "./Nav.css";

interface NavInterface {
    children: React.ReactNode;
}

export function Nav({ children }: NavInterface) {
    return(
        <nav>
            <div className="nav-top">
                <div className="nav-brand" aria-label="Lumni">
                    <Image
                        src="/logo-lumni.png"
                        alt="Lumni"
                        width={64}
                        height={32}
                        className="nav-brand-logo"
                        priority
                    />
                </div>
            </div>
            <div className="nav-copy">
                {children}
            </div>
        </nav>
    );
}
