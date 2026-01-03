import "./Nav.css";

interface NavInterface {
    children: React.ReactNode;
}

export function Nav({ children }: NavInterface) {
    return(
        <nav>
            {children}
        </nav>
    );
}