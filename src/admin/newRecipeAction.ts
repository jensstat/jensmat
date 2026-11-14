import { redirect, type ActionFunctionArgs } from "react-router";
import { createRecipe, isLoginProblem, uploadPhoto } from "./api";

// What the page gets back when the action doesn't go on to the recipe.
// slug: the recipe was made, but something after it failed (the photo)
interface NewRecipeProblem {
  error: string;
  slug?: string;
}

// What «Lagre» on /ny-oppskrift does. React Router runs it when the <Form> is sent.
// Either it goes to the new recipe (redirect), or it returns a problem for the page to show.
export async function newRecipeAction({
  request,
}: ActionFunctionArgs): Promise<NewRecipeProblem | Response> {
  // The form's fields, by their name="…"
  const form = await request.formData();
  const title = String(form.get("title") ?? "").trim();
  if (!title) return { error: "Skriv en tittel" };
  // A chosen photo is a File. No photo chosen: an empty File (size 0)
  const photo = form.get("photo");
  // Which button was pressed: «Lagre» (quick: to the recipe), or «Lagre og fyll ut
  // resten» (on to «Rediger»). The pressed button's name and value come with the form
  const fillInMore = form.get("next") === "rediger";

  let slug: string;
  try {
    slug = await createRecipe(title);
  } catch (problem) {
    // No login (or it ran out), no internet, or the API said no (with its reason)
    return {
      error: isLoginProblem(problem)
        ? "Kunne ikke lagre. Er du logget inn?"
        : `Kunne ikke lagre: ${problem instanceof Error ? problem.message : "ukjent feil"}`,
    };
  }

  // The photo, once the recipe exists (the API puts it on a recipe by its slug).
  // If it fails, the recipe is still saved: say so, rather than let «Lagre» make a second one
  if (photo instanceof File && photo.size > 0) {
    try {
      await uploadPhoto(slug, photo);
    } catch (error) {
      const reason = error instanceof Error ? error.message : "ukjent feil";
      return {
        error: `Oppskriften er lagret, men ikke bildet (${reason}).`,
        slug,
      };
    }
  }

  return redirect(`/oppskrifter/${slug}${fillInMore ? "?rediger" : ""}`);
}
