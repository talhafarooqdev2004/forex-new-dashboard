import styles from "./FinancialJuiceNews.module.scss";

export default function FinancialJuiceNewsSkeleton() {
    return (
        <div className={styles["financialjuice-news__skeleton"]}>
            <div className={styles["skeleton-news-list"]}>
                {[1, 2, 3, 4, 5, 6].map((index) => (
                    <div key={index} className={styles["skeleton-news-item"]}>
                        <div className={styles["skeleton-news-title"]} />
                        <div className={styles["skeleton-news-time"]} />
                        <div className={styles["skeleton-news-icon"]} />
                    </div>
                ))}
            </div>

            <div className={styles["skeleton-chart-section"]}>
                <div className={styles["skeleton-chart-title"]} />
                <div className={styles["skeleton-chart-legend"]}>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((index) => (
                        <div key={index} className={styles["skeleton-legend-item"]} />
                    ))}
                </div>
                <div className={styles["skeleton-chart"]} />
            </div>
        </div>
    );
}
