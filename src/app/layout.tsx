import { Arimo, Arima, Inter } from "next/font/google";
import "@/styles/tailwind/globals.css";
import "@/styles/scss/main.scss";
import { AppProviders } from "@/components/providers/AppProviders";
import { defaultRootMetadata } from "@/lib/seo";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const arimo = Arimo({
  variable: "--font-arimo",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const arima = Arima({
  variable: "--font-arima",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata = defaultRootMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var k='forex-dashboard-theme';var v=localStorage.getItem(k);var d=!(v==='light'||(v!=='dark'&&!window.matchMedia('(prefers-color-scheme: dark)').matches));document.documentElement.classList.toggle('dark',d);})();`,
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${arimo.variable} ${arima.variable} antialiased overflow-x-auto bg-background text-foreground`}
        suppressHydrationWarning
      >
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}