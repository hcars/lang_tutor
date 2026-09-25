export function CurrentWordPanel() {
  return (
    <section
      id="current-word-panel"
      aria-label="Current Word Panel"
      className="flex flex-col h-full rounded-md border border-border bg-card overflow-hidden"
    >
      <div className="px-4 py-2 border-b border-border">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Current Word
        </h2>
      </div>
      <div className="flex-1 p-4 text-sm text-muted-foreground">
        Select a word to see details.
      </div>
    </section>
  );
}
