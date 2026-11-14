import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
} from "react";
import { dropIndex, makeRoom } from "./dragSort";

// A drag that's going on: which item, where it will land, how far it has moved
// (px, down is +), and how far the others move aside (its height + the space)
interface Drag {
  from: number;
  to: number;
  dy: number;
  room: number;
}

// What's measured when a drag starts, and the finger's latest position. A ref, not
// state: it changes on every move, and only `drag` needs to redraw the list
interface Measure {
  from: number;
  startY: number; // the finger's place on the page (not the screen) at the start
  middles: number[]; // every item's middle on the page at the start
  room: number;
  clientY: number; // the finger's place on the screen now
  to: number; // where it would land now
  frame: number; // the auto-scroll's animation frame, to stop it
}

// How close (px) to the top or bottom of the screen the finger must be for the
// page to scroll by itself. The top is bigger: the sticky header covers it
const topEdge = 140;
const bottomEdge = 100;

// Drag lines into a new order by a handle (⠿), with a finger or a mouse. Used by
// StepsField and IngredientsField:
//
//   const drag = useDragSort(items.length, (from, to) => setItems(moveItem(items, from, to)));
//   <li ref={drag.itemRef(index)} style={drag.itemStyle(index)}>
//     <span {...drag.handleProps(index)}>⠿</span>
//
// Pointer events cover mouse, finger and pen in one. The idea: while dragging,
// nothing in the list changes. The dragged line follows the finger (a CSS
// transform), and the lines it passes slide aside to show where it will land.
// Only when it's let go does the list get its new order (onMove)
export function useDragSort(
  count: number,
  onMove: (from: number, to: number) => void,
) {
  const [drag, setDrag] = useState<Drag | null>(null);
  const items = useRef<(HTMLElement | null)[]>([]);
  const measure = useRef<Measure | null>(null);

  // Stop the auto-scroll if the list disappears in the middle of a drag
  useEffect(
    () => () => {
      if (measure.current) cancelAnimationFrame(measure.current.frame);
    },
    [],
  );

  // Where the dragged line is now, and where it would land. The page may have
  // scrolled since the start, so it's measured on the page, not on the screen
  function update() {
    const m = measure.current;
    if (!m) return;
    const dy = m.clientY + window.scrollY - m.startY;
    m.to = dropIndex(m.middles, m.from, m.middles[m.from] + dy);
    setDrag({ from: m.from, to: m.to, dy, room: m.room });
  }

  // Every frame while dragging: scroll the page if the finger is near the top or
  // bottom of the screen, faster the closer it is (long lists on a phone)
  function autoScroll() {
    const m = measure.current;
    if (!m) return;
    const y = m.clientY;
    const speed =
      y < topEdge
        ? -(topEdge - y) / 6
        : y > window.innerHeight - bottomEdge
          ? (y - (window.innerHeight - bottomEdge)) / 6
          : 0;
    if (speed !== 0) {
      window.scrollBy(0, speed);
      update();
    }
    m.frame = requestAnimationFrame(autoScroll);
  }

  function start(event: PointerEvent<HTMLElement>, index: number) {
    if (event.button !== 0 || count < 2) return; // only the main button
    event.preventDefault(); // no text selection while dragging with a mouse
    // All the moves and the let-go now come to the handle, even outside it
    event.currentTarget.setPointerCapture(event.pointerId);

    const rects = items.current
      .slice(0, count)
      .map((item) => item?.getBoundingClientRect());
    if (rects.some((rect) => rect === undefined)) return;
    const boxes = rects as DOMRect[];
    // The space between two lines (from space-y-4), the same between all of them
    const space = boxes.length > 1 ? boxes[1].top - boxes[0].bottom : 0;
    measure.current = {
      from: index,
      startY: event.clientY + window.scrollY,
      middles: boxes.map((box) => box.top + window.scrollY + box.height / 2),
      room: boxes[index].height + space,
      clientY: event.clientY,
      to: index,
      frame: 0,
    };
    update();
    measure.current.frame = requestAnimationFrame(autoScroll);
  }

  function move(event: PointerEvent<HTMLElement>) {
    if (!measure.current) return;
    measure.current.clientY = event.clientY;
    update();
  }

  // Let go (drop = true) or interrupted, e.g. by a phone call (drop = false).
  // The new order and the end of the drag happen in the same redraw, so the line
  // goes straight from "following the finger" to its new place, without a jump
  function end(drop: boolean) {
    const m = measure.current;
    if (!m) return;
    cancelAnimationFrame(m.frame);
    measure.current = null;
    if (drop && m.to !== m.from) onMove(m.from, m.to);
    setDrag(null);
  }

  return {
    // Is a line being dragged? (the list can e.g. hide hints meanwhile)
    dragging: drag !== null,

    // On each line (<li>): so it can be measured when a drag starts
    itemRef: (index: number) => (element: HTMLElement | null) => {
      items.current[index] = element;
    },

    // On each line: follows the finger (the dragged one), slides aside (the ones
    // it passes), or nothing (no drag)
    itemStyle: (index: number): CSSProperties | undefined => {
      if (!drag) return undefined;
      if (index === drag.from) {
        return {
          transform: `translateY(${drag.dy}px)`,
          position: "relative",
          zIndex: 10,
          backgroundColor: "white",
          boxShadow: "0 8px 24px rgb(0 0 0 / 0.18)",
        };
      }
      const by = makeRoom(index, drag.from, drag.to) * drag.room;
      return {
        transform: `translateY(${by}px)`,
        transition: "transform 150ms ease",
      };
    },

    // On the handle (⠿)
    handleProps: (index: number) => ({
      onPointerDown: (event: PointerEvent<HTMLElement>) => start(event, index),
      onPointerMove: move,
      onPointerUp: () => end(true),
      onPointerCancel: () => end(false),
    }),
  };
}
