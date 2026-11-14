interface DraftNoticeProps {
  savedAt: string; // when the draft was written (draft.ts)
  onRestore: () => void;
  onDiscard: () => void;
}

// Shown when «Rediger» opens and this browser has a draft from last time
// (a crash, an empty battery, a closed tab). It's never used without asking.
function DraftNotice({ savedAt, onRestore, onDiscard }: DraftNoticeProps) {
  // "14. nov., 14:32", in Norwegian
  const when = new Date(savedAt).toLocaleString("nb-NO", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      role="status"
      className="mt-6 max-w-3xl border-l-4 border-ink bg-panel px-4 py-3"
    >
      <p className="text-sm">
        Du har et utkast som ikke ble lagret, fra {when}. Et nytt bilde blir
        ikke tatt vare på i utkastet.
      </p>
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={onRestore}
          className="bg-ink px-3 py-1.5 text-sm text-white hover:bg-gold"
        >
          Gjenopprett
        </button>
        <button
          type="button"
          onClick={onDiscard}
          className="border border-ink px-3 py-1.5 text-sm hover:bg-white"
        >
          Forkast
        </button>
      </div>
    </div>
  );
}

export default DraftNotice;
