import { useState } from 'react';
import { TextArea } from "./TextArea";
import { GrammarPanel } from "./GrammarPanel";
import { CurrentWordPanel } from "./CurrentWordPanel";

export function AppLayout() {
  const [language, setLanguage] = useState('en_US');

  return (
    <div
      className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,0.55fr)] grid-rows-[1fr_1fr] gap-3 h-[calc(100vh-7rem)]"
      role="region"
      aria-label="Application layout"
    >
      <div className="md:row-span-2">
        <TextArea language={language} />
      </div>
      <div className="min-h-0">
        <GrammarPanel language={language} onLanguageChange={setLanguage} />
      </div>
      <div className="min-h-0">
        <CurrentWordPanel />
      </div>
    </div>
  );
}
