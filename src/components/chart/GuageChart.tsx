"use client";

import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";
import styles from "./GuageChart.module.scss";
import GuageChartIndicator from "./GuageChartIndicator";

type CustomIndicatorStyle = {
    wrapperTransform?: string;
    needleTransform?: string;
    transformOrigin?: string;
    transition?: string;
    rotation?: number;
};

interface GaugeZone {
    name: string;
    minValue: number;
    maxValue: number;
    color: string;
}

type GuageChartProps = {
    style: CSSProperties;
    indicatorStyle: CustomIndicatorStyle | CSSProperties;
    labelType?: 'netBias' | 'other';
    gaugeZones?: readonly GaugeZone[];
    customLeftLabel?: string;
    customRightLabel?: string;
    customLeftLabelX?: number | string;
    customRightLabelX?: number | string;
    customLabelY?: number | string;
    hideArcLabels?: boolean;
    hideNeutralLabel?: boolean;
    splitCenterSegment?: boolean;
    renderIndicator?: (args: { rotation: number; transition?: string }) => ReactNode;
};

const DEFAULT_COLORS = [
    'rgba(137, 243, 54, 0.843)',
    'rgba(137, 243, 54, 0.575)',
    'rgba(137, 243, 54, 0.365)',
    '#FFFF00',
    'rgb(255, 119, 130)',
    'rgba(255, 119, 130, 0.575)',
    'rgba(255, 119, 130, 0.365)',
];

export default function GuageChart({
    style,
    indicatorStyle,
    labelType = 'other',
    gaugeZones = [],
    customLeftLabel,
    customRightLabel,
    customLeftLabelX = 2,
    customRightLabelX = 156,
    customLabelY = 95,
    hideArcLabels = false,
    hideNeutralLabel = false,
    splitCenterSegment = false,
    renderIndicator,
}: GuageChartProps) {
    const getColors = (): string[] => {
        if (gaugeZones.length === 7) {
            const sortedZones = [...gaugeZones].sort((a, b) => a.minValue - b.minValue);
            return [
                sortedZones[6].color,
                sortedZones[5].color,
                sortedZones[4].color,
                sortedZones[3].color,
                sortedZones[0].color,
                sortedZones[1].color,
                sortedZones[2].color,
            ];
        }
        return DEFAULT_COLORS;
    };

    const colors = getColors();
    const centerGradientId = "gauge-center-split";

    let customRotation: number | undefined;
    let customTransition: string | undefined;
    if (renderIndicator && indicatorStyle && typeof indicatorStyle === "object") {
        const custom = indicatorStyle as CustomIndicatorStyle;
        if (custom.rotation !== undefined) {
            customRotation = custom.rotation;
        } else if (custom.needleTransform) {
            const match = custom.needleTransform.match(/rotate\(([-\d.]+)deg\)/);
            customRotation = match ? parseFloat(match[1]) : 0;
        } else {
            customRotation = 0;
        }
        customTransition = custom.transition;
    }

    const { width: shellWidth, height: shellHeight, ...svgOnlyStyle } = style ?? {};
    const widthVal = shellWidth as string | number | undefined;
    const fluidWidth =
        widthVal === undefined ||
        widthVal === "100%" ||
        (typeof widthVal === "string" && widthVal.trim().endsWith("%"));

    const shellStyle: CSSProperties = {
        maxWidth: "100%",
        ...(fluidWidth ? { width: "100%" } : widthVal !== undefined ? { width: widthVal } : { width: "100%" }),
        ...(shellHeight !== undefined ? { height: shellHeight } : {}),
    };

    const svgStyle: CSSProperties = {
        width: "100%",
        height: shellHeight !== undefined ? "100%" : "auto",
        ...svgOnlyStyle,
    };

    return (
        <div className={cn(styles.guageChartOuter, fluidWidth && styles.guageChartOuterFluid, "text-foreground")}>
            <div className={styles.guageChartInner} style={shellStyle}>
                <svg
                    viewBox="0 0 156 95"
                    preserveAspectRatio="xMidYMid meet"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={svgStyle}
                    className={styles.guageChartImg}
                >
                <path d="M155.037 81.9635C155.037 71.2969 153.068 60.7329 149.24 50.864L131.598 58.5142C134.484 65.9555 135.968 73.9208 135.968 81.9635L155.037 81.9635Z" fill={colors[0]} />
                <path d="M149.516 51.5823C145.776 41.6755 140.244 32.6358 133.23 24.9701L119.525 38.99C124.815 44.77 128.986 51.5861 131.805 59.0558L149.516 51.5823Z" fill={colors[1]} />
                <path d="M133.399 25.1567C125.119 16.05 114.959 9.09039 103.714 4.82143L97.2704 23.7978C105.749 27.0166 113.409 32.2642 119.653 39.1308L133.399 25.1567Z" fill={colors[2]} />
                <path d="M103.559 4.76262C86.8617 -1.53383 68.6276 -1.58862 51.8965 4.60737L58.1997 23.6364C70.8151 18.9646 84.5638 19.0059 97.1538 23.7535C99.6553 16.3371 101.058 12.179 103.559 4.76262Z" fill={splitCenterSegment ? `url(#${centerGradientId})` : colors[3]} />
                <path d="M5.4608 51.7468C1.83694 61.4082 -0.0159747 71.7102 0.000822456 82.1037L19.0696 82.0693C19.0569 74.2325 20.454 66.4647 23.1864 59.1799L5.4608 51.7468Z" fill={colors[4]} />
                <path d="M20.4059 26.5446C13.7596 34.2022 8.55129 43.1265 5.05873 52.8418L22.8833 60.0056C25.5167 52.6802 29.4438 45.9512 34.4552 40.1773L20.4059 26.5446Z" fill={colors[5]} />
                <path d="M51.8838 4.612C39.5935 9.16573 28.5864 16.9201 19.8786 27.1591L34.0577 40.6406C40.6234 32.9203 48.9229 27.0735 58.1899 23.64L51.8838 4.612Z" fill={colors[6]} />
                <defs>
                    {splitCenterSegment && (
                        <linearGradient id={centerGradientId} x1="51.8965" y1="14.2" x2="103.559" y2="14.2" gradientUnits="userSpaceOnUse">
                            <stop offset="49.5%" stopColor={colors[4]} />
                            <stop offset="50.5%" stopColor={colors[2]} />
                        </linearGradient>
                    )}
                    <path id="leftArc" d="M 30 105 A 53 53 0 0 1 60 35" fill="none" />
                    <path id="centerArc" d="M 48 38 A 53 53 0 0 1 108 40" fill="none" />
                    <path id="rightArc" d="M 100 37 A 53 53 0 0 1 124 105" fill="none" />
                    <path id="leftArcLower" d="M 32 115 A 58 58 0 0 1 62 34" fill="none" />
                    <path id="rightArcLower" d="M 102 38 A 58 58 0 0 1 122 110" fill="none" />
                    <path id="riskOffArc" d="M 33 116 A 58 58 0 0 1 75 30" fill="none" />
                    <path id="riskOnArc" d="M 107 38 A 58 58 0 0 1 126 95" fill="none" />
                </defs>

                {!hideArcLabels && (
                    <>
                        {/* Arc-following labels — only rendered when NO custom labels */}
                        {!customLeftLabel && (
                            <text fontSize="8.5" fontWeight="700" fill="currentColor" textAnchor="middle" fontFamily="'Montserrat', 'Roboto', 'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif" letterSpacing="1px">
                                <textPath href={labelType === 'netBias' ? '#leftArcLower' : '#leftArc'} startOffset="50%">
                                    {labelType === 'netBias' ? 'Sell' : 'Bearish'}
                                </textPath>
                            </text>
                        )}

                        {!hideNeutralLabel && (
                            <text fontSize="8" fontWeight="700" fill="currentColor" textAnchor="middle" fontFamily="'Montserrat', 'Roboto', 'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif" letterSpacing="1px">
                                <textPath href="#centerArc" startOffset="50%">Neutral</textPath>
                            </text>
                        )}

                        {!customRightLabel && (
                            <text fontSize="8.5" fontWeight="700" fill="currentColor" textAnchor="middle" fontFamily="'Montserrat', 'Roboto', 'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif" letterSpacing="1px">
                                <textPath href={labelType === 'netBias' ? '#rightArcLower' : '#rightArc'} startOffset="50%">
                                    {labelType === 'netBias' ? 'Buy' : 'Bullish'}
                                </textPath>
                            </text>
                        )}

                        {/*
                          Custom labels: plain SVG <text> at fixed x/y coords.
                          The SVG viewBox is 156×83.
                          Left tip of gauge arc ends at roughly x=0, y=82.
                          Right tip ends at roughly x=155, y=82.
                          We place text just outside each tip, baseline-aligned to the bottom.
                        */}
                        {customLeftLabel && (
                            <text
                                x={customLeftLabelX}
                                y={customLabelY}
                                fontSize="8.5"
                                fontWeight="700"
                                fill="currentColor"
                                textAnchor="start"
                                dominantBaseline="auto"
                                fontFamily="'Montserrat', 'Roboto', 'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif"
                                letterSpacing="1px"
                            >
                                {customLeftLabel}
                            </text>
                        )}

                        {customRightLabel && (
                            <text
                                x={customRightLabelX}
                                y={customLabelY}
                                fontSize="8.5"
                                fontWeight="700"
                                fill="currentColor"
                                textAnchor="end"
                                dominantBaseline="auto"
                                fontFamily="'Montserrat', 'Roboto', 'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif"
                                letterSpacing="1px"
                            >
                                {customRightLabel}
                            </text>
                        )}
                    </>
                )}
                </svg>

                {renderIndicator ? (
                    renderIndicator({ rotation: customRotation ?? 0, transition: customTransition })
                ) : (
                    <GuageChartIndicator style={indicatorStyle} />
                )}
            </div>
        </div>
    );
}
