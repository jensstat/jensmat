import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { useBlocker, useNavigate, useRevalidator } from "react-router";
import { signInWithPopup } from "firebase/auth";
import { auth, googleLogin } from "../auth/firebase";
import { setLoginHint } from "../auth/loginHint";
import RecipeSectionNav from "../components/recipe/RecipeSectionNav";
import { missingFields } from "../recipes/completeness";
import type { Recipe } from "../recipes/types";
import { deleteRecipe, isLoginProblem, updateRecipe, uploadPhoto } from "./api";
import DetailsFields from "./DetailsFields";
import DraftNotice from "./DraftNotice";
import { jumpTo } from "./jumpTo";
import MissingList from "./MissingList";
import { clearDraft, readDraft, saveDraft, withChanges } from "./draft";
import { fieldClass, growClass, labelClass } from "./editorStyles";
import IngredientsField from "./IngredientsField";
import PhotoField from "./PhotoField";
import { readForm } from "./readForm";
import StepsField from "./StepsField";

interface RecipeEditorProps {
  recipe: Recipe;
  onClose: () => void; // back to the normal page, after «Lagre» or «Avbryt»
  onSaved: () => void; // after a save that worked: «Lagret ✓» (RecipePage)
  // A field to jump to when the editor opens (?rediger=cuisine, from the Datasjekk)
  startAt?: string;
}

// The parts of the form, for the bar at the top that jumps between them.
// Short names, and four, so they fit on one row on a phone (375 px wide).
// Tips and Kilde come right after the steps, so «Steg» takes you there too
const sections = [
  { id: "rediger-bilde", label: "Bilde" },
  { id: "rediger-detaljer", label: "Detaljer" },
  { id: "rediger-ingredienser", label: "Ingredienser" },
  { id: "rediger-steg", label: "Steg" },
];

// Jumping to a part doesn't hide its heading under the header and the bar
const sectionClass =
  "scroll-mt-[calc(var(--header-height,0px)+5rem)] space-y-6";

// «Rediger» on the recipe page: the photo, the texts, the details, the ingredients and
// the steps as fields, in the main column. Loaded only when you press «Rediger»
// (React.lazy in RecipePage), so visitors never download it or Firebase.
interface EditorFormProps extends RecipeEditorProps {
  // What the fields start with: the recipe, or the recipe with a draft on top
  initial: Recipe;
  // false while a draft is waiting for «Gjenopprett» or «Forkast»: don't overwrite it
  keepDraft: boolean;
}

// The form itself. RecipeEditor below decides what it starts with (a draft or not).
// recipe = what's saved (the changes are counted from it); initial = what the fields show
function EditorForm({
  recipe,
  initial,
  keepDraft,
  onClose,
  onSaved,
  startAt,
}: EditorFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  // The login ran out (or never came back after a reload): offer «Logg inn igjen»,
  // which keeps everything in the form
  const [needsLogin, setNeedsLogin] = useState(false);
  // How many things «Lagre» would send (each changed field, and a new photo)
  const [count, setCount] = useState(0);
  // What the saved recipe is missing (the Datasjekk's rules), and which of those
  // the form has filled in since (shown ticked off, before «Lagre»)
  const missing = missingFields(recipe);
  const [filled, setFilled] = useState<string[]>([]);
  // Asks React Router to run the page's loader again, so the page shows what was saved
  const revalidator = useRevalidator();
  const navigate = useNavigate();

  // The same as count, but as a ref, for the blocker below, which React Router asks
  // at the moment you click a link (it must see the newest value, not an old render's).
  // leaving: true when the page itself goes elsewhere (after «Slett»): never ask then
  const unsaved = useRef(false);
  const leaving = useRef(false);

  // Counts the changes again. Called on every key press and click in the form, and by
  // the list fields after they change (adding a step isn't a key press).
  // useCallback: the same function every time, so the fields' effects don't rerun for nothing
  const recount = useCallback(() => {
    if (!formRef.current) return;
    const { changes, photo } = readForm(new FormData(formRef.current), recipe);
    const total = Object.keys(changes).length + (photo ? 1 : 0);
    unsaved.current = total > 0;
    setCount(total);
    // Filled in = the change gives it a value (not null, not an empty list)
    setFilled(
      Object.entries(changes)
        .filter(([, value]) => value !== null && !isEmptyList(value))
        .map(([field]) => field)
        .concat(photo ? ["image"] : []),
    );
    // The draft in this browser: the changes so far, or none when there are none
    if (keepDraft) {
      if (Object.keys(changes).length > 0) saveDraft(recipe.id, changes);
      else clearDraft(recipe.id);
    }
  }, [recipe, keepDraft]);

  // Opened from a link to one field (?rediger=cuisine): go there once it's drawn
  useEffect(() => {
    if (startAt) jumpTo(startAt);
  }, [startAt]);

  // 1. Leaving the page inside the site (a link, the back button) with unsaved changes:
  // React Router stops the move ("blocked"), and we ask. proceed = go, reset = stay
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      unsaved.current &&
      !leaving.current &&
      currentLocation.pathname !== nextLocation.pathname,
  );
  useEffect(() => {
    if (blocker.state !== "blocked") return;
    if (window.confirm("Du har endringer som ikke er lagret. Forkaste dem?")) {
      clearDraft(recipe.id);
      blocker.proceed();
    } else {
      blocker.reset();
    }
  }, [blocker, recipe.id]);

  // 2. Closing the tab, reloading, or going to another site: only the browser can ask
  // then, with its own question (beforeunload; the text can't be chosen)
  const hasChanges = count > 0;
  useEffect(() => {
    if (!hasChanges) return;
    function warn(event: BeforeUnloadEvent) {
      event.preventDefault();
    }
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [hasChanges]);

  // 3. «Avbryt»
  function cancel() {
    if (hasChanges && !window.confirm("Forkaste endringene?")) return;
    clearDraft(recipe.id);
    onClose();
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); // no page reload: we send it ourselves
    const { changes, photo } = readForm(
      new FormData(event.currentTarget),
      recipe,
    );
    const hasFieldChanges = Object.keys(changes).length > 0;
    if (!hasFieldChanges && !photo) return;

    setIsSaving(true);
    setError("");
    try {
      // The photo first: the focus point (in changes) belongs to the new photo
      if (photo) await uploadPhoto(recipe.id, photo);
      if (hasFieldChanges) await updateRecipe(recipe.id, changes);
      unsaved.current = false;
      clearDraft(recipe.id);
      await revalidator.revalidate();
      onSaved();
      onClose();
    } catch (problem) {
      setError(errorText(problem, "lagre"));
      setNeedsLogin(isLoginProblem(problem));
      setIsSaving(false);
    }
  }

  async function remove() {
    if (!window.confirm(`Slette «${recipe.title}»? Det kan ikke angres.`)) {
      return;
    }
    setIsSaving(true);
    setError("");
    try {
      await deleteRecipe(recipe.id);
      // To the list, which says what was deleted (RecipeListPage reads the state).
      // replace: the back button shouldn't go to a recipe that's gone
      leaving.current = true;
      clearDraft(recipe.id);
      navigate("/oppskrifter", {
        replace: true,
        state: { deleted: recipe.title },
      });
    } catch (problem) {
      setError(errorText(problem, "slette"));
      setNeedsLogin(isLoginProblem(problem));
      setIsSaving(false);
    }
  }

  // Google's login window, then back to the form as it was: press «Lagre» again
  async function logInAgain() {
    try {
      // Directly after the tap, with nothing in between (see auth/session.ts).
      // Firebase is already loaded here: the editor needs it to save
      await signInWithPopup(auth, googleLogin);
      setLoginHint(true);
      setNeedsLogin(false);
      setError("Logget inn igjen. Trykk «Lagre» på nytt.");
    } catch {
      setError("Innloggingen ble avbrutt. Prøv igjen.");
    }
  }

  return (
    // onInput and onChange: typing, dropdowns, checkboxes and the photo all count again
    <form
      ref={formRef}
      onSubmit={save}
      onInput={recount}
      onChange={recount}
      className="max-w-3xl"
    >
      <RecipeSectionNav
        sections={sections}
        label="Deler av skjemaet"
        everywhere
        compact
      />

      {/* What the Datasjekk says is missing: tap one to go to its field */}
      <MissingList missing={missing} filled={filled} />

      <div className="mt-6 space-y-12">
        <section id="rediger-bilde" className={sectionClass}>
          <PhotoField recipe={initial} onChange={recount} />

          <div>
            <label htmlFor="edit-title" className={labelClass}>
              Tittel
            </label>
            {/* The same size as the title on the page */}
            <input
              id="edit-title"
              name="title"
              required
              defaultValue={initial.title}
              className={`${fieldClass} font-serif text-[1.625rem] leading-8 font-semibold lg:text-[2.75rem] lg:leading-[3.5rem]`}
            />
          </div>

          <div>
            <label htmlFor="edit-description" className={labelClass}>
              Beskrivelse
            </label>
            <textarea
              id="edit-description"
              name="description"
              rows={3}
              defaultValue={initial.description}
              className={`${fieldClass} ${growClass} text-lg leading-7 font-light lg:text-[1.375rem] lg:leading-[2.375rem]`}
            />
          </div>
        </section>

        <section id="rediger-detaljer" className={sectionClass}>
          <DetailsFields recipe={initial} />
        </section>

        <section id="rediger-ingredienser" className={sectionClass}>
          <IngredientsField
            ingredients={initial.ingredients}
            onChange={recount}
          />
        </section>

        <section id="rediger-steg" className={sectionClass}>
          <StepsField steps={initial.steps} onChange={recount} />
        </section>

        <section id="rediger-tips" className={sectionClass}>
          <div>
            <label htmlFor="edit-tips" className={labelClass}>
              Tips
            </label>
            <textarea
              id="edit-tips"
              name="tips"
              rows={3}
              defaultValue={initial.tips}
              className={`${fieldClass} ${growClass} text-base leading-7`}
            />
          </div>

          <div>
            <label htmlFor="edit-source" className={labelClass}>
              Kilde
            </label>
            <input
              id="edit-source"
              name="source"
              defaultValue={initial.source}
              className={`${fieldClass} text-base`}
            />
          </div>

          <p className="text-sm text-ink/60">
            Et tomt felt fjernes fra oppskriften. Adressen endres ikke når
            tittelen endres.
          </p>

          {/* Far from «Lagre», and it asks first */}
          <div className="border-t border-ink/10 pt-6">
            <button
              type="button"
              onClick={remove}
              disabled={isSaving}
              className="border border-red-600 px-4 py-2 text-sm text-red-600 hover:bg-red-600 hover:text-white disabled:opacity-50"
            >
              Slett oppskrift
            </button>
          </div>
        </section>
      </div>

      {/* sticky: «Lagre» stays in view at the bottom of the screen in a long form.
          standalone: in the app on a phone, clear of the rounded corners and the home line */}
      <div className="sticky bottom-0 z-[5] -mx-4 mt-8 flex flex-wrap items-center gap-3 border-t border-ink/10 bg-white px-4 py-3 md:-mx-8 md:px-8 lg:mx-0 lg:px-0 standalone:pb-7 max-md:standalone:px-7">
        {/* Says what will happen: «Lagre 3 endringer», or nothing to save */}
        <button
          type="submit"
          disabled={isSaving || !hasChanges}
          className="bg-ink px-5 py-2 text-white hover:bg-gold disabled:opacity-50 disabled:hover:bg-ink"
        >
          {isSaving
            ? "Lagrer …"
            : count === 0
              ? "Ingen endringer"
              : `Lagre ${count} ${count === 1 ? "endring" : "endringer"}`}
        </button>
        <button
          type="button"
          onClick={cancel}
          disabled={isSaving}
          className="border border-ink px-5 py-2 hover:bg-panel disabled:opacity-50"
        >
          Avbryt
        </button>
        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}
        {needsLogin && (
          <button
            type="button"
            onClick={logInAgain}
            className="border border-ink px-3 py-1.5 text-sm hover:bg-panel"
          >
            Logg inn igjen
          </button>
        )}
      </div>
    </form>
  );
}

// [] (no checkboxes ticked, no ingredients) doesn't count as filled in
function isEmptyList(value: unknown): boolean {
  return Array.isArray(value) && value.length === 0;
}

// A message for the page from what went wrong: «Kunne ikke lagre: …»
function errorText(problem: unknown, what: "lagre" | "slette"): string {
  if (isLoginProblem(problem)) {
    return `Kunne ikke ${what}: innloggingen har gått ut. Det du har skrevet er tatt vare på.`;
  }
  return problem instanceof Error
    ? `Kunne ikke ${what}: ${problem.message}`
    : `Kunne ikke ${what}.`;
}

// «Rediger»: the form, plus «Gjenopprett» if this browser has a draft from last time
// (a crash, an empty battery, a closed tab). A draft is never used without asking.
// key={version}: restoring starts the form afresh, with the draft's values in the fields
function RecipeEditor(props: RecipeEditorProps) {
  const { recipe } = props;
  const [draft, setDraft] = useState(() => readDraft(recipe.id));
  const [start, setStart] = useState({ initial: recipe, version: 0 });

  function restore() {
    if (!draft) return;
    setStart({
      initial: withChanges(recipe, draft.changes),
      version: start.version + 1,
    });
    setDraft(undefined);
  }

  function discard() {
    clearDraft(recipe.id);
    setDraft(undefined);
  }

  return (
    <>
      {draft && (
        <DraftNotice
          savedAt={draft.savedAt}
          onRestore={restore}
          onDiscard={discard}
        />
      )}
      <EditorForm
        key={start.version}
        {...props}
        initial={start.initial}
        keepDraft={!draft}
      />
    </>
  );
}

export default RecipeEditor;
