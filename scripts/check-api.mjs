// Tests the API against `vercel dev`, the same checks as the list in 5a.5b,
// and deletes every recipe it made afterwards.
//
//   Terminal 1: vercel dev
//   Terminal 2: npm run test:api
//
// Each run uses its own titles ("API-test m3k9x2"), so it never touches
// your real recipes, and old test runs can't get in the way.
import { createClient } from "@sanity/client";

process.loadEnvFile(".env");
process.loadEnvFile(".env.local");

const API = process.env.API_URL ?? "http://localhost:3000";
const run = Date.now().toString(36); // a short code, unique for this run

// With the token: to check drafts/published, and to delete afterwards
const sanity = createClient({
  projectId: process.env.VITE_SANITY_PROJECT_ID,
  dataset: process.env.VITE_SANITY_DATASET,
  apiVersion: "2025-02-19",
  useCdn: false,
  token: process.env.SANITY_WRITE_TOKEN,
});
// Without a token, like the site: only sees published recipes
const publicSanity = sanity.withConfig({ token: undefined });

const created = []; // ids to delete at the end
let failures = 0;

function check(name, ok, details = "") {
  console.log(`${ok ? "✅" : "❌"} ${name}${ok ? "" : `\n   ${details}`}`);
  if (!ok) failures++;
}

// Sends one request to the API, and reads the answer. Every check uses it.
// password: the script key (POST_SECRET) by default; null = send no password at all
// (not undefined: that would give the default, the real password)
async function call(
  method,
  path,
  { body, type = "application/json", password = process.env.POST_SECRET } = {},
) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = type;
  if (password !== null) headers.Authorization = `Bearer ${password}`;
  const response = await fetch(`${API}${path}`, { method, headers, body });
  const text = await response.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = undefined;
  }
  return { status: response.status, json, text };
}

// "?slug=…", or nothing for the checks that leave it out on purpose
const slugQuery = (slug) => (slug ? `?slug=${encodeURIComponent(slug)}` : "");

// POST /api/recipes (or another method on the same address, like GET for 405).
// Remembers what it made, so it's deleted at the end
async function post(body, method = "POST", password) {
  const answer = await call(method, "/api/recipes", {
    body: method === "POST" ? body : undefined,
    password,
  });
  if (answer.json?.id) created.push(answer.json.id);
  return answer;
}

// A 1×1 pixel PNG, so the photo tests need no file
const TINY_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64",
);

const sendPhoto = (slug, body, type = "image/png", password) =>
  call("POST", `/api/photo${slugQuery(slug)}`, { body, type, password });

const sendPatch = (slug, body, password) =>
  call("PATCH", `/api/recipes${slugQuery(slug)}`, { body, password });

const sendDelete = (slug, password) =>
  call("DELETE", `/api/recipes${slugQuery(slug)}`, { password });

async function expectCreated(name, title, slug) {
  const answer = await post(JSON.stringify({ title }));
  check(
    `${name}: 201 and "${slug}"`,
    answer.status === 201 && answer.json?.slug === slug,
    `got ${answer.status} ${answer.text.slice(0, 200)}`,
  );
  return answer.json;
}

async function expectRefused(name, body, error, status = 400) {
  const answer = await post(body);
  check(
    `${name}: ${status} "${error}"`,
    answer.status === status && answer.json?.error === error,
    `got ${answer.status} ${answer.text.slice(0, 200)}`,
  );
}

try {
  // The server must be running first
  try {
    await fetch(`${API}/api/recipes`); // any answer will do (a GET gives 405)
  } catch {
    console.log(`❌ No answer from ${API}. Is \`vercel dev\` running?`);
    process.exit(1);
  }

  if (!process.env.POST_SECRET) {
    console.log("❌ POST_SECRET is missing in .env.local");
    process.exit(1);
  }

  console.log(`\nLock: no entry without the password`);
  for (const [name, password] of [
    ["0a no password", null],
    ["0b wrong password", "feil-passord"],
  ]) {
    const answer = await post(
      JSON.stringify({ title: `API-test lås ${run}` }),
      "POST",
      password,
    );
    check(
      `${name}: 401 "Ikke tilgang"`,
      answer.status === 401 && answer.json?.error === "Ikke tilgang",
      `got ${answer.status} ${answer.text.slice(0, 200)}`,
    );
  }

  console.log(`\nA: it should work (run ${run})`);
  const first = await expectCreated(
    "1 create",
    `API-test ${run}`,
    `api-test-${run}`,
  );
  await expectCreated(
    "2 same title again",
    `API-test ${run}`,
    `api-test-${run}-2`,
  );
  await expectCreated(
    "3 Norwegian letters",
    `API-test grøt med bær ${run}`,
    `api-test-grot-med-baer-${run}`,
  );
  const trimmed = await expectCreated(
    "4 spaces around the title",
    `   API-test pai ${run}   `,
    `api-test-pai-${run}`,
  );

  console.log("\nB: it should say no");
  await expectRefused("5 empty title", '{"title":"   "}', "Mangler tittel");
  await expectRefused("6 no title", "{}", "Mangler tittel");
  await expectRefused("7 title is a number", '{"title":42}', "Mangler tittel");
  await expectRefused(
    "8 no letters or numbers",
    '{"title":"!!!"}',
    "Tittelen må ha minst én bokstav eller ett tall",
  );
  await expectRefused("9 not JSON", "ikke json", "Må være JSON");
  const get = await post(undefined, "GET");
  check("10 GET: 405", get.status === 405, `got ${get.status}`);

  console.log("\nC: the result in Sanity");
  if (first?.id) {
    check(
      "11 published, not a draft",
      !first.id.startsWith("drafts."),
      first.id,
    );
    const seen = await publicSanity.fetch(
      `*[_type == "recipe" && slug.current == $slug][0].title`,
      { slug: first.slug },
    );
    check(
      "12 the site can read it (no token)",
      seen === `API-test ${run}`,
      `got ${seen}`,
    );
  }
  if (trimmed?.id) {
    const title = await sanity.getDocument(trimmed.id).then((d) => d?.title);
    check(
      "13 the title is saved without the spaces",
      title === `API-test pai ${run}`,
      `got "${title}"`,
    );
  }

  console.log("\nD: the photo (/api/photo)");
  if (first?.slug) {
    const answer = await sendPhoto(first.slug, TINY_PNG);
    check(
      "14 photo on a recipe: 200 and an image address",
      answer.status === 200 &&
        answer.json?.image?.startsWith("https://cdn.sanity.io/"),
      `got ${answer.status} ${answer.text.slice(0, 200)}`,
    );
    const image = await publicSanity.fetch(
      `*[_type == "recipe" && slug.current == $slug][0].image.asset->url`,
      { slug: first.slug },
    );
    check(
      "15 the site sees the photo on the recipe",
      image === answer.json?.image,
      `got ${image}`,
    );
  }
  const photoRefusals = [
    ["16 no password", `api-test-${run}`, TINY_PNG, "image/png", null, 401],
    [
      "17 unknown recipe",
      `finnes-ikke-${run}`,
      TINY_PNG,
      "image/png",
      undefined,
      404,
    ],
    ["18 not a photo", `api-test-${run}`, "hei", "text/plain", undefined, 400],
    ["19 no slug", "", TINY_PNG, "image/png", undefined, 400],
    [
      "20 empty photo",
      `api-test-${run}`,
      new Uint8Array(),
      "image/png",
      undefined,
      400,
    ],
  ];
  for (const [name, slug, body, type, password, status] of photoRefusals) {
    const answer = await sendPhoto(slug, body, type, password);
    check(
      `${name}: ${status}`,
      answer.status === status && typeof answer.json?.error === "string",
      `got ${answer.status} ${answer.text.slice(0, 200)}`,
    );
  }

  console.log("\nE: changing a recipe (PATCH /api/recipes)");
  if (trimmed?.id) {
    const slug = trimmed.slug;
    const changed = await sendPatch(
      slug,
      JSON.stringify({
        description: "  En rask pai  ",
        minutes: 25,
        servings: 4,
      }),
    );
    check(
      "21 change three fields: 200",
      changed.status === 200 && changed.json?.changed?.length === 3,
      `got ${changed.status} ${changed.text.slice(0, 200)}`,
    );
    let recipe = await sanity.getDocument(trimmed.id);
    check(
      "22 they're saved (cleaned), and the title is unchanged",
      recipe?.description === "En rask pai" &&
        recipe?.minutes === 25 &&
        recipe?.servings === 4 &&
        recipe?.title === `API-test pai ${run}`,
      JSON.stringify(recipe),
    );

    const removed = await sendPatch(slug, '{"minutes":null}');
    recipe = await sanity.getDocument(trimmed.id);
    check(
      "23 null removes only that field",
      removed.status === 200 &&
        recipe?.minutes === undefined &&
        recipe?.description === "En rask pai",
      `got ${removed.status}, ${JSON.stringify(recipe)}`,
    );

    const patchRefusals = [
      ["24 change the slug", slug, '{"slug":"ny"}', undefined, 400],
      ["25 no password", slug, '{"minutes":30}', null, 401],
      [
        "26 unknown recipe",
        `finnes-ikke-${run}`,
        '{"minutes":30}',
        undefined,
        404,
      ],
      ["27 not JSON", slug, "ikke json", undefined, 400],
      ["28 no changes", slug, "{}", undefined, 400],
      ["29 no slug", "", '{"minutes":30}', undefined, 400],
    ];
    for (const [name, toSlug, body, password, status] of patchRefusals) {
      const answer = await sendPatch(toSlug, body, password);
      check(
        `${name}: ${status}`,
        answer.status === status && typeof answer.json?.error === "string",
        `got ${answer.status} ${answer.text.slice(0, 200)}`,
      );
    }

    console.log("\nF: the rest of the fields (lists, steps, ingredients)");
    const whole = await sendPatch(
      slug,
      JSON.stringify({
        category: "Middag",
        cuisine: "Italiensk",
        difficulty: "Enkel",
        themes: ["Barnevennlig"],
        steps: ["Kok pasta", "", "Bland"],
        ingredients: [
          { amount: 400, unit: "g", name: "pasta" },
          { name: "salt" },
        ],
      }),
    );
    recipe = await sanity.getDocument(trimmed.id);
    const lines = recipe?.ingredients ?? [];
    check(
      "30 a whole recipe: 200, and saved",
      whole.status === 200 &&
        recipe?.cuisine === "Italiensk" &&
        recipe?.themes?.[0] === "Barnevennlig" &&
        recipe?.steps?.length === 2 &&
        lines.length === 2,
      `got ${whole.status} ${whole.text.slice(0, 200)}, ${JSON.stringify(recipe)}`,
    );
    check(
      "31 ingredient lines have _type and their own _key (no «Missing keys»)",
      lines.every((line) => line._type === "ingredient" && line._key) &&
        lines[0]?._key !== lines[1]?._key,
      JSON.stringify(lines),
    );
    const wrong = await sendPatch(slug, '{"cuisine":"Marsiansk"}');
    check(
      "32 a value that isn't in types.ts: 400",
      wrong.status === 400,
      `got ${wrong.status} ${wrong.text.slice(0, 200)}`,
    );
  }

  console.log("\nG: the photo's focus point (imageFocus → image.hotspot)");
  if (trimmed?.slug) {
    // "API-test pai" has no photo
    const noPhoto = await sendPatch(
      trimmed.slug,
      '{"imageFocus":{"x":0.2,"y":0.8}}',
    );
    check(
      "33 no photo: 400 «Oppskriften har ikke bilde»",
      noPhoto.status === 400 &&
        noPhoto.json?.error === "Oppskriften har ikke bilde",
      `got ${noPhoto.status} ${noPhoto.text.slice(0, 200)}`,
    );
  }
  if (first?.id) {
    // "API-test" got a photo in 14
    const focused = await sendPatch(
      first.slug,
      '{"imageFocus":{"x":0.2,"y":0.8}}',
    );
    const image = await sanity.getDocument(first.id).then((d) => d?.image);
    check(
      "34 with a photo: 200, the hotspot moved, and the photo is kept",
      focused.status === 200 &&
        image?.hotspot?._type === "sanity.imageHotspot" &&
        image?.hotspot?.x === 0.2 &&
        image?.hotspot?.y === 0.8 &&
        typeof image?.asset?._ref === "string",
      `got ${focused.status} ${focused.text.slice(0, 200)}, ${JSON.stringify(image)}`,
    );
    const outside = await sendPatch(
      first.slug,
      '{"imageFocus":{"x":1.5,"y":0.5}}',
    );
    check(
      "35 a point outside the photo: 400",
      outside.status === 400,
      `got ${outside.status} ${outside.text.slice(0, 200)}`,
    );
  }

  console.log("\nH: deleting a recipe (DELETE /api/recipes)");
  const doomed = await expectCreated(
    "36 a recipe to delete",
    `API-test slett ${run}`,
    `api-test-slett-${run}`,
  );
  if (doomed?.slug) {
    const deleteRefusals = [
      ["37 no password", doomed.slug, null, 401],
      ["38 unknown recipe", `finnes-ikke-${run}`, undefined, 404],
      ["39 no slug", "", undefined, 400],
    ];
    for (const [name, slug, password, status] of deleteRefusals) {
      const answer = await sendDelete(slug, password);
      check(
        `${name}: ${status}`,
        answer.status === status && typeof answer.json?.error === "string",
        `got ${answer.status} ${answer.text.slice(0, 200)}`,
      );
    }
    const deleted = await sendDelete(doomed.slug);
    const left = await sanity.getDocument(doomed.id);
    check(
      "40 delete: 200, and it's gone from Sanity",
      deleted.status === 200 && left === undefined,
      `got ${deleted.status} ${deleted.text.slice(0, 200)}, ${JSON.stringify(left)}`,
    );
  }
} finally {
  // Clean up, even if something above failed. First the photos the recipes
  // point to (an asset can't be deleted while a recipe uses it), then both
  const assets = await sanity.fetch(`*[_id in $ids].image.asset._ref`, {
    ids: created,
  });
  for (const id of created) {
    await sanity.delete(id);
  }
  for (const id of assets.filter(Boolean)) {
    await sanity.delete(id);
  }
  console.log(
    `\n🧹 Deleted the ${created.length} test recipes and ${assets.length} test photos again`,
  );
}

console.log(failures === 0 ? "\nAll good! 🎉" : `\n${failures} failed`);
process.exit(failures === 0 ? 0 : 1);
