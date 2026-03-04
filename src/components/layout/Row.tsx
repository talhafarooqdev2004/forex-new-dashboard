import styles from "./Row.module.scss";
import clsx from 'clsx';

type RowProps = {
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
};

export default function Row({ children, className = '', style }: RowProps) {
    return (
        <div className={clsx(styles.row, className)} style={style}>
            {children}
        </div>
    );
}
