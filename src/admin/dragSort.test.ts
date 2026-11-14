import { describe, expect, it } from "vitest";
import { dropIndex, makeRoom, moveItem } from "./dragSort";

describe("moveItem", () => {
  it("moves an item down or up, without changing the list it got", () => {
    const list = ["a", "b", "c", "d"];
    expect(moveItem(list, 0, 2)).toEqual(["b", "c", "a", "d"]);
    expect(moveItem(list, 3, 1)).toEqual(["a", "d", "b", "c"]);
    expect(moveItem(list, 1, 1)).toEqual(list);
    expect(list).toEqual(["a", "b", "c", "d"]);
  });
});

describe("dropIndex", () => {
  // Four items, 100 px apart
  const middles = [50, 150, 250, 350];

  it("stays put until the middle of the next item is passed", () => {
    expect(dropIndex(middles, 1, 150)).toBe(1);
    expect(dropIndex(middles, 1, 240)).toBe(1);
    expect(dropIndex(middles, 1, 260)).toBe(2);
    expect(dropIndex(middles, 1, 60)).toBe(1);
    expect(dropIndex(middles, 1, 40)).toBe(0);
  });

  it("stops at the ends", () => {
    expect(dropIndex(middles, 0, 5000)).toBe(3);
    expect(dropIndex(middles, 3, -5000)).toBe(0);
  });
});

describe("makeRoom", () => {
  it("moves the items between up or down, and leaves the rest", () => {
    // 0 dragged to 2: 1 and 2 move up
    expect([0, 1, 2, 3].map((i) => makeRoom(i, 0, 2))).toEqual([0, -1, -1, 0]);
    // 3 dragged to 1: 1 and 2 move down
    expect([0, 1, 2, 3].map((i) => makeRoom(i, 3, 1))).toEqual([0, 1, 1, 0]);
  });
});
