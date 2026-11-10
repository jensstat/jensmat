import { Link } from "react-router";
import Container from "../components/Container";

interface NotFoundPageProps {
  title?: string;
  message?: string;
}

// Shown for addresses that don't exist (the "*" route in App.tsx),
// and by pages that can't find what was asked for, like a recipe id with no recipe.
function NotFoundPage({
  title = "Fant ikke siden",
  message = "Adressen finnes ikke.",
}: NotFoundPageProps) {
  return (
    <section className="flex-1 bg-white font-mono">
      <Container>
        <h1 className="font-display text-5xl uppercase md:text-6xl">{title}</h1>
        <p className="mt-3 text-neutral-600">{message}</p>
        <Link to="/" className="mt-6 inline-block underline hover:text-red-600">
          Til forsiden
        </Link>
      </Container>
    </section>
  );
}

export default NotFoundPage;
