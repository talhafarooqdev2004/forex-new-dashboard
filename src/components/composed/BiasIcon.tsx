export default function BiasIcon({ sentiment }: { sentiment: string }) {
    switch (sentiment) {
        case "Bullish":
            return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 22 22" fill="none">
                <path d="M20.1654 6.41699L12.3737 14.2087L7.79036 9.62533L1.83203 15.5837" stroke="#00C663" strokeWidth="2.08252" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M14.666 6.41699H20.166V11.917" stroke="#00C663" strokeWidth="2.08252" strokeLinecap="round" strokeLinejoin="round" />
            </svg>;
        case "Bearish":
            return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 25 25" fill="none">
                <path d="M22.7861 17.6895L13.9354 8.83875L8.72913 14.045L1.96094 7.27686" stroke="#FF0000" strokeWidth="2.08252" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M16.5391 17.6895H22.7866V11.4419" stroke="#FF0000" strokeWidth="2.08252" strokeLinecap="round" strokeLinejoin="round" />
            </svg>;
        default:
            return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 42 2" fill="none">
                <path d="M0 1H41.5" stroke="white" strokeWidth="2" />
            </svg>;
    }
}