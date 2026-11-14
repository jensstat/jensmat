import { describe, expect, it } from "vitest";
import { splitSteps } from "./splitSteps";

describe("splitSteps", () => {
  it("splits on blank lines, and joins the lines inside a paragraph", () => {
    expect(
      splitSteps("Stek løken\ni smør.\n\n\nTilsett tomater.\n\nKok i 10 min."),
    ).toEqual(["Stek løken i smør.", "Tilsett tomater.", "Kok i 10 min."]);
  });

  it("splits on numbers and removes them", () => {
    expect(
      splitSteps("1. Stek løken.\n2) Tilsett\ntomater.\n3: Kok i 10 min."),
    ).toEqual(["Stek løken.", "Tilsett tomater.", "Kok i 10 min."]);
  });

  it("reads «Steg 1» headings, on the same line or on their own", () => {
    expect(
      splitSteps("Steg 1\nStek løken.\n\nSteg 2: Tilsett tomater."),
    ).toEqual(["Stek løken.", "Tilsett tomater."]);
  });

  it("doesn't take an amount for a step number", () => {
    expect(
      splitSteps("1. Rasp osten.\n200 g ost holder.\n2. Strø over."),
    ).toEqual(["Rasp osten. 200 g ost holder.", "Strø over."]);
    expect(splitSteps("Rasp 200 g ost.\nStrø over.")).toEqual([
      "Rasp 200 g ost.",
      "Strø over.",
    ]);
  });

  it("gives one step per line when there are no blank lines or numbers", () => {
    expect(splitSteps("- Stek løken.\n• Tilsett tomater.\n")).toEqual([
      "Stek løken.",
      "Tilsett tomater.",
    ]);
  });

  it("gives nothing for empty text", () => {
    expect(splitSteps("")).toEqual([]);
    expect(splitSteps("  \n\n ")).toEqual([]);
  });
});
