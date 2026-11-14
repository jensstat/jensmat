import { beforeEach, describe, expect, it } from "vitest";
import { makeRecipe } from "../recipes/testRecipe";
import { clearDraft, readDraft, saveDraft, withChanges } from "./draft";

// The tests run in Node, which has no real localStorage: a small stand-in
beforeEach(() => {
  const store = new Map<string, string>();
  globalThis.localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
  } as Storage;
});

describe("the draft in localStorage", () => {
  it("is saved, read back and cleared", () => {
    saveDraft("laksewrap", { tips: "Bruk dill" });
    expect(readDraft("laksewrap")?.changes).toEqual({ tips: "Bruk dill" });
    expect(readDraft("pannekaker")).toBeUndefined();
    clearDraft("laksewrap");
    expect(readDraft("laksewrap")).toBeUndefined();
  });

  it("ignores broken text", () => {
    localStorage.setItem("utkast:laksewrap", "{ikke json");
    expect(readDraft("laksewrap")).toBeUndefined();
    localStorage.setItem("utkast:laksewrap", '{"changes":1}');
    expect(readDraft("laksewrap")).toBeUndefined();
  });
});

describe("withChanges", () => {
  const recipe = makeRecipe({
    title: "Laksewrap",
    tips: "Gammelt tips",
    minutes: 30,
    steps: ["Stek"],
  });

  it("puts the changes on top, and removes what's null", () => {
    const result = withChanges(recipe, {
      title: "Laksewrap med dill",
      minutes: null,
      steps: ["Stek", "Server"],
    });
    expect(result.title).toBe("Laksewrap med dill");
    expect(result.minutes).toBeUndefined();
    expect(result.steps).toEqual(["Stek", "Server"]);
    expect(result.tips).toBe("Gammelt tips");
  });

  it("never changes the recipe it was given", () => {
    withChanges(recipe, { title: "Noe annet" });
    expect(recipe.title).toBe("Laksewrap");
  });
});
