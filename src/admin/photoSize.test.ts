import { describe, expect, it } from "vitest";
import { fitInside } from "./photoSize";

describe("fitInside", () => {
  it("shrinks a wide photo so the width is the max", () => {
    expect(fitInside(4000, 3000, 2000)).toEqual({ width: 2000, height: 1500 });
  });

  it("shrinks a tall photo so the height is the max", () => {
    expect(fitInside(3000, 4000, 2000)).toEqual({ width: 1500, height: 2000 });
  });

  it("never makes a small photo bigger", () => {
    expect(fitInside(800, 600, 2000)).toEqual({ width: 800, height: 600 });
  });

  it("rounds to whole pixels", () => {
    expect(fitInside(3001, 2001, 2000)).toEqual({ width: 2000, height: 1334 });
  });
});
