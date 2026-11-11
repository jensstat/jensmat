// Shown on the very first load of a page that needs data (see HydrateFallback in
// routes.tsx), before there's an old page to keep on screen.
function LoadingPage() {
  return (
    <section className="flex-1 bg-white font-sans text-ink">
      <p
        role="status"
        className="mx-auto w-full max-w-3xl px-5 py-12 text-ink/60"
      >
        Laster…
      </p>
    </section>
  );
}

export default LoadingPage;
