import React from 'react';

interface GaugeZone {
    color: string;
    name: string;
    minValue: number;
    maxValue: number;
}

interface FxAnalyzerGaugeProps {
    score: number | null;
    label: string;
    gaugeZones: GaugeZone[];
    getGaugeIndicatorStyleDynamic: (score: number | null, size: string) => React.CSSProperties & { wrapperTransform?: string; needleTransform?: string; rotation?: number };
    GuageChart: React.ComponentType<{
        style: React.CSSProperties;
        indicatorStyle: React.CSSProperties;
        labelType?: "netBias" | "other";
        gaugeZones: GaugeZone[];
        customLeftLabel?: string;
        customRightLabel?: string;
    }>;
    width?: string;
    indicatorSize?: string;
}

const FxAnalyzerGauge: React.FC<FxAnalyzerGaugeProps> = ({
    score,
    label,
    gaugeZones,
    getGaugeIndicatorStyleDynamic,
    GuageChart,
    width = "130px",
    indicatorSize = "40px"
}) => {
    return (
        <div className="text-center">
            <GuageChart
                style={{ width }}
                indicatorStyle={getGaugeIndicatorStyleDynamic(score, indicatorSize)}
                gaugeZones={gaugeZones}
            />
            <h1 className="mt-2.5 text-[12px] font-semibold text-foreground">
                {label}
            </h1>
        </div>
    );
};

export default FxAnalyzerGauge;
