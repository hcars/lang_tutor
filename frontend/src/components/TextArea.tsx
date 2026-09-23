export function TextArea() {
  return (
    <section
      id="text-area"
      aria-label="Text Area"
      className="flex flex-col h-full rounded-md border border-border bg-card overflow-hidden"
    >
      <div className="px-4 py-2 border-b border-border">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Text Area
        </h2>
      </div>
      <textarea
        className="flex-1 w-full p-4 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none resize-none text-sm"
        placeholder="Start typing here..."
        aria-label="Text editor"
      />
    </section>
  );
}
