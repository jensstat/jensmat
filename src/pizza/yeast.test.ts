import { describe, expect, it } from "vitest";
import {
  chartRows,
  chartYeast,
  houseFactor,
  idyPercent,
  idyPercentFromChart,
  yeastStrength,
} from "./yeast";

// The chart uses °F; the calculator uses °C.
const fToC = (f: number) => (f - 32) / 1.8;

describe("the yeast chart (typed in from Yeast-Chart.jpg)", () => {
  it("has one row per °F from 35 to 95, each with one cell per column", () => {
    expect(chartRows).toHaveLength(61);
    chartRows.forEach(([f, hours], i) => {
      expect(f).toBe(35 + i);
      expect(hours).toHaveLength(chartYeast.length);
    });
  });

  // These two catch typos: a single misread number would break the pattern.
  it("gets shorter rise times with more yeast (left to right in a row)", () => {
    for (const [, hours] of chartRows) {
      const filled = hours.filter((h) => h !== null);
      for (let i = 1; i < filled.length; i++) {
        expect(filled[i]).toBeLessThanOrEqual(filled[i - 1]);
      }
    }
  });

  it("gets shorter rise times when it's warmer (top to bottom in a column)", () => {
    for (let r = 1; r < chartRows.length; r++) {
      chartRows[r][1].forEach((h, c) => {
        const above = chartRows[r - 1][1][c];
        if (h !== null && above !== null) expect(h).toBeLessThanOrEqual(above);
      });
    }
  });
});

describe("idyPercentFromChart", () => {
  it("gives back the chart's own value at a point in the chart", () => {
    // 75 °F, 12 hours → 0.032 % IDY. 68 °F, 37 hours → 0.016 % IDY.
    expect(idyPercentFromChart(12, fToC(75))).toBeCloseTo(0.032, 4);
    expect(idyPercentFromChart(37, fToC(68))).toBeCloseTo(0.016, 4);
  });

  it("needs less yeast for a longer rise", () => {
    expect(idyPercentFromChart(6, 24)).toBeLessThan(idyPercentFromChart(3, 24));
    expect(idyPercentFromChart(48, 4)).toBeLessThan(idyPercentFromChart(24, 4));
  });

  it("needs less yeast when it's warmer", () => {
    expect(idyPercentFromChart(8, 24)).toBeLessThan(idyPercentFromChart(8, 18));
  });
});

describe("idyPercent", () => {
  it("gives the house recipe's 3 g per 450 g flour with 'hjemme' (3 h at 24 °C)", () => {
    const grams = (idyPercent(3, 24, "hjemme") * 450) / 100;
    expect(grams).toBeCloseTo(3, 5);
  });

  it("'forum' is the chart, and 'hjemme' is the chart × houseFactor", () => {
    expect(idyPercent(8, 20, "forum")).toBe(idyPercentFromChart(8, 20));
    expect(idyPercent(8, 20, "hjemme")).toBeCloseTo(idyPercentFromChart(8, 20) * houseFactor);
  });
});

describe("yeastStrength", () => {
  it("uses the chart's factor for fresh yeast (CY = 3.125 × IDY)", () => {
    expect(yeastStrength.tørr).toBe(1);
    expect(yeastStrength.fersk).toBe(3.125);
  });
});
