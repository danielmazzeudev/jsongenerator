import "./Main.css";

interface MainInterface {
    children: React.ReactNode;
}

export function Main({ children }: MainInterface) {
    return(
        <main>
            {children}
        </main>
    );
}