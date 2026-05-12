/**
 * Horizontal fill gradient for currency strength bars (−5…+5 score bands).
 * Shared by Fundamental Currency Strength Index and Technical Dashboard Currency Strength Index.
 */
export function getCurrencyStrengthIndexBarGradient(score: number): string {
    if (score >= 5) return "linear-gradient(90deg, #22ff00 0%, #9dff00 100%)";
    if (score >= 4) return "linear-gradient(90deg, #20f000 0%, #62d900 100%)";
    if (score >= 3) return "linear-gradient(90deg, #22e600 0%, #3fc900 100%)";
    if (score >= 2) return "linear-gradient(90deg, #20d900 0%, #7cc900 100%)";
    if (score >= 1) return "linear-gradient(90deg, #8ed000 0%, #b9c900 100%)";

    if (score > 0) return "linear-gradient(90deg, #9bb800 0%, #c7bf00 100%)";

    if (score <= -5) return "linear-gradient(90deg, #ff2d2d 0%, #ff0000 100%)";
    if (score <= -4) return "linear-gradient(90deg, #ff5a1f 0%, #ff2b00 100%)";
    if (score <= -3) return "linear-gradient(90deg, #ff7a1f 0%, #ff4800 100%)";
    if (score <= -2) return "linear-gradient(90deg, #ff8a24 0%, #ff4b12 100%)";
    if (score <= -1) return "linear-gradient(90deg, #ff9a24 0%, #ff5a16 100%)";

    if (score < 0) return "linear-gradient(90deg, #ffb024 0%, #ff7a16 100%)";

    return "transparent";
}
