import type { CSSProperties } from "react";

/** Match admin cell padding; all Calendar & News columns are centered. */
export const CN_TH_STYLE: CSSProperties = {
    padding: "12px 8px",
    textAlign: "center",
    whiteSpace: "nowrap",
};

export const CN_TD_STYLE: CSSProperties = {
    padding: "12px 8px",
    textAlign: "center",
    whiteSpace: "nowrap",
};

/** Keep every Daily Market View row on one line, matching the legacy table layout. */
export const CN_TD_WRAP_STYLE: CSSProperties = {
    padding: "12px 8px",
    textAlign: "center",
    whiteSpace: "nowrap",
};
