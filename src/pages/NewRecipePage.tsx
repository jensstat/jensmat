import type { ReactNode } from "react";
import { Form, Link, useActionData, useNavigation } from "react-router";
import type { newRecipeAction } from "../admin/newRecipeAction";
import { useUser } from "../auth/useUser";
import Container from "../components/Container";

// /ny-oppskrift: the quick way to post a recipe, made for the phone: a title and maybe
// a photo. «Lagre» goes to the recipe; «Lagre og fyll ut resten» opens «Rediger» on it.
function NewRecipePage() {
  // What the action returned, if it didn't go on to the recipe. undefined before «Lagre»
  const result = useActionData<typeof newRecipeAction>();
  // "submitting" while the action runs (the photo can take a few seconds on a phone).
  // formData: what's being sent, so the pressed button can say «Lagrer …»
  const navigation = useNavigation();
  const isSaving = navigation.state === "submitting";
  const savingNext = navigation.formData?.get("next");
  // The real login (the link in the menu only follows a note in the browser)
  const user = useUser();

  // Still checking, or not logged in: no form
  if (!user) {
    return (
      <Frame>
        {user === undefined ? (
          <p className="mt-3 text-neutral-500">Sjekker …</p>
        ) : (
          <p className="mt-3">
            Du må{" "}
            <Link to="/logg-inn" className="underline hover:text-red-600">
              logge inn
            </Link>{" "}
            først.
          </p>
        )}
      </Frame>
    );
  }

  // The recipe was made, but the photo failed: no form, or «Lagre» would make a second one
  if (result?.slug) {
    return (
      <Frame>
        <p className="mt-6 text-red-600">{result.error}</p>
        <Link
          to={`/oppskrifter/${result.slug}`}
          className="mt-6 inline-block border border-black px-4 py-2 hover:bg-black hover:text-white"
        >
          Gå til oppskriften
        </Link>
      </Frame>
    );
  }

  return (
    <Frame>
      {/* The quick way: from the phone, just a title (and a photo if you have one).
            The rest can be filled in later, with «Rediger» on the recipe */}
      <p className="mt-3 max-w-xl text-neutral-600">
        Bare tittelen trengs. Ta med et bilde om du har det, og fyll ut resten
        nå eller senere.
      </p>

      {/* <Form>, not <form>: React Router sends it to the route's action, no page reload.
            encType multipart/form-data: needed to send a file, not just text */}
      <Form
        method="post"
        encType="multipart/form-data"
        className="mt-6 flex max-w-xl flex-col gap-4"
      >
        <label className="flex flex-col gap-1">
          Tittel
          <input
            name="title"
            required
            className="border border-black px-3 py-2"
          />
        </label>
        {/* accept="image/*": on a phone, the choice of the camera or the photo library */}
        <label className="flex flex-col gap-1">
          Bilde (valgfritt)
          <input
            type="file"
            name="photo"
            accept="image/*"
            className="file:mr-3 file:border file:border-black file:bg-white file:px-3 file:py-1 file:font-mono"
          />
        </label>
        {/* Two ways on. Both buttons send the form; name="next" says which one
              was pressed (the action reads it) */}
        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            name="next"
            value="ferdig"
            disabled={isSaving}
            className="border border-black bg-black px-4 py-2 text-white hover:bg-white hover:text-black disabled:opacity-50"
          >
            {isSaving && savingNext === "ferdig" ? "Lagrer …" : "Lagre"}
          </button>
          <button
            type="submit"
            name="next"
            value="rediger"
            disabled={isSaving}
            className="border border-black px-4 py-2 hover:bg-black hover:text-white disabled:opacity-50"
          >
            {isSaving && savingNext === "rediger"
              ? "Lagrer …"
              : "Lagre og fyll ut resten"}
          </button>
        </div>
      </Form>

      {result?.error && <p className="mt-3 text-red-600">{result.error}</p>}
    </Frame>
  );
}

// The page around each of the three states above: the width, and the heading
function Frame({ children }: { children: ReactNode }) {
  return (
    <section className="flex-1 bg-white font-mono">
      <Container>
        <h1 className="font-display text-5xl uppercase md:text-6xl">
          Ny oppskrift
        </h1>
        {children}
      </Container>
    </section>
  );
}

export default NewRecipePage;
