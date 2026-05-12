"use client";

import defaultIndicatorStyles from "./GuageChartIndicator.module.scss";
import currencySeasonalStyles from "./SeasonalGaugeNeedle.module.scss";

const PIVOT_X = 24.377;
const PIVOT_Y = 13.7272;

type SeasonalGaugeNeedleProps = {
    rotationDeg: number;
    isDark: boolean;
    transition?: string;
    width?: string;
    height?: string;
    style?: React.CSSProperties;
    /** Currency Seasonal Trends page: wrapper top/left + default 35×25px needle */
    layout?: "default" | "currencySeasonal";
};

/**
 * Custom needle for seasonal currency gauges — matches forex-admin pivot/transition behavior;
 * SVG rotates around ellipse pivot (same pattern as GuageChartIndicator).
 */
export default function SeasonalGaugeNeedle({
    rotationDeg,
    isDark,
    transition = "0.8s ease-out",
    width,
    height,
    style,
    layout = "default",
}: SeasonalGaugeNeedleProps) {
    const lineStroke = isDark ? "#E5E7EB" : "#121417";
    const hubFill = "#E5E7EB";
    // The provided SVG points left from hub, while admin needle geometry points right.
    // Flip around pivot first, then apply admin-equivalent rotation.
    const flipAroundPivot = `translate(${PIVOT_X * 2} 0) scale(-1 1)`;

    const isCurrencySeasonal = layout === "currencySeasonal";
    const indicatorStyles = isCurrencySeasonal ? currencySeasonalStyles : defaultIndicatorStyles;
    const w = width ?? (isCurrencySeasonal ? "35px" : "29px");
    const h = height ?? (isCurrencySeasonal ? "25px" : "19px");

    return (
        <div
            className={indicatorStyles.needleWrapper}
            style={{
                ...(isCurrencySeasonal ? {} : { transform: "translate(0%, 18%)" }),
                transition,
                ...style,
            }}
        >
            <svg
                width={w}
                height={h}
                viewBox="0 0 29 19"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={indicatorStyles.guageChartIndicator}
                style={{ overflow: "visible", transition }}
            >
                <g transform={`rotate(${rotationDeg} ${PIVOT_X} ${PIVOT_Y})`}>
                    <g transform={flipAroundPivot}>
                        <line
                            x1="24.0138"
                            y1="13.3561"
                            x2="1.00021"
                            y2="1.34907"
                            stroke={lineStroke}
                            strokeWidth="2"
                            strokeLinecap="round"
                        />
                        <ellipse
                            cx="24.377"
                            cy="13.7272"
                            rx="3.26659"
                            ry="3.32357"
                            transform={`rotate(-150 ${PIVOT_X} ${PIVOT_Y})`}
                            fill={hubFill}
                        />
                    </g>
                </g>
            </svg>
        </div>
    );
}
