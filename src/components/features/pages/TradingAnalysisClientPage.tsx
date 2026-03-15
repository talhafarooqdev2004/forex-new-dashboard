"use client";

import { Icon } from "@/components/composed";
import { MonthlyGainsChart, RelativeDrawdownAnalysisChart } from "@/components/composed/Charts";
import { DrawdownGuage, TradeResultGuage } from "@/components/composed/Guages";
import { Section } from "@/components/ui/layout";
import Container from "@/components/ui/layout/Container";
import { cn } from "@/lib/utils";

export default function TradingAnalysisClientPage() {
    return (
        <Container>
            <AnalyticCards>
                <AnalyticCard className="px-[60px] col-span-3 3xl:col-span-2">
                    <div className="flex items-center gap-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 18 18" fill="none">
                            <g clipPath="url(#clip0_32_1267)">
                                <path d="M5.93359 1.4834V4.45005" stroke="white" strokeWidth="1.48333" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M11.8672 1.4834V4.45005" stroke="white" strokeWidth="1.48333" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M14.0912 2.9668H3.70793C2.88872 2.9668 2.22461 3.6309 2.22461 4.45012V14.8334C2.22461 15.6526 2.88872 16.3167 3.70793 16.3167H14.0912C14.9104 16.3167 15.5745 15.6526 15.5745 14.8334V4.45012C15.5745 3.6309 14.9104 2.9668 14.0912 2.9668Z" stroke="white" strokeWidth="1.48333" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M2.22461 7.41602H15.5745" stroke="white" strokeWidth="1.48333" strokeLinecap="round" strokeLinejoin="round" />
                            </g>
                            <defs>
                                <clipPath id="clip0_32_1267">
                                    <rect width="17.7999" height="17.7999" fill="white" />
                                </clipPath>
                            </defs>
                        </svg>
                        <span className="text-[15px]">Start Date</span>
                    </div>

                    <span className="font-semibold text-lg">Dec 28, 2024</span>
                </AnalyticCard>

                <AnalyticCard className="px-[60px] col-span-3">
                    <div className="flex items-center gap-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 18 18" fill="none">
                            <g clipPath="url(#clip0_32_1267)">
                                <path d="M5.93359 1.4834V4.45005" stroke="white" strokeWidth="1.48333" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M11.8672 1.4834V4.45005" stroke="white" strokeWidth="1.48333" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M14.0912 2.9668H3.70793C2.88872 2.9668 2.22461 3.6309 2.22461 4.45012V14.8334C2.22461 15.6526 2.88872 16.3167 3.70793 16.3167H14.0912C14.9104 16.3167 15.5745 15.6526 15.5745 14.8334V4.45012C15.5745 3.6309 14.9104 2.9668 14.0912 2.9668Z" stroke="white" strokeWidth="1.48333" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M2.22461 7.41602H15.5745" stroke="white" strokeWidth="1.48333" strokeLinecap="round" strokeLinejoin="round" />
                            </g>
                            <defs>
                                <clipPath id="clip0_32_1267">
                                    <rect width="17.7999" height="17.7999" fill="white" />
                                </clipPath>
                            </defs>
                        </svg>
                        <span className="text-[15px]">End Date</span>
                    </div>

                    <span className="font-semibold text-lg">Jan 08, 2025</span>
                </AnalyticCard>

                <AnalyticCard className="px-7 col-span-3 3xl:col-span-2">
                    <div className="flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="17" viewBox="0 0 15 17" fill="none">
                            <path d="M7.05272 0C7.93677 0 8.78462 0.35119 9.40974 0.976311C10.0349 1.60143 10.3861 2.44928 10.3861 3.33333H12.0819C12.5137 3.33328 12.9287 3.50082 13.2394 3.80068C13.5502 4.10053 13.7324 4.50929 13.7477 4.94083L14.1044 14.9408C14.1123 15.1645 14.0751 15.3875 13.9951 15.5964C13.915 15.8054 13.7936 15.9961 13.6382 16.1572C13.4828 16.3182 13.2966 16.4464 13.0906 16.5339C12.8847 16.6214 12.6632 16.6666 12.4394 16.6667H1.66605C1.44225 16.6666 1.22076 16.6214 1.01479 16.5339C0.808822 16.4464 0.622591 16.3182 0.467205 16.1572C0.31182 15.9961 0.190464 15.8054 0.110375 15.5964C0.0302864 15.3875 -0.00689425 15.1645 0.00105061 14.9408L0.357717 4.94083C0.373047 4.50929 0.555272 4.10053 0.866008 3.80068C1.17674 3.50082 1.59173 3.33328 2.02355 3.33333H3.71938C3.71938 2.44928 4.07057 1.60143 4.69569 0.976311C5.32082 0.35119 6.16866 0 7.05272 0ZM5.38605 5H3.71938V5.83333C3.71962 6.04573 3.80095 6.25003 3.94676 6.40447C4.09256 6.55892 4.29184 6.65186 4.50388 6.66431C4.71591 6.67676 4.9247 6.60777 5.08758 6.47145C5.25045 6.33512 5.35513 6.14175 5.38022 5.93083L5.38605 5.83333V5ZM10.3861 5H8.71938V5.83333C8.71938 6.05435 8.80718 6.26631 8.96346 6.42259C9.11974 6.57887 9.3317 6.66667 9.55272 6.66667C9.77373 6.66667 9.98569 6.57887 10.142 6.42259C10.2983 6.26631 10.3861 6.05435 10.3861 5.83333V5ZM7.05272 1.66667C6.63224 1.66653 6.22724 1.82534 5.91893 2.11125C5.61061 2.39716 5.42175 2.78904 5.39022 3.20833L5.38605 3.33333H8.71938C8.71938 2.89131 8.54379 2.46738 8.23123 2.15482C7.91867 1.84226 7.49474 1.66667 7.05272 1.66667Z" fill="#05DF72" />
                        </svg>
                        <span className="text-[15px]">Total Profit/Loss</span>

                        <svg xmlns="http://www.w3.org/2000/svg" width="8" height="7" viewBox="0 0 8 7" fill="none">
                            <path d="M3.89648 0L7.7936 6.75H-0.000629902L3.89648 0Z" fill="#05DF72" />
                        </svg>
                    </div>

                    <span className="font-semibold text-lg text-[#05DF72]">$10,000</span>
                </AnalyticCard>

                <AnalyticCard className="px-[60px] col-span-3 3xl:col-span-2">
                    <span className="text-[15px] text-center">Profit factor</span>

                    <span className="font-semibold text-lg text-center">2.5</span>
                </AnalyticCard>

                <AnalyticCard className="px-5 col-span-3 3xl:col-span-2">
                    <div className="flex items-center gap-2">
                        <Icon name="total-trade-icon.svg" width={20} height={20} />
                        <span className="text-[15px]">Portfolio Balance</span>

                        <button
                            className="absolute right-3 top-1/2 -translate-y-1/2"
                        >
                            <Icon name="trading-settings.svg" width={28} height={28} />
                        </button>
                    </div>

                    <span className="font-semibold text-lg text-[#05DF72]">$10,000</span>
                </AnalyticCard>

                <AnalyticCard className="px-[40px] col-span-3 3xl:col-span-2">
                    <div className="flex items-center gap-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="15" viewBox="0 0 12 15" fill="none">
                            <path d="M1.41667 0C0.6375 0 0.0070835 0.6375 0.0070835 1.41667L0 12.75C0 13.5292 0.630416 14.1667 1.40958 14.1667H9.91667C10.6958 14.1667 11.3333 13.5292 11.3333 12.75V4.25L7.08333 0H1.41667ZM6.375 4.95833V1.0625L10.2708 4.95833H6.375Z" fill="white" />
                        </svg>
                        <span className="text-[15px]">Total Trade</span>
                    </div>

                    <span className="font-semibold text-lg">11</span>
                </AnalyticCard>

                <AnalyticCard className="px-[22px] col-span-3 3xl:col-span-2">
                    <div className="flex items-center justify-center gap-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none">
                            <path d="M6.57422 14.875H12.2852C12.8064 14.875 13.2348 14.5563 13.4207 14.098L15.3166 9.60234C15.373 9.45625 15.4029 9.30352 15.4029 9.1375V7.85586C15.4029 7.15527 14.8385 6.375 14.1479 6.375H10.19L10.7877 3.66895L10.8076 3.46973C10.8076 3.20742 10.7014 2.96836 10.532 2.7957L9.86133 2.125L5.67773 6.35176C5.45195 6.58086 5.3125 6.89961 5.3125 7.25156V13.6266C5.3125 14.3271 5.88359 14.875 6.57422 14.875Z" fill="#00C800" />
                            <path d="M1.59375 7.4375H3.71875V14.875H1.59375V7.4375Z" fill="#00C800" />
                        </svg>
                        <span className="text-[15px]">Winning Trades</span>
                    </div>

                    <div className="flex items-center gap-1 justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none">
                            <path d="M8.49935 1.41699C4.58935 1.41699 1.41602 4.59033 1.41602 8.50033C1.41602 12.4103 4.58935 15.5837 8.49935 15.5837C12.4093 15.5837 15.5827 12.4103 15.5827 8.50033C15.5827 4.59033 12.4093 1.41699 8.49935 1.41699ZM7.08268 12.042L3.54102 8.50033L4.53977 7.50158L7.08268 10.0374L12.4589 4.66116L13.4577 5.66699L7.08268 12.042Z" fill="#00C950" />
                        </svg>
                        <span className="font-semibold text-lg">08</span>
                    </div>
                </AnalyticCard>

                <AnalyticCard className="px-7 col-span-3 3xl:col-span-2">
                    <div className="flex items-center justify-center gap-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M7.73437 2.5H14.4531C15.0664 2.5 15.5703 2.875 15.7891 3.41406L18.0195 8.70312C18.0859 8.875 18.1211 9.05469 18.1211 9.25V10.7578C18.1211 11.582 17.457 12.5 16.6445 12.5H11.9883L12.6914 15.6836L12.7148 15.918C12.7148 16.2266 12.5898 16.5078 12.3906 16.7109L11.6016 17.5L6.67969 12.5273C6.41406 12.2578 6.25 11.8828 6.25 11.4688V3.96875C6.25 3.14453 6.92187 2.5 7.73437 2.5Z" fill="#FF0000" />
                            <path d="M1.875 11.25H4.375V2.5H1.875V11.25Z" fill="#FF0000" />
                        </svg>
                        <span className="text-[15px]">Losing Trades</span>
                    </div>

                    <div className="flex items-center gap-1 justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none">
                            <path d="M14.2708 2.4375C11.0208 -0.8125 5.6875 -0.8125 2.4375 2.4375C-0.8125 5.6875 -0.8125 11.0208 2.4375 14.2708C5.6875 17.5208 10.9375 17.5208 14.1875 14.2708C17.4375 11.0208 17.5208 5.6875 14.2708 2.4375ZM10.6875 11.8542L8.35417 9.52083L6.02083 11.8542L4.85417 10.6875L7.1875 8.35417L4.85417 6.02083L6.02083 4.85417L8.35417 7.1875L10.6875 4.85417L11.8542 6.02083L9.52083 8.35417L11.8542 10.6875L10.6875 11.8542Z" fill="#F54900" />
                        </svg>
                        <span className="font-semibold text-lg">03</span>
                    </div>
                </AnalyticCard>

                <AnalyticCard className="px-[37px] col-span-3 3xl:col-span-2">
                    <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="14" viewBox="0 0 15 14" fill="none">
                            <path d="M8.07039 0.292893C7.67986 -0.0976314 7.0467 -0.0976315 6.65618 0.292893L0.292214 6.65685C-0.0983106 7.04738 -0.0983107 7.68054 0.292214 8.07107C0.682738 8.46159 1.3159 8.46159 1.70643 8.07107L7.36328 2.41421L13.0201 8.07107C13.4107 8.46159 14.0438 8.46159 14.4343 8.07107C14.8249 7.68054 14.8249 7.04738 14.4343 6.65685L8.07039 0.292893ZM7.36328 14L8.36328 14L8.36328 1L7.36328 1L6.36328 1L6.36328 14L7.36328 14Z" fill="#00C800" />
                        </svg>
                        <span className="text-[15px]">Average Win</span>
                    </div>

                    <span className="font-semibold text-lg">$375</span>
                </AnalyticCard>

                <AnalyticCard className="px-[37px] col-span-3 3xl:col-span-2">
                    <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="26" viewBox="0 0 18 26" fill="none">
                            <path d="M6.65617 19.5733C7.0467 19.9638 7.67986 19.9638 8.07039 19.5733L14.4343 13.2094C14.8249 12.8188 14.8249 12.1857 14.4343 11.7951C14.0438 11.4046 13.4107 11.4046 13.0201 11.7951L7.36328 17.452L1.70643 11.7951C1.3159 11.4046 0.682738 11.4046 0.292213 11.7951C-0.0983112 12.1857 -0.0983113 12.8188 0.292213 13.2094L6.65617 19.5733ZM7.36328 5.86621L6.36328 5.86621L6.36328 18.8662L7.36328 18.8662L8.36328 18.8662L8.36328 5.86621L7.36328 5.86621Z" fill="#F54900" />
                        </svg>
                        <span className="text-[15px]">Average Loss</span>
                    </div>

                    <span className="font-semibold text-lg">-$2,875.00</span>
                </AnalyticCard>

                <AnalyticCard className="px-[37px] col-span-3 3xl:col-span-2">
                    <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="26" viewBox="0 0 18 26" fill="none">
                            <path d="M6.65617 19.5733C7.0467 19.9638 7.67986 19.9638 8.07039 19.5733L14.4343 13.2094C14.8249 12.8188 14.8249 12.1857 14.4343 11.7951C14.0438 11.4046 13.4107 11.4046 13.0201 11.7951L7.36328 17.452L1.70643 11.7951C1.3159 11.4046 0.682738 11.4046 0.292213 11.7951C-0.0983112 12.1857 -0.0983113 12.8188 0.292213 13.2094L6.65617 19.5733ZM7.36328 5.86621L6.36328 5.86621L6.36328 18.8662L7.36328 18.8662L8.36328 18.8662L8.36328 5.86621L7.36328 5.86621Z" fill="#F54900" />
                        </svg>
                        <span className="text-[15px]">Max Drawdown</span>
                    </div>
                    <span className="font-semibold text-lg">-$2,875.00</span>
                </AnalyticCard>

                <AnalyticCard className="px-7 col-span-4 !items-stretch !justify-start text-left">
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M9.99998 1.66699C10.884 1.66699 11.7319 2.01818 12.357 2.6433C12.9821 3.26842 13.3333 4.11627 13.3333 5.00033H15.0291C15.461 5.00027 15.876 5.16782 16.1867 5.46767C16.4974 5.76752 16.6797 6.17628 16.695 6.60783L17.0516 16.6078C17.0596 16.8315 17.0224 17.0545 16.9423 17.2634C16.8622 17.4724 16.7409 17.6631 16.5855 17.8242C16.4301 17.9852 16.2439 18.1134 16.0379 18.2009C15.8319 18.2884 15.6104 18.3336 15.3867 18.3337H4.61332C4.38952 18.3336 4.16803 18.2884 3.96206 18.2009C3.75609 18.1134 3.56986 17.9852 3.41447 17.8242C3.25909 17.6631 3.13773 17.4724 3.05764 17.2634C2.97755 17.0545 2.94037 16.8315 2.94832 16.6078L3.30498 6.60783C3.32031 6.17628 3.50254 5.76752 3.81327 5.46767C4.12401 5.16782 4.539 5.00027 4.97082 5.00033H6.66665C6.66665 4.11627 7.01784 3.26842 7.64296 2.6433C8.26808 2.01818 9.11593 1.66699 9.99998 1.66699ZM8.33332 6.66699H6.66665V7.50033C6.66688 7.71273 6.74822 7.91702 6.89402 8.07147C7.03983 8.22591 7.23911 8.31886 7.45115 8.3313C7.66318 8.34375 7.87197 8.27476 8.03484 8.13844C8.19772 8.00211 8.3024 7.80874 8.32748 7.59783L8.33332 7.50033V6.66699ZM13.3333 6.66699H11.6666V7.50033C11.6666 7.72134 11.7544 7.9333 11.9107 8.08958C12.067 8.24586 12.279 8.33366 12.5 8.33366C12.721 8.33366 12.933 8.24586 13.0892 8.08958C13.2455 7.9333 13.3333 7.72134 13.3333 7.50033V6.66699ZM9.99998 3.33366C9.5795 3.33353 9.17451 3.49233 8.86619 3.77824C8.55787 4.06415 8.36902 4.45603 8.33748 4.87533L8.33332 5.00033H11.6666C11.6666 4.5583 11.4911 4.13437 11.1785 3.82181C10.8659 3.50925 10.442 3.33366 9.99998 3.33366Z" fill="#05DF72" />
                            </svg>
                            <span className="text-[15px]">Max Daily Loss</span>
                        </div>

                        <div className="bg-[#E7000B] rounded-[6px] px-3 h-[30px] flex items-center justify-center"><span className="text-sm">-$500(50%)</span></div>
                    </div>

                    <span className="font-semibold text-lg">Buffer Remaining: $380</span>
                </AnalyticCard>

                <AnalyticCard className="px-7 col-span-4 !items-stretch !justify-start text-left">
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M9.99998 1.66699C10.884 1.66699 11.7319 2.01818 12.357 2.6433C12.9821 3.26842 13.3333 4.11627 13.3333 5.00033H15.0291C15.461 5.00027 15.876 5.16782 16.1867 5.46767C16.4974 5.76752 16.6797 6.17628 16.695 6.60783L17.0516 16.6078C17.0596 16.8315 17.0224 17.0545 16.9423 17.2634C16.8622 17.4724 16.7409 17.6631 16.5855 17.8242C16.4301 17.9852 16.2439 18.1134 16.0379 18.2009C15.8319 18.2884 15.6104 18.3336 15.3867 18.3337H4.61332C4.38952 18.3336 4.16803 18.2884 3.96206 18.2009C3.75609 18.1134 3.56986 17.9852 3.41447 17.8242C3.25909 17.6631 3.13773 17.4724 3.05764 17.2634C2.97755 17.0545 2.94037 16.8315 2.94832 16.6078L3.30498 6.60783C3.32031 6.17628 3.50254 5.76752 3.81327 5.46767C4.12401 5.16782 4.539 5.00027 4.97082 5.00033H6.66665C6.66665 4.11627 7.01784 3.26842 7.64296 2.6433C8.26808 2.01818 9.11593 1.66699 9.99998 1.66699ZM8.33332 6.66699H6.66665V7.50033C6.66688 7.71273 6.74822 7.91702 6.89402 8.07147C7.03983 8.22591 7.23911 8.31886 7.45115 8.3313C7.66318 8.34375 7.87197 8.27476 8.03484 8.13844C8.19772 8.00211 8.3024 7.80874 8.32748 7.59783L8.33332 7.50033V6.66699ZM13.3333 6.66699H11.6666V7.50033C11.6666 7.72134 11.7544 7.9333 11.9107 8.08958C12.067 8.24586 12.279 8.33366 12.5 8.33366C12.721 8.33366 12.933 8.24586 13.0892 8.08958C13.2455 7.9333 13.3333 7.72134 13.3333 7.50033V6.66699ZM9.99998 3.33366C9.5795 3.33353 9.17451 3.49233 8.86619 3.77824C8.55787 4.06415 8.36902 4.45603 8.33748 4.87533L8.33332 5.00033H11.6666C11.6666 4.5583 11.4911 4.13437 11.1785 3.82181C10.8659 3.50925 10.442 3.33366 9.99998 3.33366Z" fill="#05DF72" />
                            </svg>
                            <span className="text-[15px]">Max Allowed Loss</span>
                        </div>

                        <div className="bg-[#E7000B] rounded-[6px] px-3 h-[30px] flex items-center justify-center"><span className="text-sm">-$500(50%)</span></div>
                    </div>

                    <span className="font-semibold text-lg">Buffer Remaining: $380</span>
                </AnalyticCard>

                <AnalyticCard className="px-7 col-span-4 !items-stretch !justify-start text-left">
                    <div className="flex justify-between w-full">
                        <div className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M9.99998 1.66699C10.884 1.66699 11.7319 2.01818 12.357 2.6433C12.9821 3.26842 13.3333 4.11627 13.3333 5.00033H15.0291C15.461 5.00027 15.876 5.16782 16.1867 5.46767C16.4974 5.76752 16.6797 6.17628 16.695 6.60783L17.0516 16.6078C17.0596 16.8315 17.0224 17.0545 16.9423 17.2634C16.8622 17.4724 16.7409 17.6631 16.5855 17.8242C16.4301 17.9852 16.2439 18.1134 16.0379 18.2009C15.8319 18.2884 15.6104 18.3336 15.3867 18.3337H4.61332C4.38952 18.3336 4.16803 18.2884 3.96206 18.2009C3.75609 18.1134 3.56986 17.9852 3.41447 17.8242C3.25909 17.6631 3.13773 17.4724 3.05764 17.2634C2.97755 17.0545 2.94037 16.8315 2.94832 16.6078L3.30498 6.60783C3.32031 6.17628 3.50254 5.76752 3.81327 5.46767C4.12401 5.16782 4.539 5.00027 4.97082 5.00033H6.66665C6.66665 4.11627 7.01784 3.26842 7.64296 2.6433C8.26808 2.01818 9.11593 1.66699 9.99998 1.66699ZM8.33332 6.66699H6.66665V7.50033C6.66688 7.71273 6.74822 7.91702 6.89402 8.07147C7.03983 8.22591 7.23911 8.31886 7.45115 8.3313C7.66318 8.34375 7.87197 8.27476 8.03484 8.13844C8.19772 8.00211 8.3024 7.80874 8.32748 7.59783L8.33332 7.50033V6.66699ZM13.3333 6.66699H11.6666V7.50033C11.6666 7.72134 11.7544 7.9333 11.9107 8.08958C12.067 8.24586 12.279 8.33366 12.5 8.33366C12.721 8.33366 12.933 8.24586 13.0892 8.08958C13.2455 7.9333 13.3333 7.72134 13.3333 7.50033V6.66699ZM9.99998 3.33366C9.5795 3.33353 9.17451 3.49233 8.86619 3.77824C8.55787 4.06415 8.36902 4.45603 8.33748 4.87533L8.33332 5.00033H11.6666C11.6666 4.5583 11.4911 4.13437 11.1785 3.82181C10.8659 3.50925 10.442 3.33366 9.99998 3.33366Z" fill="#05DF72" />
                            </svg>
                            <span>Risk Less Line</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                            <svg className="mt-0.5" xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 15 15" fill="none">
                                <path d="M7.08333 0C3.17333 0 0 3.17333 0 7.08333C0 10.9933 3.17333 14.1667 7.08333 14.1667C10.9933 14.1667 14.1667 10.9933 14.1667 7.08333C14.1667 3.17333 10.9933 0 7.08333 0ZM5.66667 10.625L2.125 7.08333L3.12375 6.08458L5.66667 8.62042L11.0429 3.24417L12.0417 4.25L5.66667 10.625Z" fill="#00C950" />
                            </svg>
                            <span className="text-greenDark font-semibold text-lg">SAFE</span>
                        </div>
                    </div>
                </AnalyticCard>
            </AnalyticCards>

            <div className="flex flex-col xl:flex-row gap-6 min-w-0 items-start">
                <Section hasFlex={false} className="w-full xl:w-[80%] min-w-0">
                    <RelativeDrawdownAnalysisChart />
                </Section>

                <Section hasFlex={false} className="w-fit xl:w-[20%] flex flex-col flex-shrink-0 items-center">
                    <DrawdownGuage type="daily" />
                    <DrawdownGuage type="total" />
                </Section>
            </div>

            <div className="flex flex-col xl:flex-row gap-6 min-w-0">
                <Section className="w-full xl:w-[60%] min-w-0 flex-1">
                    <MonthlyGainsChart />
                </Section>

                <div className="flex flex-row gap-6 w-full xl:w-[40%] flex-shrink-0">
                    <Section className="flex-1 min-w-0">
                        <TradeResultGuage label="Profit/Loss" profitValue="3000" lossValue="125" />
                    </Section>

                    <Section className="flex-1 min-w-0">
                        <TradeResultGuage label="Winning/Loss Trend" profitValue="8" lossValue="5" />
                    </Section>
                </div>
            </div>
        </Container >
    );
};

type AnalyticCardsProps = React.PropsWithChildren<{
    className?: string;
}>;

function AnalyticCards({ className, children }: AnalyticCardsProps) {
    return (
        <div className={`grid grid-cols-12 gap-4 min-w-0 ${className ?? ""}`}>
            {children}
        </div>
    );
};

function AnalyticCard({ className, children }: React.PropsWithChildren<{ className?: string }>) {
    return (
        <div className={cn("flex flex-col items-center justify-center text-center gap-[8px] bg-darkGrey rounded-xl py-6 px-4 relative", className)}>
            {children}
        </div>
    );
};