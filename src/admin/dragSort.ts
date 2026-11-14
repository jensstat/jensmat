// The maths behind dragging lines into a new order (useDragSort), with no React,
// so it can be tested (dragSort.test.ts). Also used by the ↑ ↓ buttons.

// The list with the item at `from` moved to `to`: take it out, put it back in
export function moveItem<T>(list: T[], from: number, to: number): T[] {
  const copy = [...list];
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
}

// Where a dragged item lands. `middles`: the middle (from the top of the page) of
// every item where it was before the drag started; `middle`: the dragged item's
// middle now. It passes an item once its middle is past that item's middle
export function dropIndex(
  middles: number[],
  from: number,
  middle: number,
): number {
  let to = from;
  // Dragged down: past each item below
  for (let i = from + 1; i < middles.length; i++) {
    if (middle > middles[i]) to = i;
  }
  // Dragged up: past each item above
  for (let i = from - 1; i >= 0; i--) {
    if (middle < middles[i]) to = i;
  }
  return to;
}

// How far an item that isn't dragged moves aside while another is dragged
// from `from` to `to`: up (-1) to fill the gap, down (+1) to make room, or 0
export function makeRoom(index: number, from: number, to: number): -1 | 0 | 1 {
  if (from < to && index > from && index <= to) return -1;
  if (to < from && index >= to && index < from) return 1;
  return 0;
}
