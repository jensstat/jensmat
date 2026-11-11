import { Outlet, ScrollRestoration, useNavigation } from "react-router";
import Footer from "./components/Footer";
import Header from "./components/Header";

// App is the frame around every page: header, the page, footer.
// Which page goes in <Outlet /> is decided by the address (see routes.tsx).
function App() {
  // "loading" while React Router waits for the next page's loader (see loaders.ts)
  const isLoading = useNavigation().state === "loading";

  return (
    // min-h-screen + flex-col: the page is at least as tall as the screen.
    // flex-1 on <main> lets it fill the leftover space, so the footer stays at the bottom.
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />
      {/* <main> sets no width, so pages can have full-width backgrounds.
          Each page centres its own content with max-w-6xl, like Header and Footer.
          flex flex-col lets a page fill all of <main> by giving its section flex-1. */}
      <main className="flex flex-1 flex-col">
        {isLoading && <LoadingNotice />}
        <Outlet />
      </main>
      <Footer />
      {/* A new page starts at the top; the back button goes back to where you were */}
      <ScrollRestoration />
    </div>
  );
}

// A calm "Laster…" at the top of the screen while the next page loads (fixed: it stays
// in view even when you've scrolled down). The old page stays
// on screen until the new one is ready. It fades in after a short moment, so a quick
// load shows nothing at all (no flicker), and only a slow one shows the notice.
function LoadingNotice() {
  return (
    <p
      role="status"
      className="pointer-events-none fixed top-[calc(env(safe-area-inset-top,0px)+0.75rem)] left-1/2 z-20 -translate-x-1/2 rounded-full bg-ink px-4 py-1.5 font-sans text-sm text-white shadow transition-opacity delay-200 duration-300 starting:opacity-0 motion-reduce:transition-none"
    >
      Laster…
    </p>
  );
}

export default App;
