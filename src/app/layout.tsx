import type { Metadata } from "next";
import { Arimo, Inter } from "next/font/google";
import "@/styles/tailwind/globals.css";
import "@/styles/scss/main.scss";
import { Header } from "@/components/layout";
import SideBar from "@/components/layout/SideBar";

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

export const metadata: Metadata = {
  title: "Forex Fundamentals Edge",
  description: "This is a Forex Fundamentals Edge project.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${arimo.variable} antialiased overflow-x-auto`}
        suppressHydrationWarning
      >
        <div className="flex min-w-[1024px] w-full">
          <div className="w-[19%]">
            <SideBar />
          </div>
          <div className="w-[81%] min-w-0 flex flex-col">
            <Header />

            <main className="bg-charcoal p-8 min-w-0 flex-1">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
};