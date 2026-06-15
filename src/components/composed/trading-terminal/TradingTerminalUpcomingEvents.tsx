"use client";

import Link from "next/link";
import CurrencyFlag from "@/components/ui/CurrencyFlag";
import { Button } from "@/components/ui";

type UpcomingEvent = {
    id: string;
    currency: string;
    title: string;
    datetime: string;
};

const EVENTS: UpcomingEvent[] = [
    { id: "1", currency: "USD", title: "FOMC Meeting", datetime: "Jun 12 21:00" },
    { id: "2", currency: "EUR", title: "CPI Data", datetime: "Jun 14 15:30" },
    { id: "3", currency: "USD", title: "NFP Data", datetime: "Jun 16 15:30" },
];

export default function TradingTerminalUpcomingEvents() {
    return (
        <div className="bg-darkGrey rounded-[12px] h-full flex flex-col min-w-0 overflow-hidden">
            <div className="px-4 py-3 border-b border-solid border-stroke shrink-0">
                <h6 className="font-semibold text-sm text-foreground">Upcoming Events</h6>
            </div>

            <div className="flex-1 min-h-0 px-4 py-3 flex flex-col gap-4">
                {EVENTS.map((event) => (
                    <div key={event.id} className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-full bg-stroke/20 flex items-center justify-center shrink-0 overflow-hidden">
                                <CurrencyFlag currency={event.currency} size={14} />
                            </div>
                            <span className="text-xs text-foreground truncate">
                                {event.currency} - {event.title}
                            </span>
                        </div>
                        <span className="text-[10px] text-secondary whitespace-nowrap shrink-0">
                            {event.datetime}
                        </span>
                    </div>
                ))}
            </div>

            <div className="px-4 pb-4 shrink-0">
                <Button
                    asChild
                    className="w-full h-9 rounded-[6px] bg-[#1e3a5f] hover:bg-[#254875] text-white text-xs font-medium border-0"
                >
                    <Link href="/calendar-news">View Calendar</Link>
                </Button>
            </div>
        </div>
    );
}
