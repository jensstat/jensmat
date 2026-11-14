import { describe, expect, it } from "vitest";
import {
  parseIngredientLine,
  parseIngredientList,
  toAmountRange,
} from "./parseIngredients";

describe("parseIngredientLine", () => {
  it("reads amount, unit and name", () => {
    expect(parseIngredientLine("2 dl melk")).toEqual({
      amount: 2,
      unit: "dl",
      name: "melk",
    });
    expect(parseIngredientLine("200g smør")).toEqual({
      amount: 200,
      unit: "g",
      name: "smør",
    });
    expect(parseIngredientLine("2 stk. løk")).toEqual({
      amount: 2,
      unit: "stk",
      name: "løk",
    });
  });

  it("has no unit when the word after the amount isn't a unit", () => {
    expect(parseIngredientLine("3 egg")).toEqual({ amount: 3, name: "egg" });
  });

  it("has only a name when there's no amount", () => {
    expect(parseIngredientLine("salt")).toEqual({ name: "salt" });
    expect(parseIngredientLine("Salt")).toEqual({ name: "salt" });
  });

  it("splits name and note at the first comma, also without an amount", () => {
    expect(parseIngredientLine("Løk, finhakket")).toEqual({
      name: "løk",
      note: "finhakket",
    });
    expect(parseIngredientLine("Salt og pepper, etter smak")).toEqual({
      name: "salt og pepper",
      note: "etter smak",
    });
    expect(parseIngredientLine("Løk, finhakket, gjerne rødløk")).toEqual({
      name: "løk",
      note: "finhakket, gjerne rødløk",
    });
    expect(parseIngredientLine("200 g smør, romtemperert")).toEqual({
      amount: 200,
      unit: "g",
      name: "smør",
      note: "romtemperert",
    });
  });

  it("reads a decimal comma as part of the number, not as the note", () => {
    expect(parseIngredientLine("1,5 dl fløte")).toEqual({
      amount: 1.5,
      unit: "dl",
      name: "fløte",
    });
    expect(parseIngredientLine("1.5 dl fløte")).toEqual({
      amount: 1.5,
      unit: "dl",
      name: "fløte",
    });
  });

  it("reads fractions", () => {
    expect(parseIngredientLine("½ ts salt")).toEqual({
      amount: 0.5,
      unit: "ts",
      name: "salt",
    });
    expect(parseIngredientLine("1 ½ dl sukker")).toEqual({
      amount: 1.5,
      unit: "dl",
      name: "sukker",
    });
    expect(parseIngredientLine("1/2 ts pepper")).toEqual({
      amount: 0.5,
      unit: "ts",
      name: "pepper",
    });
  });

  it("moves a bracket in the name to the note", () => {
    expect(parseIngredientLine("1 boks hakkede tomater (400 g)")).toEqual({
      amount: 1,
      unit: "boks",
      name: "hakkede tomater",
      note: "400 g",
    });
  });

  it("reads a range: two numbers with a dash between", () => {
    expect(parseIngredientLine("2-3 fedd hvitløk")).toEqual({
      amount: 2,
      amountMax: 3,
      unit: "fedd",
      name: "hvitløk",
    });
    expect(parseIngredientLine("200 – 300 g salsiccia")).toEqual({
      amount: 200,
      amountMax: 300,
      unit: "g",
      name: "salsiccia",
    });
    expect(parseIngredientLine("½-1 ts chili")).toEqual({
      amount: 0.5,
      amountMax: 1,
      unit: "ts",
      name: "chili",
    });
  });

  it("never invents a number: a backwards range or a word amount stays in the name", () => {
    expect(parseIngredientLine("3-2 fedd hvitløk")).toEqual({
      name: "3-2 fedd hvitløk",
    });
    expect(parseIngredientLine("en klype salt")).toEqual({
      name: "en klype salt",
    });
    expect(parseIngredientLine("0 g sukker")).toEqual({ name: "0 g sukker" });
  });

  it("keeps the whole line as the name when there's nothing after the amount", () => {
    expect(parseIngredientLine("2 dl")).toEqual({ name: "2 dl" });
  });

  it("removes bullets and checkboxes, and skips empty lines", () => {
    expect(parseIngredientLine("- 3 egg")).toEqual({ amount: 3, name: "egg" });
    expect(parseIngredientLine("• salt")).toEqual({ name: "salt" });
    expect(parseIngredientLine("[ ] 1 l melk")).toEqual({
      amount: 1,
      unit: "l",
      name: "melk",
    });
    expect(parseIngredientLine("   ")).toBeUndefined();
  });
});

describe("parseIngredientList", () => {
  it("makes one ingredient per line and skips empty lines", () => {
    expect(parseIngredientList("2 dl melk\n\n3 egg\r\nsalt\n")).toEqual([
      { amount: 2, unit: "dl", name: "melk" },
      { amount: 3, name: "egg" },
      { name: "salt" },
    ]);
  });

  it("uses a line ending in ':' as the group for the lines after it", () => {
    expect(
      parseIngredientList("400 g kjøttdeig\nTil sausen:\n2 dl fløte\nsalt"),
    ).toEqual([
      { amount: 400, unit: "g", name: "kjøttdeig" },
      { amount: 2, unit: "dl", name: "fløte", group: "Til sausen" },
      { name: "salt", group: "Til sausen" },
    ]);
  });

  it("gives an empty list for an empty paste", () => {
    expect(parseIngredientList("")).toEqual([]);
  });
});

describe("toAmountRange", () => {
  it("reads one number or a range", () => {
    expect(toAmountRange("300")).toEqual({ amount: 300 });
    expect(toAmountRange("200-300")).toEqual({ amount: 200, amountMax: 300 });
    expect(toAmountRange("200 – 300")).toEqual({ amount: 200, amountMax: 300 });
    expect(toAmountRange("1 ½-2")).toEqual({ amount: 1.5, amountMax: 2 });
    expect(toAmountRange("2-2")).toEqual({ amount: 2 });
  });

  it("refuses what it can't be sure of", () => {
    expect(toAmountRange("300-200")).toBeUndefined();
    expect(toAmountRange("-300")).toBeUndefined();
    expect(toAmountRange("200-")).toBeUndefined();
    expect(toAmountRange("1-2-3")).toBeUndefined();
    expect(toAmountRange("")).toBeUndefined();
  });
});
