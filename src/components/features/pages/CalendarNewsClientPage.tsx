"use client";

import styles from './CalendarNewsClientPage.module.scss';

export default function CalendarNewsClientPage() {
    return (
        <div className={styles.container}>
            <div className={styles.widgetWrapper}>
                <iframe
                    src="https://widget.myfxbook.com/widget/calendar.html?lang=en&impacts=0,1,2,3&symbols=AUD,CAD,CHF,CNY,EUR,GBP,JPY,NZD,USD"
                    title="Myfxbook Economic Calendar"
                ></iframe>
            </div>

            <div className={styles.footer}>
                <a
                    href="https://www.myfxbook.com/forex-economic-calendar?utm_source=widget13&utm_medium=link&utm_campaign=copyright"
                    title="Economic Calendar"
                    className={styles.myfxbookLink}
                    target="_blank"
                    rel="noopener"
                >
                </a>
            </div>
        </div>
    );
}