import { describe, expect, it } from "vitest";
import { nextFreeSlug, toSlug } from "./_slug.js";

describe("toSlug", () => {
  it("makes a lowercase address with dashes", () => {
    expect(toSlug("Laksewrap")).toBe("laksewrap");
    expect(toSlug("Pasta med kylling")).toBe("pasta-med-kylling");
  });

  it("turns Norwegian letters into a–z, like the Studio", () => {
    expect(toSlug("Havregrøt med bær")).toBe("havregrot-med-baer");
    expect(toSlug("Ålesund-suppe")).toBe("alesund-suppe");
  });

  it("removes accents from other letters", () => {
    expect(toSlug("Crème brûlée")).toBe("creme-brulee");
  });

  it("makes everything else one dash, never at the start or end", () => {
    expect(toSlug("  Pizza – 2 stk.! ")).toBe("pizza-2-stk");
    expect(toSlug("Kylling & ris")).toBe("kylling-ris");
  });

  it("gives an empty string when nothing is left", () => {
    expect(toSlug("!!!")).toBe("");
  });
});

describe("nextFreeSlug", () => {
  it("keeps the address when it's free", () => {
    expect(nextFreeSlug("laksewrap", [])).toBe("laksewrap");
    expect(nextFreeSlug("laksewrap", ["pizza", "laksewrap-med-ris"])).toBe(
      "laksewrap",
    );
  });

  it("adds -2 when the address is taken", () => {
    expect(nextFreeSlug("laksewrap", ["laksewrap"])).toBe("laksewrap-2");
  });

  it("counts on until it finds a free number", () => {
    expect(
      nextFreeSlug("laksewrap", ["laksewrap", "laksewrap-2", "laksewrap-3"]),
    ).toBe("laksewrap-4");
  });

  it("uses a free number in a gap", () => {
    expect(nextFreeSlug("laksewrap", ["laksewrap", "laksewrap-3"])).toBe(
      "laksewrap-2",
    );
  });
});
