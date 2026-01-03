import "./Grid.css";

interface GridInterface {
    children: React.ReactNode;
    columns: 1 | 2 | 3;
}

export function Grid({ children, columns }: GridInterface) {
    return(
        <div className="grid" style={{gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`}}>
            {children}
        </div>
    );
}