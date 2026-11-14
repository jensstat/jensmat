import { describe, expect, it } from "vitest";
import {
  amountProblem,
  amountText,
  fromValues,
  rangeText,
  sameIngredients,
  toValues,
} from "./ingredientLines";

const empty = { amount: "", unit: "", name: "", note: "", group: "" };

describe("amountText", () => {
  it("shows exact fractions as a sign", () => {
    expect(amountText(0.5)).toBe("½");
    expect(amountText(1.25)).toBe("1 ¼");
    expect(amountText(1 / 3)).toBe("⅓");
  });

  it("shows other amounts exactly, with a comma", () => {
    expect(amountText(300)).toBe("300");
    expect(amountText(0.15)).toBe("0,15");
    expect(amountText(12.5)).toBe("12 ½");
  });

  it("gives an empty field for no amount", () => {
    expect(amountText(undefined)).toBe("");
  });
});

describe("fromValues", () => {
  it("reads every part, and trims them", () => {
    expect(
      fromValues({
        amount: " 1,5 ",
        unit: "dl",
        name: " melk ",
        note: "lunken",
        group: "Til sausen",
      }),
    ).toEqual({
      amount: 1.5,
      unit: "dl",
      name: "melk",
      note: "lunken",
      group: "Til sausen",
    });
  });

  it("leaves out the empty parts", () => {
    expect(fromValues({ ...empty, name: "salt" })).toEqual({ name: "salt" });
  });

  it("reads ½ and 1/2", () => {
    expect(fromValues({ ...empty, amount: "½", name: "løk" })?.amount).toBe(
      0.5,
    );
    expect(fromValues({ ...empty, amount: "1/2", name: "løk" })?.amount).toBe(
      0.5,
    );
  });

  it("gives nothing without a name", () => {
    expect(fromValues({ ...empty, amount: "2", unit: "dl" })).toBeUndefined();
  });
});

describe("there and back again", () => {
  it("gives the same ingredients when nothing is touched", () => {
    const lines = [
      { amount: 1 / 3, unit: "ts", name: "salt" },
      { amount: 0.15, unit: "l", name: "fløte", note: "kald" },
      { name: "pepper", group: "Til slutt" },
      { amount: 200, amountMax: 300, unit: "g", name: "salsiccia" },
    ];
    const back = lines.map(toValues).map(fromValues);
    expect(sameIngredients(lines, back as typeof lines)).toBe(true);
  });
});

describe("sameIngredients", () => {
  it("sees a changed amount, and a new order", () => {
    const a = [{ amount: 2, name: "egg" }, { name: "salt" }];
    expect(
      sameIngredients(a, [{ amount: 3, name: "egg" }, { name: "salt" }]),
    ).toBe(false);
    expect(sameIngredients(a, [a[1], a[0]])).toBe(false);
  });

  it("sees a range added or changed", () => {
    const a = [{ amount: 200, unit: "g", name: "salsiccia" }];
    expect(sameIngredients(a, [{ ...a[0], amountMax: 300 }])).toBe(false);
    expect(
      sameIngredients(
        [{ ...a[0], amountMax: 300 }],
        [{ ...a[0], amountMax: 400 }],
      ),
    ).toBe(false);
  });
});

describe("ranges in the amount field", () => {
  it("writes a range with a plain dash", () => {
    expect(rangeText(200, 300)).toBe("200-300");
    expect(rangeText(0.5, 1)).toBe("½-1");
    expect(rangeText(300)).toBe("300");
    expect(rangeText()).toBe("");
  });

  it("reads a range back", () => {
    expect(
      fromValues({
        ...empty,
        amount: "200 - 300",
        unit: "g",
        name: "salsiccia",
      }),
    ).toEqual({ amount: 200, amountMax: 300, unit: "g", name: "salsiccia" });
    expect(fromValues({ ...empty, amount: "2-2", name: "egg" })).toEqual({
      amount: 2,
      name: "egg",
    });
  });

  it("explains a wrong amount, and accepts a good or empty one", () => {
    expect(amountProblem("")).toBe("");
    expect(amountProblem("1,5")).toBe("");
    expect(amountProblem("200-300")).toBe("");
    expect(amountProblem("300-200")).toContain("minste tallet først");
    expect(amountProblem("mye")).toContain("Skriv et tall");
    expect(amountProblem("1/0")).toContain("Skriv et tall");
  });
});
