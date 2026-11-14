// Reading a whole pasted or typed method ("Fremgangsmåte") into steps, for
// «Lim inn alle stegene» in «Rediger». Pure, so it can be tested (splitSteps.test.ts).
//
// Three ways a method is usually written, tried in this order:
// 1. Numbered: "1. Stek løken", "2) Tilsett …", "Steg 3: …", "Steg 3" on a line of
//    its own. A new step starts at each number; lines without one belong to the step
//    above (a step that wraps over two lines), and the numbers are removed.
// 2. Paragraphs: a blank line between the steps. Lines inside a paragraph are joined.
// 3. Neither: one step per line.

// A number at the start of a line: "1.", "2)", "3:", "Steg 4", "Steg 4:", "trinn 5 -".
// "200 g ost …" isn't one: a bare number needs a . ) or : after it
const numberPattern =
  /^\s*(?:(?:steg|trinn)\s*\d+\s*[.):–-]?|\d+\s*[.):])(?=\s|$)\s*/i;

// Bullets from web pages and notes: "- ", "• ", "* "
const bulletPattern = /^\s*[-–•*·▪◦]\s+/;

// "Stek  løken \n i smør" → "Stek løken i smør"
function tidy(lines: string[]): string {
  return lines.join(" ").replace(/\s+/g, " ").trim();
}

export function splitSteps(text: string): string[] {
  // trim: blank lines at the start or end don't count as "between the steps"
  const lines = text.trim().split(/\r?\n/);

  // 1. Numbered: at least two numbered lines, so one "1." in the middle of a
  //    text doesn't change how everything is read
  if (lines.filter((line) => numberPattern.test(line)).length >= 2) {
    const steps: string[][] = [];
    for (const line of lines) {
      if (numberPattern.test(line) || steps.length === 0) {
        steps.push([line.replace(numberPattern, "")]);
      } else {
        steps[steps.length - 1].push(line);
      }
    }
    return steps.map(tidy).filter((step) => step !== "");
  }

  const withoutBullets = lines.map((line) => line.replace(bulletPattern, ""));

  // 2. Paragraphs: a blank line (or several) between the steps
  if (lines.some((line) => line.trim() === "")) {
    return withoutBullets
      .join("\n")
      .split(/\n\s*\n/)
      .map((paragraph) => tidy(paragraph.split("\n")))
      .filter((step) => step !== "");
  }

  // 3. One step per line
  return withoutBullets
    .map((line) => tidy([line]))
    .filter((step) => step !== "");
}
