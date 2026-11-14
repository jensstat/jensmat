interface NoticeProps {
  message: string;
}

// A short message at the bottom of the screen («Lagret ✓», «… er slettet»), shown for a
// few seconds (useNotice). role="status": screen readers read it out, without moving focus.
// fixed: it stays in view wherever you've scrolled. Fades in, like «Laster…» in App.tsx.
function Notice({ message }: NoticeProps) {
  return (
    <p
      role="status"
      className="pointer-events-none fixed bottom-[calc(env(safe-area-inset-bottom,0px)+1.5rem)] left-1/2 z-20 -translate-x-1/2 rounded-full bg-ink px-5 py-2.5 font-sans text-sm text-white shadow-lg transition-opacity duration-300 starting:opacity-0 motion-reduce:transition-none print:hidden"
    >
      {message}
    </p>
  );
}

export default Notice;
