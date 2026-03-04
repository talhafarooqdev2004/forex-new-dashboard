
"use client";

import {
    Button,
    Form,
    FormField,
    FormLabel,
    FormItem,
    Input,
    Select,
    SelectValue,
    SelectTrigger,
    SelectContent,
    SelectItem,
    FormControl
} from "@/components/ui";
import { Section } from "@/components/ui/layout";
import Container from "@/components/ui/layout/Container";
import { PipsGrowthChart } from "@/components/composed/Charts";
import { ActiveTradesTable, TradeHistoryTable } from "@/components/composed/tables";
import { Search } from "lucide-react";
import { useRef } from "react";
import { useTradeAlertForm } from "@/hooks/forms";

export default function TradingTerminalClientPage() {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFocus = () => document.getElementById("search-icon")?.classList.add("hidden");
    const handleBlur = () => document.getElementById("search-icon")?.classList.remove("hidden");

    const handleSearch = () => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    return (
        <Container>
            <Section className="flex justify-between items-center">
                <div className="bg-black/20 rounded-xl px-[10px] py-2 flex items-center gap-4">
                    <div className="flex items-center gap-2 font-semibold">
                        <span>From</span>
                        <Button variant="dark-grey" size="dark-grey">
                            01/01/2024
                        </Button>
                        <span>To</span>
                        <Button variant="dark-grey" size="dark-grey">
                            01/01/2024
                        </Button>
                    </div>

                    <div className="flex items-center gap-2 font-semibold">
                        <span>Pips Growth</span>
                        <Button variant="dark-grey" size="dark-grey">
                            20,0000
                        </Button>
                    </div>
                </div>

                <div className="relative">
                    <Input type="search" variant="dark-grey" onFocus={handleFocus} onBlur={handleBlur} ref={inputRef} />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white size-5" id="search-icon" onClick={handleSearch} />
                </div>
            </Section>

            <Section>
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex flex-col border-r border-solid border-black pr-12">
                        <div className="flex justify-between gap-8 py-2">
                            <span className="font-arima">Total Trades</span>
                            <span className="text-[#FFDF20] font-semibold">35</span>
                        </div>
                        <div className="flex justify-between items-center gap-8 py-2">
                            <span className="font-arima">Weekly trades</span>
                            <span className="text-[#FFDF20] font-semibold">79%</span>
                        </div>
                    </div>

                    <div className="flex flex-col border-r border-solid border-black pr-12">
                        <div className="flex justify-between gap-8 py-2">
                            <span className="font-arima">Total Trades</span>
                            <span className="text-[#FB64B6] font-semibold">35</span>
                        </div>
                        <div className="flex justify-between items-center gap-8 py-2">
                            <span className="font-arima">Weekly trades</span>
                            <span className="text-[#FB64B6] font-semibold">79%</span>
                        </div>
                    </div>

                    <div className="flex flex-col border-r border-solid border-black pr-12">
                        <div className="flex justify-between gap-8 py-2">
                            <span className="font-arima">Total Trades</span>
                            <span className="text-[#FFDF20] font-semibold">35</span>
                        </div>
                        <div className="flex justify-between gap-8 py-2">
                            <span className="font-arima">Weekly trades</span>
                            <span className="text-[#FFDF20] font-semibold">79%</span>
                        </div>
                    </div>

                    <div className="flex flex-col border-r border-solid border-black pr-12">
                        <div className="flex justify-between gap-8 py-2">
                            <span className="font-arima">Total Trades</span>
                            <span className="text-[#FFDF20] font-semibold">28</span>
                        </div>
                        <div className="flex justify-between gap-8 py-2">
                            <span className="font-arima">Weekly trades</span>
                            <span className="text-[#FFDF20] font-semibold">7</span>
                        </div>
                    </div>

                    <div className="flex flex-col border-r border-solid border-black pr-12">
                        <div className="flex justify-between gap-8 py-2">
                            <span className="font-arima">Total Trades</span>
                            <span className="text-[#FFDF20] font-semibold">3</span>
                        </div>
                        <div className="flex gap-8 py-2">
                            <span className="font-arima">Weekly trades</span>
                            <span className="text-[#FFDF20] font-semibold">9%</span>
                        </div>
                    </div>
                </div>
            </Section>

            <Section>
                <PipsGrowthChart />
            </Section>

            <Section>
                <ActiveTradesTable />
            </Section>

            <Section>
                <TradeHistoryTable />
            </Section>

            <Section padding={false}>
                <TradeAlertForm />
            </Section>
        </Container>
    );
};

function TradeAlertForm() {
    const { form, control, isSubmitting } = useTradeAlertForm();

    return (
        <>
            <div className="border-b border-solid border-[#FFFFFF1A] p-2">
                <h6 className="text-center">Trade Alert</h6>
            </div>

            <div className="p-4 relative">
                <Form {...form}>
                    <div className="flex flex-col gap-4 pb-5 w-[80%]">
                        <div className="grid grid-cols-3 gap-3">
                            <FormField
                                control={control}
                                name="symbol"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Symbol</FormLabel>
                                        <FormControl>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a symbol" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="USD/JPY">USD/JPY</SelectItem>
                                                    <SelectItem value="EUR/USD">EUR/USD</SelectItem>
                                                    <SelectItem value="GBP/USD">GBP/USD</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                    </FormItem>
                                )} />

                            <FormField
                                control={control}
                                name="direction"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Direction</FormLabel>
                                        <FormControl>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a direction" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Buy">Buy</SelectItem>
                                                    <SelectItem value="Sell">Sell</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                    </FormItem>
                                )} />

                            <FormField
                                control={control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Type</FormLabel>
                                        <FormControl>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Market">Swing</SelectItem>
                                                    <SelectItem value="Limit">Limit</SelectItem>
                                                    <SelectItem value="Stop">Stop</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                    </FormItem>
                                )} />
                        </div >

                        <div className="grid grid-cols-6 gap-3">
                            <FormField
                                control={control}
                                name="entryPrice"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Entry Price</FormLabel>
                                        <FormControl>
                                            <Input type="text" {...field} />
                                        </FormControl>
                                    </FormItem>
                                )} />

                            <FormField
                                control={control}
                                name="stockLoss"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Stock Loss</FormLabel>
                                        <FormControl>
                                            <Input type="text" {...field} />
                                        </FormControl>
                                    </FormItem>
                                )} />

                            <FormField
                                control={control}
                                name="riskPerTrade"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Risk Per Trade</FormLabel>
                                        <FormControl>
                                            <Input type="text" {...field} />
                                        </FormControl>
                                    </FormItem>
                                )} />

                            <FormField
                                control={control}
                                name="tp1"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>TP 1</FormLabel>
                                        <FormControl>
                                            <Input type="text" {...field} />
                                        </FormControl>
                                    </FormItem>
                                )} />

                            <FormField
                                control={control}
                                name="tp2"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>TP 2</FormLabel>
                                        <FormControl>
                                            <Input type="text" {...field} />
                                        </FormControl>
                                    </FormItem>
                                )} />

                            <FormField
                                control={control}
                                name="tp3"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>TP 3</FormLabel>
                                        <FormControl>
                                            <Input type="text" {...field} />
                                        </FormControl>
                                    </FormItem>
                                )} />
                        </div>
                        <div className="border-t border-solid border-[#FFFFFF0D] pt-3 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 12 13" fill="none">
                                    <path d="M8.16761 2.91633L3.25945 7.92483C3.04073 8.14361 2.91786 8.44031 2.91786 8.74966C2.91786 9.05902 3.04073 9.35571 3.25945 9.5745C3.47823 9.79321 3.77492 9.91608 4.08428 9.91608C4.39364 9.91608 4.69033 9.79321 4.90911 9.5745L9.81728 4.566C10.2547 4.12843 10.5004 3.53505 10.5004 2.91633C10.5004 2.29761 10.2547 1.70423 9.81728 1.26666C9.37972 0.829232 8.78633 0.583496 8.16761 0.583496C7.5489 0.583496 6.95551 0.829232 6.51795 1.26666L1.6092 6.27458C0.952764 6.93101 0.583984 7.82133 0.583984 8.74966C0.583984 9.678 0.952764 10.5683 1.6092 11.2247C2.26563 11.8812 3.15594 12.25 4.08428 12.25C5.01262 12.25 5.90293 11.8812 6.55936 11.2247" stroke="white" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <span className="font-arimo">ATTACHMENTS</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Button variant="save-to-history" size="save-to-history">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                                        <path d="M8.86667 1.75C9.1744 1.75438 9.46793 1.88018 9.68333 2.1L11.9 4.31667C12.1198 4.53207 12.2456 4.8256 12.25 5.13333V11.0833C12.25 11.3928 12.1271 11.6895 11.9083 11.9083C11.6895 12.1271 11.3928 12.25 11.0833 12.25H2.91667C2.60725 12.25 2.3105 12.1271 2.09171 11.9083C1.87292 11.6895 1.75 11.3928 1.75 11.0833V2.91667C1.75 2.60725 1.87292 2.3105 2.09171 2.09171C2.3105 1.87292 2.60725 1.75 2.91667 1.75H8.86667Z" stroke="#FFDF20" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M9.91732 12.2497V8.16634C9.91732 8.01163 9.85586 7.86326 9.74646 7.75386C9.63707 7.64447 9.48869 7.58301 9.33398 7.58301H4.66732C4.51261 7.58301 4.36424 7.64447 4.25484 7.75386C4.14544 7.86326 4.08398 8.01163 4.08398 8.16634V12.2497" stroke="#FFDF20" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M4.08398 1.75V4.08333C4.08398 4.23804 4.14544 4.38642 4.25484 4.49581C4.36424 4.60521 4.51261 4.66667 4.66732 4.66667H8.75065" stroke="#FFDF20" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    Save to History
                                </Button>

                                <Button variant="send-alert" size="send-alert">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                                        <g clipPath="url(#clip0_121_3205)">
                                            <path d="M8.47857 12.65C8.50073 12.7052 8.53926 12.7524 8.58898 12.7851C8.6387 12.8178 8.69723 12.8345 8.75673 12.833C8.81622 12.8314 8.87382 12.8117 8.9218 12.7765C8.96978 12.7413 9.00585 12.6923 9.02515 12.636L12.8168 1.55266C12.8355 1.50098 12.8391 1.44504 12.8271 1.3914C12.8151 1.33776 12.7881 1.28864 12.7493 1.24978C12.7104 1.21092 12.6613 1.18393 12.6077 1.17197C12.554 1.16001 12.4981 1.16358 12.4464 1.18225L1.36307 4.97391C1.30677 4.99322 1.25773 5.02928 1.22253 5.07726C1.18732 5.12524 1.16764 5.18285 1.16611 5.24234C1.16459 5.30183 1.1813 5.36037 1.214 5.41009C1.24671 5.45981 1.29384 5.49833 1.34907 5.5205L5.9749 7.3755C6.12114 7.43404 6.254 7.5216 6.36548 7.63288C6.47696 7.74416 6.56476 7.87687 6.62357 8.023L8.47857 12.65Z" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                            <path d="M12.7489 1.25244L6.36719 7.63353" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </g>
                                        <defs>
                                            <clipPath id="clip0_121_3205">
                                                <rect width="14" height="14" fill="white" />
                                            </clipPath>
                                        </defs>
                                    </svg>
                                    Send
                                </Button>

                                <Button variant="telegram" size="social">
                                    <svg className="!w-5 !h-5" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 18 18" fill="none">
                                        <g clip-path="url(#clip0_121_3210)">
                                            <path d="M10.9019 16.2644C10.9303 16.3354 10.9799 16.396 11.0438 16.4381C11.1077 16.4801 11.183 16.5016 11.2595 16.4997C11.336 16.4977 11.41 16.4724 11.4717 16.4271C11.5334 16.3818 11.5798 16.3188 11.6046 16.2464L16.4796 1.99642C16.5036 1.92997 16.5082 1.85805 16.4928 1.78909C16.4774 1.72012 16.4427 1.65697 16.3928 1.607C16.3428 1.55704 16.2797 1.52234 16.2107 1.50696C16.1417 1.49159 16.0698 1.49617 16.0034 1.52017L1.75335 6.39517C1.68098 6.41999 1.61792 6.46636 1.57266 6.52805C1.52739 6.58974 1.50208 6.6638 1.50012 6.74029C1.49816 6.81678 1.51965 6.89204 1.5617 6.95597C1.60375 7.01989 1.66434 7.06943 1.73535 7.09792L7.68285 9.48292C7.87087 9.5582 8.04169 9.67077 8.18503 9.81384C8.32836 9.95692 8.44124 10.1275 8.51685 10.3154L10.9019 16.2644Z" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                            <path d="M16.3905 1.61035L8.18555 9.8146" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </g>
                                        <defs>
                                            <clipPath id="clip0_121_3210">
                                                <rect width="18" height="18" fill="white" />
                                            </clipPath>
                                        </defs>
                                    </svg>
                                </Button>

                                <Button variant="whatsapp" size="social">
                                    <svg className="!w-5 !h-5" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 18 18" fill="none">
                                        <g clipPath="url(#clip0_121_3214)">
                                            <path d="M5.925 15C7.35643 15.7343 9.00306 15.9332 10.5682 15.5609C12.1333 15.1885 13.5139 14.2694 14.4613 12.9692C15.4087 11.6689 15.8606 10.0731 15.7354 8.46916C15.6103 6.86524 14.9164 5.35876 13.7789 4.22118C12.6413 3.0836 11.1348 2.38972 9.53088 2.2646C7.92697 2.13947 6.3311 2.59132 5.03086 3.53872C3.73063 4.48612 2.81152 5.86677 2.43917 7.43187C2.06682 8.99697 2.26571 10.6436 3 12.075L1.5 16.5L5.925 15Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </g>
                                        <defs>
                                            <clipPath id="clip0_121_3214">
                                                <rect width="18" height="18" fill="white" />
                                            </clipPath>
                                        </defs>
                                    </svg>
                                </Button>

                                <Button variant="discord" size="social">
                                    <svg className="!w-5 !h-5" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 18 18" fill="none">
                                        <g clip-path="url(#clip0_121_3217)">
                                            <path d="M9 16.5C13.1421 16.5 16.5 13.1421 16.5 9C16.5 4.85786 13.1421 1.5 9 1.5C4.85786 1.5 1.5 4.85786 1.5 9C1.5 13.1421 4.85786 16.5 9 16.5Z" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                            <path d="M9 10.5C9.82843 10.5 10.5 9.82843 10.5 9C10.5 8.17157 9.82843 7.5 9 7.5C8.17157 7.5 7.5 8.17157 7.5 9C7.5 9.82843 8.17157 10.5 9 10.5Z" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                        </g>
                                        <defs>
                                            <clipPath id="clip0_121_3217">
                                                <rect width="18" height="18" fill="white" />
                                            </clipPath>
                                        </defs>
                                    </svg>
                                </Button>
                            </div>
                        </div>
                    </div>
                </Form >

                <div
                    className="absolute top-8 right-6"
                    role="button"
                    tabIndex={0}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 19 20" fill="none">
                        <path d="M7.45008 19.5L7.05792 16.367C6.71197 16.2623 6.33822 16.0983 5.93667 15.8752C5.53439 15.6513 5.19242 15.4115 4.91075 15.1558L2.02042 16.3854L0 12.8646L2.49817 10.9807C2.46567 10.7857 2.43931 10.5842 2.41908 10.3762C2.39742 10.1682 2.38658 9.96631 2.38658 9.77058C2.38658 9.58858 2.39742 9.39719 2.41908 9.19642C2.43931 8.99564 2.46567 8.76958 2.49817 8.51825L0 6.6365L2.02042 3.15683L4.88908 4.36583C5.21264 4.09644 5.56292 3.85342 5.93992 3.63675C6.31547 3.42008 6.68128 3.25253 7.03733 3.13408L7.449 0H11.492L11.8831 3.15467C12.2984 3.30056 12.6652 3.46775 12.9837 3.65625C13.3022 3.84475 13.6305 4.08092 13.9685 4.36475L16.9206 3.15683L18.941 6.63542L16.3605 8.58108C16.4197 8.80497 16.4529 9.01044 16.4602 9.1975C16.4674 9.38456 16.471 9.56872 16.471 9.75C16.471 9.91828 16.4638 10.0956 16.4493 10.2819C16.4356 10.469 16.4038 10.695 16.354 10.9601L18.8933 12.8646L16.8729 16.3854L13.9685 15.1353C13.6312 15.4191 13.2918 15.6621 12.9502 15.8643C12.6086 16.0666 12.2529 16.2273 11.8831 16.3464L11.492 19.5H7.45008ZM9.44125 12.4583C10.1967 12.4583 10.8369 12.1958 11.362 11.6708C11.8871 11.1457 12.1496 10.5054 12.1496 9.75C12.1496 8.99456 11.8871 8.35431 11.362 7.82925C10.8369 7.30419 10.1967 7.04167 9.44125 7.04167C8.68147 7.04167 8.04014 7.30419 7.51725 7.82925C6.99436 8.35431 6.73292 8.99456 6.73292 9.75C6.73292 10.5054 6.99436 11.1457 7.51725 11.6708C8.04014 12.1958 8.68147 12.4583 9.44125 12.4583Z" fill="white" />
                    </svg>
                </div>
            </div >
        </>
    );
};