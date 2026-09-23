export function GrammarPanel() {
  return (
    <section
      id="grammar-panel"
      aria-label="Grammar Panel"
      className="flex flex-col h-full rounded-md border border-border bg-card overflow-hidden"
    >
      <div className="px-4 py-2 border-b border-border">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Grammar Panel
        </h2>
      </div>
      <div className="flex-1 p-4 text-sm text-muted-foreground">
        Grammar feedback will appear here.
      </div>
    </section>
  );
}
