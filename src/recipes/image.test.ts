import { describe, expect, it } from "vitest";
import { imagePosition, imageSrcSet, imageUrl } from "./image";
import type { Recipe } from "./types";

const photo =
  "https://cdn.sanity.io/images/zkkwohhe/production/abc123-4032x3024.jpg";
const recipe = (fields: Partial<Recipe>): Recipe => ({
  id: "a",
  title: "A",
  tags: [],
  ingredients: [],
  steps: [],
  createdAt: "2026-11-11",
  ...fields,
});

describe("imageUrl", () => {
  it("asks Sanity for the photo in the right width", () => {
    expect(imageUrl(recipe({ image: photo }), 400)).toBe(
      `${photo}?w=400&fit=max&auto=format`,
    );
  });

  it("gives other photos as they are, and undefined without a photo", () => {
    expect(imageUrl(recipe({ image: "/images/test.jpg" }), 400)).toBe(
      "/images/test.jpg",
    );
    expect(imageUrl(recipe({}), 400)).toBeUndefined();
  });
});

describe("imageSrcSet", () => {
  it("gives the photo in several widths, for the browser to choose from", () => {
    const srcSet = imageSrcSet(recipe({ image: photo })) ?? "";
    expect(srcSet.startsWith(`${photo}?w=160&fit=max&auto=format 160w, `)).toBe(
      true,
    );
    expect(srcSet).toContain(`${photo}?w=960&fit=max&auto=format 960w`);
  });

  it("gives undefined for photos that can't be resized", () => {
    expect(imageSrcSet(recipe({ image: "/images/test.jpg" }))).toBeUndefined();
    expect(imageSrcSet(recipe({}))).toBeUndefined();
  });
});

describe("imagePosition", () => {
  it("turns the hotspot into a CSS position", () => {
    expect(imagePosition(recipe({ imageFocus: { x: 0.5, y: 0.3 } }))).toBe(
      "50% 30%",
    );
  });

  it("gives undefined (the middle) without a hotspot", () => {
    expect(imagePosition(recipe({}))).toBeUndefined();
  });
});
