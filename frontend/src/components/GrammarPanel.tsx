import { LanguageSelector } from './LanguageSelector';

interface GrammarPanelProps {
  language: string;
  onLanguageChange: (language: string) => void;
}

export function GrammarPanel({ language, onLanguageChange }: GrammarPanelProps) {
  return (
    <section
      id="grammar-panel"
      aria-label="Grammar Panel"
      className="flex flex-col h-full rounded-md border border-border bg-card overflow-hidden"
    >
      <div className="px-4 py-2 border-b border-border flex items-center justify-between">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Grammar Panel
        </h2>
        <LanguageSelector value={language} onChange={onLanguageChange} />
      </div>
      <div className="flex-1 p-4 text-sm text-muted-foreground">
        Grammar feedback will appear here.
      </div>
    </section>
  );
}
