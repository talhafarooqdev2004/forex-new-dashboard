"use client";

import GuageChart from "@/components/chart/GuageChart";
import SeasonalGaugeNeedle from "@/components/chart/SeasonalGaugeNeedle";
import type { CentralBankPolicyRow } from "@/lib/fundamentalDashboardData";
import { FX_TMV_GAUGE_ZONES_DARK, FX_TMV_GAUGE_ZONES_LIGHT, type FxTmvGaugeZoneList } from "@/lib/fxTmvGaugeZones";
import { getRotationForCentralBankPolicyStanceScore } from "@/lib/seasonalGauge";

type CentralBankPoliciesSectionProps = {
    rows: CentralBankPolicyRow[];
    isDark: boolean;
};

const STANCE_ZONE_NAMES = ["Strong Dovish", "Dovish", "Weak Dovish", "Neutral", "Weak Hawkish", "Hawkish", "Strong Hawkish"] as const;
const DARK_STANCE_GAUGE_ZONES: FxTmvGaugeZoneList = FX_TMV_GAUGE_ZONES_DARK.map((zone, index) => ({
    ...zone,
    name: STANCE_ZONE_NAMES[index]!,
}));
const LIGHT_STANCE_GAUGE_ZONES: FxTmvGaugeZoneList = FX_TMV_GAUGE_ZONES_LIGHT.map((zone, index) => ({
    ...zone,
    name: STANCE_ZONE_NAMES[index]!,
}));

function CentralBankPolicyRowItem({
    row,
    gaugeZones,
    isDark,
}: {
    row: CentralBankPolicyRow;
    gaugeZones: FxTmvGaugeZoneList;
    isDark: boolean;
}) {
    return (
        <tr className="text-sm align-middle">
            <td className="border-b-2 border-solid border-stroke py-7 pr-1 font-semibold whitespace-nowrap align-middle md:py-3.5">
                <span className="flex items-center gap-2">
                    <span className="text-base leading-none" aria-hidden>
                        {row.flagEmoji}
                    </span>
                    <span>{row.centralBank}</span>
                </span>
            </td>
            <td className="border-b-2 border-solid border-stroke py-7 px-1 font-semibold whitespace-nowrap tabular-nums align-middle md:py-3.5">
                {row.currentRate}
            </td>
            <td className="border-b-2 border-solid border-stroke py-7 px-1 whitespace-nowrap align-middle md:py-3.5">{row.lastChange}</td>
            <td className="border-b-2 border-solid border-stroke px-1 py-5 align-middle md:py-3.5">
                <div className="flex justify-center" title={row.stance} aria-label={`Central bank stance: ${row.stance}`}>
                    <GuageChart
                        style={{ width: "118px" }}
                        indicatorStyle={{
                            rotation: getRotationForCentralBankPolicyStanceScore(row.stanceScore),
                            transition: "0.8s ease-out",
                        }}
                        gaugeZones={gaugeZones}
                        customLeftLabel="Dovish"
                        customRightLabel="Hawkish"
                        customLeftLabelX={0}
                        customLabelY={91}
                        renderIndicator={({ rotation, transition }) => (
                            <SeasonalGaugeNeedle
                                rotationDeg={rotation}
                                isDark={isDark}
                                transition={transition}
                                width="32px"
                                height="22px"
                                style={{ left: "27.5%", top: "58%", transform: "none" }}
                            />
                        )}
                    />
                </div>
            </td>
        </tr>
    );
}

function CentralBankPoliciesSection({ rows, isDark }: CentralBankPoliciesSectionProps) {
    const gaugeZones = isDark ? DARK_STANCE_GAUGE_ZONES : LIGHT_STANCE_GAUGE_ZONES;

    return (
        <div className="horizontal-scroll flex h-full min-h-0 flex-col">
            <table className="mt-8 w-full table-fixed border-collapse">
                <colgroup>
                    <col className="w-[24%]" />
                    <col className="w-[18%]" />
                    <col className="w-[33%]" />
                    <col className="w-[25%]" />
                </colgroup>
                <thead>
                    <tr className="border-b-2 border-solid border-stroke text-sm whitespace-nowrap">
                        <th className="pb-3 pr-1 text-left md:pb-4">Central Bank</th>
                        <th className="pb-3 pl-0 pr-2 text-left md:pb-4">Current Rate</th>
                        <th className="pb-3 pl-3 pr-0 text-left md:pb-4">Last Change</th>
                        <th className="pb-3 text-center md:pb-4">Bias</th>
                    </tr>
                </thead>

                <tbody>
                    {rows.length === 0 ? (
                        <tr className="border-b-2 border-solid border-stroke text-sm">
                            <td colSpan={4} className="py-6 text-center text-secondary">
                                No central bank policies data yet. Waiting for the sheet sync from the scraper.
                            </td>
                        </tr>
                    ) : (
                        rows.map((row) => <CentralBankPolicyRowItem key={row.id} row={row} gaugeZones={gaugeZones} isDark={isDark} />)
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default CentralBankPoliciesSection;
