import type { Recipe } from "./types";

// All the recipes. Later they'll come from a CMS or database instead of this file.
export const recipes: Recipe[] = [
  {
    id: "laksewrap",
    title: "Laksewrap",
    description:
      "Tandoori-krydret laks i wrap med mango, avocado, greens og søt pølsesennep i fullkornstortilla",
    category: "Middag",
    protein: "Fisk",
    tags: [],
    servings: 2,
    minutes: 30,
    ingredients: [
      { amount: 300, unit: "g", name: "laks" },
      { amount: 2, unit: "ss", name: "tandoori-krydder" },
      { amount: 1, name: "mango" },
      { amount: 1, name: "avokado" },
      { amount: 0.5, name: "løk", note: "finhakket" },
      { amount: 0.25, name: "agurk", note: "finhakket" },
      { amount: 0.25, name: "paprika", note: "finhakket" },

      { amount: 0.5, unit: "pose", name: "salat" },
      { amount: 2, name: "tomat" },
      { amount: 4, name: "fullkornstortilla" },
      { name: "Begby pølsesennep", note: "god og søt" },
      { name: "guacamole" },
      // The dip: shown under its own heading, "Til dippen"
      { amount: 1, unit: "dl", name: "kesam eller crème fraiche", group: "Til dippen" },
      { amount: 1, unit: "ss", name: "Begby pølsesennep", group: "Til dippen" },
    ],
    steps: [
      "Ha tandoori-krydder over laksen og stek den i ovnen på 200 °C i ca. 22 minutter.",
      "Hakk opp løk, agurk og paprika. Skjær mango, avokado og tomat i biter, og riv salaten.",
      "Rør sammen kesam eller crème fraiche med pølsesennep til en dipp.",
      "Varm tortillaene.",
      "Fyll tortillaene med laks, grønnsaker, mango og avokado. Topp med sennep, dipp og guacamole.",
    ],
    createdAt: "2026-11-09",
  },
];
