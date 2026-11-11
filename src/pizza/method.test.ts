import { describe, expect, it } from "vitest";
import { bakeTimeOn, formatHours, makeSteps, stepClock } from "./method";

// The non-breaking space that formatHours puts between number and unit.
const nbsp = String.fromCharCode(160);

// The house recipe: 2 pizzas of 372 g, 3 h rise at 24 °C.
const house = { pizzaCount: 2, ballWeight: 372, riseHours: 3, riseTemp: 24 };

// A fixed day, so the tests give the same answer every day they're run.
const day = new Date(2026, 10, 13);
const sixPm = bakeTimeOn(day, "18:00")!;

describe("formatHours", () => {
  it("writes short times in minutes and long times in hours with a comma", () => {
    expect(formatHours(0.5)).toBe(`30${nbsp}min`);
    expect(formatHours(1.5)).toBe(`1,5${nbsp}t`);
    expect(formatHours(2)).toBe(`2${nbsp}t`);
    expect(formatHours(14.1)).toBe(`14${nbsp}t`);
  });
});

describe("makeSteps", () => {
  it("follows the house method and gives the right clock times for baking at 18:00", () => {
    const schedule = makeSteps(house).map((step) => [
      step.title,
      stepClock(sixPm, step.minutesBeforeBake),
    ]);
    expect(schedule).toEqual([
      ["Bland og elt lett", "14:50"],
      ["Olje på ballen", "15:00"],
      ["La den elte seg selv", "15:00"],
      ["Første heving", "15:30"],
      ["Del i 2", "17:00"],
      ["Andre heving", "17:00"],
      ["Varm ovnen", "17:15"],
      ["Form og stek", "18:00"],
    ]);
  });

  it("is always in time order", () => {
    for (const riseHours of [1, 3, 8, 24, 48]) {
      const minutes = makeSteps({ ...house, riseHours }).map(
        (s) => s.minutesBeforeBake,
      );
      const sorted = [...minutes].sort((a, b) => b - a);
      expect(minutes).toEqual(sorted);
    }
  });

  it("adds a step to take the balls out for a cold rise", () => {
    const steps = makeSteps({ ...house, riseHours: 24, riseTemp: 4 });
    expect(steps.map((s) => s.title)).toContain("Ut av kjøleskapet");
    expect(steps.find((s) => s.title === "Første heving")?.text).toContain(
      "i kjøleskapet",
    );
  });

  it("has no fridge step at room temperature", () => {
    expect(makeSteps(house).map((s) => s.title)).not.toContain(
      "Ut av kjøleskapet",
    );
  });

  it("says 'Form bollen' instead of 'Del i 1' for one pizza", () => {
    const titles = makeSteps({ ...house, pizzaCount: 1 }).map((s) => s.title);
    expect(titles).toContain("Form bollen");
    expect(titles).not.toContain("Del i 1");
  });
});

describe("clock times", () => {
  it("shows the weekday when a step is on an earlier day", () => {
    // 24 h before 18:00 is the day before.
    expect(stepClock(sixPm, 24 * 60)).toMatch(/^\S+ 18:00$/);
    expect(stepClock(sixPm, 60)).toBe("17:00");
  });

  it("gives no baking time for an empty or invalid field", () => {
    expect(bakeTimeOn(day, "")).toBeNull();
    expect(bakeTimeOn(day, "kl seks")).toBeNull();
  });
});
