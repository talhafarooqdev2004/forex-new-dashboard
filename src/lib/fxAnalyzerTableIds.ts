/** Dynamic-table identifiers loaded together for FX Analyzer (server prefetch + client refresh). */
export const FX_ANALYZER_DYNAMIC_TABLE_IDS = [
    "fx_technical_trends",
    "fx_technical_levels",
    "score_dashboard_sheet76",
    "cot_raw_data",
    "retail_sentiment_currency_pairs",
    "retail_sentiment",
    "edge_currency_strength_index",
    "central_bank_policies",
] as const;

export type FxAnalyzerDynamicTableId = (typeof FX_ANALYZER_DYNAMIC_TABLE_IDS)[number];
