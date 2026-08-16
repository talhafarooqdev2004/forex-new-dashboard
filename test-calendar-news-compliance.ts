import assert from "node:assert/strict";
import test from "node:test";

import { normalizeEconomicImpactScore, type EconomicCalendarEventDTO } from "./src/lib/calendarNewsCalendarData";
import {
    buildMarketHeatmapTilesFromBoards,
    heatmapLabelFromValue,
    heatmapTileBackgroundFromLabel,
    normalizeMacroScore,
} from "./src/lib/calendarNewsPageData";
import {
    buildMacroScoreboardRowsFromEconomicCalendar,
    buildCatalystScoreboardRows,
    catalystBias,
    scoreReleasedMacroEvents,
} from "./src/lib/calendarNewsScoreboardData";
import { classifyHealthFactor, scoreCurrencyHealthEvent } from "./src/lib/currencyHealthScore";

function event(overrides: Partial<EconomicCalendarEventDTO>): EconomicCalendarEventDTO {
    return {
        time: "08:30",
        timestamp: "2026-07-12 08:30:00",
        currency: "USD",
        country: "United States",
        event: "GDP (QoQ)",
        impact: "High",
        actual: "3%",
        forecast: "2%",
        previous: "1%",
        trendScore: 0,
        evidenceScore: 0,
        bias: "Neutral",
        ...overrides,
    };
}

const TEST_MARKET_DAY = new Date("2026-07-12T12:00:00+04:00");

test("Primary vs Secondary classification matches doc §6/§12", () => {
    assert.equal(classifyHealthFactor("GDP (QoQ)"), "primary");
    assert.equal(classifyHealthFactor("CPI (YoY)"), "primary");
    assert.equal(classifyHealthFactor("Unemployment Rate"), "primary");
    assert.equal(classifyHealthFactor("Interest Rate Decision"), "primary");

    assert.equal(classifyHealthFactor("Atlanta Fed GDPNow"), "secondary");
    assert.equal(classifyHealthFactor("Core CPI (YoY)"), "secondary");
    assert.equal(classifyHealthFactor("Nonfarm Payrolls"), "secondary");
    assert.equal(classifyHealthFactor("Retail Sales"), "secondary");
    assert.equal(classifyHealthFactor("Manufacturing PMI"), "secondary");
    assert.equal(classifyHealthFactor("PPI (YoY)"), "secondary");
});

test("Primary ±1 and Secondary ±0.5 use beat+improve / miss+worsen (doc §§7/13)", () => {
    assert.equal(
        scoreCurrencyHealthEvent({ event: "GDP (QoQ)", actual: "3%", forecast: "2%", previous: "1%" }),
        1,
    );
    assert.equal(
        scoreCurrencyHealthEvent({ event: "GDP (QoQ)", actual: "1%", forecast: "2%", previous: "3%" }),
        -1,
    );
    assert.equal(
        scoreCurrencyHealthEvent({ event: "Retail Sales", actual: "2%", forecast: "1%", previous: "0.5%" }),
        0.5,
    );
    assert.equal(
        scoreCurrencyHealthEvent({ event: "PPI (YoY)", actual: "1%", forecast: "2%", previous: "3%" }),
        -0.5,
    );
    // Mixed: beat forecast but worsened vs previous → 0
    assert.equal(
        scoreCurrencyHealthEvent({ event: "Retail Sales", actual: "2%", forecast: "1%", previous: "3%" }),
        0,
    );
    // In-line with forecast → 0
    assert.equal(
        scoreCurrencyHealthEvent({ event: "GDP (QoQ)", actual: "2%", forecast: "2%", previous: "1%" }),
        0,
    );
});

test("Headline CPI scores as Primary; unemployment is lower-better (doc §§9–10)", () => {
    assert.equal(
        scoreCurrencyHealthEvent({ event: "CPI (YoY)", actual: "3%", forecast: "2%", previous: "1%" }),
        1,
    );
    assert.equal(
        scoreCurrencyHealthEvent({ event: "CPI (YoY)", actual: "1%", forecast: "2%", previous: "3%" }),
        -1,
    );
    assert.equal(
        scoreCurrencyHealthEvent({
            event: "Unemployment Rate",
            actual: "3.5%",
            forecast: "3.8%",
            previous: "3.9%",
        }),
        1,
    );
    assert.equal(
        scoreCurrencyHealthEvent({
            event: "Unemployment Rate",
            actual: "4.2%",
            forecast: "3.8%",
            previous: "3.7%",
        }),
        -1,
    );
});

test("Interest-rate decision matches expectations → 0; hawkish surprise → +1 (doc §11)", () => {
    assert.equal(
        scoreCurrencyHealthEvent({
            event: "Interest Rate Decision",
            actual: "5%",
            forecast: "5%",
            previous: "4.75%",
        }),
        0,
    );
    assert.equal(
        scoreCurrencyHealthEvent({
            event: "Interest Rate Decision",
            actual: "5%",
            forecast: "4.75%",
            previous: "4.5%",
        }),
        1,
    );
});

test("doc §16 example: GDP +1, retail +0.5, PPI -0.5, factory +0.5 → Macro +1.5", () => {
    const rows = buildMacroScoreboardRowsFromEconomicCalendar([
        event({ event: "GDP (QoQ)", actual: "3%", forecast: "2%", previous: "1%" }),
        event({ event: "Retail Sales", actual: "2%", forecast: "1%", previous: "0.5%" }),
        event({ event: "PPI (YoY)", actual: "1%", forecast: "2%", previous: "3%" }),
        event({ event: "Factory Orders", actual: "2%", forecast: "1%", previous: "0%" }),
    ], TEST_MARKET_DAY);
    const usd = rows.find((r) => r.currency === "USD");
    assert.equal(usd?.macroScore, 1.5);
    assert.equal(usd?.bias, "Bullish"); // above +1 (doc §20)
});

test("released rows remain individually auditable for the Macro Factor drill-down", () => {
    const scored = scoreReleasedMacroEvents([
        event({ event: "GDP (QoQ)" }),
        event({ event: "GDP (YoY)", actual: "4%", forecast: "3%", previous: "2%" }),
        event({ event: "Atlanta Fed GDPNow", actual: "5%", forecast: "4%", previous: "3%" }),
    ]);
    assert.equal(scored.length, 3);
    assert.equal(scored[0]?.event.event, "GDP (QoQ)");
    assert.equal(scored[0]?.health, 1);
});

test("doc §14 jobless claims / trade deficit are lower-better", () => {
    assert.equal(
        scoreCurrencyHealthEvent({
            event: "Initial Jobless Claims",
            actual: "200K",
            forecast: "220K",
            previous: "230K",
        }),
        0.5,
    );
    assert.equal(
        scoreCurrencyHealthEvent({
            event: "Trade Deficit",
            actual: "40B",
            forecast: "50B",
            previous: "55B",
        }),
        0.5,
    );
});

test("same-day releases retain their own values before they are summed", () => {
    const scored = scoreReleasedMacroEvents([
        event({ event: "Manufacturing PMI", actual: "52", forecast: "50", previous: "49" }),
        event({ event: "Services PMI", actual: "48", forecast: "50", previous: "51" }),
        event({ event: "Retail Sales", actual: "2%", forecast: "1%", previous: "0.5%" }),
        event({ event: "Retail Sales ex Autos", actual: "0.5%", forecast: "1%", previous: "1.5%" }),
        event({ event: "PPI (YoY)", actual: "3%", forecast: "2%", previous: "1%" }),
        event({ event: "Core PPI (YoY)", actual: "1%", forecast: "2%", previous: "3%" }),
    ]);
    assert.equal(scored.length, 6);
    const pmi = scored.find((s) => /pmi/i.test(s.event.event));
    const retail = scored.find((s) => /retail sales$/i.test(s.event.event));
    const ppi = scored.find((s) => /^PPI/i.test(s.event.event));
    assert.equal(pmi?.health, 0.5);
    assert.equal(retail?.health, 0.5);
    assert.equal(ppi?.health, 0.5);
});

test("doc §20 bias bands and insufficient-data label", () => {
    const empty = buildMacroScoreboardRowsFromEconomicCalendar([], TEST_MARKET_DAY);
    assert.equal(empty[0]?.bias, "Neutral");
    assert.equal(empty[0]?.comment, "Neutral - Insufficient Economic Data");

    const mild = buildMacroScoreboardRowsFromEconomicCalendar([
        event({ event: "Retail Sales", actual: "2%", forecast: "1%", previous: "0.5%" }),
    ], TEST_MARKET_DAY);
    assert.equal(mild.find((r) => r.currency === "USD")?.bias, "Mild Bullish");
    assert.equal(mild.find((r) => r.currency === "USD")?.macroScore, 0.5);
});

test("Daily Market impact policy caps individual scores", () => {
    assert.equal(normalizeEconomicImpactScore(7, "Low"), 0);
    assert.equal(normalizeEconomicImpactScore(7, "Medium"), 0.5);
    assert.equal(normalizeEconomicImpactScore(-7, "Medium"), -0.5);
    assert.equal(normalizeEconomicImpactScore(7, "High"), 1);
    assert.equal(normalizeEconomicImpactScore(-7, "High"), -1);

    const scored = scoreReleasedMacroEvents([
        event({ event: "GDP (QoQ)", impact: "Medium" }),
        event({ event: "GDP (QoQ)", impact: "Low" }),
    ]);
    assert.equal(scored.length, 1);
    assert.equal(scored[0]?.health, 0.5);
});

test("FFE Catalyst table uses eight currencies and exact bias bands", () => {
    const rows = buildCatalystScoreboardRows([
        { asset: "USD", bullishCount: 2, bearishCount: 1, driverScore: 1.5 },
        { asset: "EUR", bullishCount: 1, bearishCount: 1, driverScore: -0.25 },
        { asset: "OIL", bullishCount: 3, bearishCount: 0, driverScore: 3 },
    ]);
    assert.deepEqual(rows.map((row) => row.currency), ["USD", "EUR", "GBP", "JPY", "CHF", "CAD", "AUD", "NZD"]);
    assert.equal(rows.find((row) => row.currency === "USD")?.bias, "Strong Bullish");
    assert.equal(rows.find((row) => row.currency === "EUR")?.bias, "Mild Bearish");
    assert.equal(catalystBias(0.25, 1, 1), "Mild Bullish");
    assert.equal(catalystBias(-1.5, 1, 2), "Strong Bearish");
});

test("top release is exposed as the Macro Factor", () => {
    const [usd] = buildMacroScoreboardRowsFromEconomicCalendar([
        event({ event: "GDP (QoQ)", impact: "High" }),
    ], TEST_MARKET_DAY);
    assert.equal(usd?.factor?.event, "GDP (QoQ)");
    assert.equal(usd?.factor?.score, 1);
});

test("macro and driver scores share the -10 to +10 heatmap scale", () => {
    assert.equal(normalizeMacroScore(5), 10);
    assert.equal(normalizeMacroScore(-5), -10);
    assert.equal(normalizeMacroScore(99), 10);
    const [usd] = buildMarketHeatmapTilesFromBoards(
        [{ currency: "USD", macroScore: 5 }],
        [{ asset: "USD", driverScore: 0 }],
    );
    assert.equal(usd?.value, 6);
    assert.equal(usd?.label, "Strong Bullish");
});

test("heatmap labels use the approved color family", () => {
    assert.equal(heatmapLabelFromValue(5), "Strong Bullish");
    assert.equal(heatmapTileBackgroundFromLabel("Strong Bullish"), "#05871A");
    assert.equal(heatmapTileBackgroundFromLabel("Bullish"), "#25B73C");
    assert.equal(heatmapTileBackgroundFromLabel("Neutral Bullish"), "#9AE6B0");
    assert.equal(heatmapTileBackgroundFromLabel("Neutral"), "#FFFF00");
    assert.equal(heatmapTileBackgroundFromLabel("Neutral Bearish"), "#FFC1C1");
    assert.equal(heatmapTileBackgroundFromLabel("Mild Bearish"), "#FF8C8C");
    assert.equal(heatmapTileBackgroundFromLabel("Bearish"), "#FF0000");
});
