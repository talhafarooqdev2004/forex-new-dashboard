"use client";

import Section from "@/components/ui/layout/Section";
import RetailSentimentHorizontalBarChart from "./RetailSentimentHorizontalBarChart";

const COT_RAW_TABLE_ID = "cot_raw_data";

/**0-based indices into columns sorted by `column_index`: name, long %, short % */
const COT_NONCOM_COLUMN_INDICES = { name: 0, long: 6, short: 7 } as const;

interface COTNonComLongVsShortProps {
  refreshTrigger?: number;
}

export default function COTNonComLongVsShort({
  refreshTrigger = 0,
}: COTNonComLongVsShortProps) {
  return (
    <Section padding={false} className="w-full">
      <div className="w-full horizontal-scroll rounded-[12px] overflow-hidden">
        <RetailSentimentHorizontalBarChart
          tableIdentifier={COT_RAW_TABLE_ID}
          title="Non Com Long % vs Short %"
          columnIndices={COT_NONCOM_COLUMN_INDICES}
          refreshTrigger={refreshTrigger}
        />
      </div>
    </Section>
  );
}
