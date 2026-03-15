"use client";

import { useMemo } from "react";
import svgPaths from "@/lib/svg-world-map-dots";
import imgPk from "@/assets/flags/pk.png";
import imgAe from "@/assets/flags/ae.png";
import imgGb from "@/assets/flags/gb.png";
import imgIn from "@/assets/flags/in.png";
import imgUs from "@/assets/flags/us.png";

const countries = [
    { flag: imgPk, name: "Pakistan", value: "288%", valueColor: "#00d492" },
    { flag: imgAe, name: "UAE", value: "1,995", valueColor: "#cad5e2" },
    { flag: imgGb, name: "UK", value: "4,695", valueColor: "#cad5e2" },
    { flag: imgIn, name: "India", value: "4,267", valueColor: "#cad5e2" },
    { flag: imgIn, name: "India", value: "1,618", valueColor: "#cad5e2" },
    { flag: imgUs, name: "US", value: "2,860", valueColor: "#cad5e2" },
];

// Map location marker - concentric circles with blue color
function MapMarker({ size = "normal" }: { size?: "normal" | "large" }) {
    const outerSize = size === "large" ? "9.516px" : "7.93px";
    const middleSize = size === "large" ? "5.551px" : "4.758px";
    return (
        <>
            <div
                className="-translate-x-1/2 -translate-y-1/2 absolute bg-[#2e90fa] left-1/2 opacity-10 rounded-full top-1/2"
                style={{ width: outerSize, height: outerSize }}
            />
            <div
                className="-translate-x-1/2 -translate-y-1/2 absolute bg-[#2e90fa] left-1/2 opacity-20 rounded-full top-1/2"
                style={{ width: middleSize, height: middleSize }}
            />
            <div
                className="-translate-x-1/2 -translate-y-1/2 absolute bg-[#2e90fa] left-1/2 rounded-full top-1/2"
                style={{ width: "1.586px", height: "1.586px" }}
            />
        </>
    );
}

// World map rendered from SVG dot paths
function WorldMapContents() {
    const dotPaths = useMemo(() => {
        const entries = Object.entries(svgPaths as Record<string, string>);
        return entries.filter(([, pathData]) => {
            if (pathData.length > 350 || pathData.length < 100) return false;
            if (/[LHVZ]/i.test(pathData.replace(/^M/, ""))) return false;
            const cCount = (pathData.match(/C/g) || []).length;
            return cCount === 4;
        });
    }, []);

    return (
        <div className="absolute inset-[0.2px_-0.12px_0.8px_0]">
            <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 203.116 96.0063">
                <g>
                    {dotPaths.map(([key, pathData]) => (
                        <path key={key} clipRule="evenodd" d={pathData} fill="#D0D5DD" fillRule="evenodd" />
                    ))}
                </g>
            </svg>
        </div>
    );
}

function MapWrap() {
    return (
        <div className="relative h-[96.742px] w-[203px] mx-auto mt-5">
            <WorldMapContents />
            <div className="absolute inset-[83.2%_9.67%_8.61%_86.43%] rounded-[28px]">
                <MapMarker size="large" />
            </div>
            <div className="absolute inset-[86.89%_2.54%_4.92%_93.55%] rounded-[28px]">
                <MapMarker />
            </div>
            <div className="absolute inset-[32.17%_83.4%_59.63%_12.7%] rounded-[28px]">
                <MapMarker />
            </div>
            <div className="absolute bottom-1/2 left-[15.43%] right-[80.66%] rounded-[28px] top-[41.8%]">
                <MapMarker />
            </div>
            <div className="absolute inset-[19.88%_45.21%_71.93%_50.88%] rounded-[28px]">
                <MapMarker />
            </div>
            <div className="absolute inset-[45.9%_29.88%_45.9%_66.21%] rounded-[28px]">
                <MapMarker />
            </div>
            <div className="absolute inset-[40.78%_13.77%_51.02%_82.32%] rounded-[28px]">
                <MapMarker />
            </div>
            <div className="absolute inset-[14.96%_39.36%_76.84%_56.74%] rounded-[28px]">
                <MapMarker />
            </div>
            <div className="absolute inset-[36.07%_46%_55.74%_50.1%] rounded-[28px]">
                <MapMarker />
            </div>
        </div>
    );
}

export default function TopCountriesChart() {
    return (
        <div className="bg-darkGrey rounded-[12px] overflow-hidden w-full min-w-0 min-h-[370px] relative p-6 flex flex-col gap-8 text-foreground">
            {/* World Map */}
            <MapWrap />

            {/* Country List */}
            <div className="flex flex-col gap-[23px] w-full max-w-[284px] mx-auto">
                {countries.map((country, index) => (
                    <div key={index} className="flex h-[16px] items-center justify-between w-full">
                        <div className="flex gap-[12px] items-center h-[16px]">
                            <div className="w-[20px] h-[14px] relative rounded-[4px] overflow-hidden">
                                <img
                                    src={typeof country.flag === "string" ? country.flag : country.flag.src}
                                    alt={country.name}
                                    className="absolute inset-0 w-full h-full object-cover rounded-[4px]"
                                />
                            </div>
                            <p className="font-['Arial',sans-serif] font-bold text-[12px] leading-[16px] text-secondary tracking-[-0.16px]">
                                {country.name}
                            </p>
                        </div>
                        <p
                            className="font-['Arial',sans-serif] font-bold text-[12px] leading-[16px] tracking-[-0.16px]"
                            style={{ color: country.valueColor }}
                        >
                            {country.value}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
