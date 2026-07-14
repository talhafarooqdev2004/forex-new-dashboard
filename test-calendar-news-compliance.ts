import assert from "node:assert/strict";
import test from "node:test";

import type { EconomicCalendarEventDTO } from "./src/lib/calendarNewsCalendarData";
import {
    buildMarketHeatmapTilesFromBoards,
    heatmapLabelFromValue,
    heatmapTileBackgroundFromLabel,
    normalizeMacroScore,
} from "./src/lib/calendarNewsPageData";
import {
    buildMacroScoreboardRowsFromEconomicCalendar,
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
    ]);
    const usd = rows.find((r) => r.currency === "USD");
    assert.equal(usd?.macroScore, 1.5);
    assert.equal(usd?.bias, "Bullish"); // above +1 (doc §20)
});

test("same-day GDP variants count as one principal release", () => {
    const scored = scoreReleasedMacroEvents([
        event({ event: "GDP (QoQ)" }),
        event({ event: "GDP (YoY)", actual: "4%", forecast: "3%", previous: "2%" }),
        event({ event: "Atlanta Fed GDPNow", actual: "5%", forecast: "4%", previous: "3%" }),
    ]);
    assert.equal(scored.length, 1);
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

test("doc §15 same-day PMI / retail / PPI families score once", () => {
    const scored = scoreReleasedMacroEvents([
        event({ event: "Manufacturing PMI", actual: "52", forecast: "50", previous: "49" }),
        event({ event: "Services PMI", actual: "48", forecast: "50", previous: "51" }),
        event({ event: "Retail Sales", actual: "2%", forecast: "1%", previous: "0.5%" }),
        event({ event: "Retail Sales ex Autos", actual: "0.5%", forecast: "1%", previous: "1.5%" }),
        event({ event: "PPI (YoY)", actual: "3%", forecast: "2%", previous: "1%" }),
        event({ event: "Core PPI (YoY)", actual: "1%", forecast: "2%", previous: "3%" }),
    ]);
    assert.equal(scored.length, 3);
    const pmi = scored.find((s) => /pmi/i.test(s.event.event));
    const retail = scored.find((s) => /retail sales$/i.test(s.event.event));
    const ppi = scored.find((s) => /^PPI/i.test(s.event.event));
    assert.equal(pmi?.health, 0.5);
    assert.equal(retail?.health, 0.5);
    // Headline PPI + conflicting Core → 0 (doc §15 / CPI-style conflict)
    assert.equal(ppi?.health, 0);
});

test("doc §20 bias bands and insufficient-data label", () => {
    const empty = buildMacroScoreboardRowsFromEconomicCalendar([]);
    assert.equal(empty[0]?.bias, "Neutral");
    assert.equal(empty[0]?.comment, "Neutral - Insufficient Economic Data");

    const mild = buildMacroScoreboardRowsFromEconomicCalendar([
        event({ event: "Retail Sales", actual: "2%", forecast: "1%", previous: "0.5%" }),
    ]);
    assert.equal(mild.find((r) => r.currency === "USD")?.bias, "Mild Bullish");
    assert.equal(mild.find((r) => r.currency === "USD")?.macroScore, 0.5);
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
