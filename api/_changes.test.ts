import { describe, expect, it } from "vitest";
import { readChanges } from "./_changes.js";

describe("readChanges", () => {
  it("sets the fields that are sent, cleaned", () => {
    expect(
      readChanges({ description: "  God og rask  ", minutes: 40 }),
    ).toEqual({ set: { description: "God og rask", minutes: 40 }, unset: [] });
  });

  it("removes a field that is sent as null", () => {
    expect(readChanges({ tips: null })).toEqual({ set: {}, unset: ["tips"] });
  });

  it("never lets the title be removed", () => {
    expect(readChanges({ title: null })).toEqual({
      error: "Tittelen kan ikke fjernes",
    });
    expect(readChanges({ title: "   " })).toEqual({
      error: "Ugyldig verdi for «title»",
    });
  });

  it("refuses fields that may not be changed", () => {
    expect(readChanges({ slug: "ny-adresse" })).toEqual({
      error: "Kan ikke endre «slug»",
    });
    expect(readChanges({ _id: "noe-annet" })).toEqual({
      error: "Kan ikke endre «_id»",
    });
    // built-in names every object has
    expect(readChanges({ constructor: "x" })).toEqual({
      error: "Kan ikke endre «constructor»",
    });
  });

  it("refuses numbers that aren't whole and above 0", () => {
    for (const minutes of [0, -5, 2.5, "30", Number.NaN]) {
      expect(readChanges({ minutes })).toEqual({
        error: "Ugyldig verdi for «minutes»",
      });
    }
  });

  it("refuses a body that isn't an object with changes", () => {
    for (const body of [null, "tekst", 42, ["title"]]) {
      expect(readChanges(body)).toEqual({
        error: "Må være et objekt med felt",
      });
    }
    expect(readChanges({})).toEqual({ error: "Ingen endringer" });
  });

  it("takes values from the fixed lists in types.ts", () => {
    expect(
      readChanges({ cuisine: "Italiensk", tags: ["Glutenfri", "Glutenfri"] }),
    ).toEqual({
      set: { cuisine: "Italiensk", tags: ["Glutenfri"] },
      unset: [],
    });
    expect(readChanges({ cuisine: "Marsiansk" })).toEqual({
      error: "Ugyldig verdi for «cuisine»",
    });
    expect(readChanges({ tags: ["Glutenfri", "Uten sukker"] })).toEqual({
      error: "Ugyldig verdi for «tags»",
    });
  });

  it("cleans the steps, and leaves out empty ones", () => {
    expect(readChanges({ steps: ["  Kok vann ", "", "Server"] })).toEqual({
      set: { steps: ["Kok vann", "Server"] },
      unset: [],
    });
    expect(readChanges({ steps: ["Kok vann", 2] })).toEqual({
      error: "Ugyldig verdi for «steps»",
    });
  });

  it("makes ingredient lines Sanity can store", () => {
    const result = readChanges({
      ingredients: [
        { amount: 2, unit: "dl", name: " melk ", note: null },
        { name: "salt" },
      ],
    });
    if ("error" in result) throw new Error(result.error);
    const [milk, salt] = result.set.ingredients as Record<string, unknown>[];
    expect(milk).toMatchObject({
      _type: "ingredient",
      amount: 2,
      unit: "dl",
      name: "melk",
    });
    expect(milk).not.toHaveProperty("note");
    expect(salt).toMatchObject({ _type: "ingredient", name: "salt" });
    // every line gets its own key
    expect(typeof milk._key).toBe("string");
    expect(milk._key).not.toBe(salt._key);
  });

  it("refuses the whole list if one ingredient line is wrong", () => {
    for (const ingredients of [
      [{ name: "melk" }, { amount: 2 }], // no name
      [{ name: "melk", amount: -1 }], // a wrong amount
      [{ name: "melk", unit: 3 }], // a unit that isn't text
      ["melk"], // not an object
    ]) {
      expect(readChanges({ ingredients })).toEqual({
        error: "Ugyldig verdi for «ingredients»",
      });
    }
  });
});
