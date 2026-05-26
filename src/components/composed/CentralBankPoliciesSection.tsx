"use client";

import CurrencyFlag from "@/components/ui/CurrencyFlag";
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

/** Bias column width — keeps 118px gauge from shrinking when the card is narrow. */
const BIAS_GAUGE_SLOT_CLASS = "mx-auto w-[118px] min-w-[118px] max-w-[118px] shrink-0";

/** Slightly tighter horizontal padding in cells below 1484px (4px → 2px). */
const NARROW_CELL_PAD = "max-[1483px]:px-0.5";

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
        <tr className="align-middle">
            <td className={`border-b-2 border-solid border-stroke py-7 pr-1 font-semibold whitespace-nowrap align-middle md:py-3.5 ${NARROW_CELL_PAD} max-[1483px]:pr-0.5`}>
                <span className="flex items-center gap-2 max-[1483px]:gap-1.5">
                    <CurrencyFlag centralBank={row.centralBank} size={13} title={row.centralBank} />
                    <span>{row.centralBank}</span>
                </span>
            </td>
            <td className={`border-b-2 border-solid border-stroke py-7 px-1 font-semibold whitespace-nowrap tabular-nums align-middle md:py-3.5 ${NARROW_CELL_PAD}`}>
                {row.currentRate}
            </td>
            <td className={`border-b-2 border-solid border-stroke py-7 px-1 whitespace-nowrap align-middle md:py-3.5 ${NARROW_CELL_PAD}`}>
                {row.lastChange}
            </td>
            <td className={`border-b-2 border-solid border-stroke px-1 py-5 align-middle md:py-3.5 ${NARROW_CELL_PAD}`}>
                <div
                    className={BIAS_GAUGE_SLOT_CLASS}
                    title={row.stance}
                    aria-label={`Central bank stance: ${row.stance}`}
                >
                    <GuageChart
                        style={{ width: "118px", minWidth: "118px", maxWidth: "118px" }}
                        indicatorStyle={{
                            rotation: getRotationForCentralBankPolicyStanceScore(row.stanceScore),
                            transition: "0.8s ease-out",
                        }}
                        gaugeZones={gaugeZones}
                        customLeftLabel="Dovish"
                        customRightLabel="Hawkish"
                        customLeftLabelX={0}
                        customLabelY={95}
                        customLabelFontSize={10.7}
                        neutralLabelFontSize={10.7}
                        neutralLabelDy={2}
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
        <div className="horizontal-scroll w-full min-w-0">
            <table className="mt-8 w-full table-fixed border-collapse text-sm max-[1483px]:min-w-[472px] max-[1483px]:text-xs max-[1483px]:leading-4">
                <colgroup>
                    <col className="w-[24%]" />
                    <col className="w-[18%]" />
                    <col className="w-[33%]" />
                    <col className="w-[25%]" />
                </colgroup>
                <thead>
                    <tr className="border-b-2 border-solid border-stroke whitespace-nowrap">
                        <th className="pb-3 pr-1 text-left md:pb-4 max-[1483px]:pr-0.5">Central Bank</th>
                        <th className="pb-3 pl-0 pr-2 text-left md:pb-4 max-[1483px]:pr-1">Current Rate</th>
                        <th className="pb-3 pl-3 pr-0 text-left md:pb-4 max-[1483px]:pl-2">Last Change</th>
                        <th className="pb-3 px-1 text-center md:pb-4 max-[1483px]:px-0.5">Bias</th>
                    </tr>
                </thead>

                <tbody>
                    {rows.length === 0 ? (
                        <tr className="border-b-2 border-solid border-stroke">
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
