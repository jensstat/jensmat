import { afterEach, describe, expect, it, vi } from "vitest";
import { readSavedView, saveView } from "./recipeView";

// A pretend localStorage that holds one value (or throws, like a blocked browser)
function fakeStorage(saved: string | null, blocked = false) {
  return {
    getItem: () => {
      if (blocked) throw new Error("blocked");
      return saved;
    },
    setItem: () => {
      if (blocked) throw new Error("blocked");
    },
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("readSavedView", () => {
  it("gives the saved view", () => {
    vi.stubGlobal("localStorage", fakeStorage("list"));
    expect(readSavedView()).toBe("list");
  });

  it("gives standard when nothing is saved", () => {
    vi.stubGlobal("localStorage", fakeStorage(null));
    expect(readSavedView()).toBe("standard");
  });

  it("gives standard for an old or broken value", () => {
    vi.stubGlobal("localStorage", fakeStorage("grid"));
    expect(readSavedView()).toBe("standard");
  });

  it("gives standard when the browser blocks storage", () => {
    vi.stubGlobal("localStorage", fakeStorage("list", true));
    expect(readSavedView()).toBe("standard");
  });
});

describe("saveView", () => {
  it("doesn't crash when the browser blocks storage", () => {
    vi.stubGlobal("localStorage", fakeStorage(null, true));
    expect(() => saveView("list")).not.toThrow();
  });
});
