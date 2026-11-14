// æ, ø and å aren't letters with accents, so they're changed by hand,
// the same way as Sanity's Studio does it ("Havregrøt med bær" → "havregrot-med-baer")
const NORWEGIAN_LETTERS: Record<string, string> = { æ: "ae", ø: "o", å: "a" };

// Makes a recipe's address from its title: only a–z, 0–9 and dashes.
export function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[æøå]/g, (letter) => NORWEGIAN_LETTERS[letter])
    .normalize("NFD") // "é" → "e" + "´"
    .replace(/[̀-ͯ]/g, "") // remove the loose accent marks
    .replace(/[^a-z0-9]+/g, "-") // everything else → one dash
    .replace(/^-|-$/g, ""); // no dash at the start or end
}

// Finds a free address: "laksewrap" if no one has it, otherwise "laksewrap-2",
// "laksewrap-3" … `taken` is every address already in use.
export function nextFreeSlug(slug: string, taken: string[]): string {
  const used = new Set(taken);
  if (!used.has(slug)) return slug;

  let number = 2;
  while (used.has(`${slug}-${number}`)) {
    number++;
  }
  return `${slug}-${number}`;
}
