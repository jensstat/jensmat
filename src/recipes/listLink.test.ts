import { describe, expect, it } from "vitest";
import { listAddress, listState } from "./listLink";

describe("listAddress (where '← Alle oppskrifter' goes)", () => {
  it("goes back to the filtered list the card was clicked in", () => {
    expect(listAddress(listState("?sok=laks&maltid=Middag"))).toBe(
      "/oppskrifter?sok=laks&maltid=Middag",
    );
  });

  it("goes to the plain list when the list had no filters", () => {
    expect(listAddress(listState(""))).toBe("/oppskrifter");
  });

  it("goes to the plain list without a note (a shared link, a bookmark)", () => {
    expect(listAddress(undefined)).toBe("/oppskrifter");
    expect(listAddress(null)).toBe("/oppskrifter");
  });

  it("ignores a note that isn't a list's ?… part", () => {
    expect(listAddress({ listSearch: 42 })).toBe("/oppskrifter");
    expect(listAddress({ listSearch: "//evil.example" })).toBe("/oppskrifter");
    expect(listAddress("?sok=laks")).toBe("/oppskrifter");
  });
});
