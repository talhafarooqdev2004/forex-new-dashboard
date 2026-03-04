import styles from "./Col.module.scss";

type ColProps = {
    children: React.ReactNode;
    style?: React.CSSProperties;
};

export default function Col({ children, style }: ColProps) {
    return (
        <div className={styles.col} style={style}>
            {children}
        </div>
    );
}
