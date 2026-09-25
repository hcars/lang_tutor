import { useState, useRef, useCallback, useEffect } from 'react';
import { useSpellCheck } from '@/hooks/useSpellCheck';
import { CorrectionTooltip } from './CorrectionTooltip';
import type { MisspelledWord } from '@/lib/spellcheck';

interface TextAreaProps {
  language?: string;
}

export function TextArea({ language = 'en_US' }: TextAreaProps) {
  const [text, setText] = useState('');
  const [selectedWord, setSelectedWord] = useState<MisspelledWord | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  
  const { result, isLoading } = useSpellCheck(text, { language });

  const handleScroll = useCallback(() => {
    if (textareaRef.current && overlayRef.current) {
      overlayRef.current.scrollTop = textareaRef.current.scrollTop;
      overlayRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  }, []);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    setSelectedWord(null);
  };

  const handleWordClick = useCallback((word: MisspelledWord, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const rect = textarea.getBoundingClientRect();
      
      setTooltipPosition({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top + 20
      });
      
      setSelectedWord(word);
    }
  }, []);

  const handleSuggestionSelect = useCallback((suggestion: string) => {
    if (!selectedWord || !textareaRef.current) return;
    
    const newText = 
      text.slice(0, selectedWord.start) + 
      suggestion + 
      text.slice(selectedWord.end);
    
    setText(newText);
    setSelectedWord(null);
    
    if (textareaRef.current) {
      textareaRef.current.focus();
      const newCursorPos = selectedWord.start + suggestion.length;
      textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
    }
  }, [selectedWord, text]);

  const renderOverlay = () => {
    if (!result) return null;

    const misspelledWords = result.misspelledWords;
    if (misspelledWords.length === 0) {
      return <span className="whitespace-pre-wrap">{text}</span>;
    }

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    const sortedWords = [...misspelledWords].sort((a, b) => a.start - b.start);

    for (const word of sortedWords) {
      if (word.start > lastIndex) {
        parts.push(
          <span key={`text-${lastIndex}`}>
            {text.slice(lastIndex, word.start)}
          </span>
        );
      }

      parts.push(
        <span
          key={`error-${word.start}`}
          className="spelling-error cursor-pointer hover:spelling-error-hover"
          onClick={(e) => handleWordClick(word, e)}
          style={{
            textDecoration: 'underline',
            textDecorationStyle: 'wavy',
            textDecorationColor: '#ef4444',
            textUnderlineOffset: '3px'
          }}
        >
          {word.text}
        </span>
      );

      lastIndex = word.end;
    }

    if (lastIndex < text.length) {
      parts.push(
        <span key={`text-${lastIndex}`}>
          {text.slice(lastIndex)}
        </span>
      );
    }

    return <>{parts}</>;
  };

  useEffect(() => {
    const handleClickOutside = () => {
      setSelectedWord(null);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <section
      id="text-area"
      aria-label="Text Area"
      className="flex flex-col h-full rounded-md border border-border bg-card overflow-hidden"
    >
      <div className="px-4 py-2 border-b border-border flex items-center justify-between">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Text Area
        </h2>
        {isLoading && (
          <span className="text-xs text-muted-foreground animate-pulse">
            Checking...
          </span>
        )}
      </div>
      <div className="relative flex-1 overflow-hidden">
        <div
          ref={overlayRef}
          className="absolute inset-0 p-4 text-sm whitespace-pre-wrap overflow-auto pointer-events-none"
          aria-hidden="true"
        >
          {renderOverlay()}
        </div>
        <textarea
          ref={textareaRef}
          className="absolute inset-0 w-full h-full p-4 bg-transparent text-transparent caret-foreground focus:outline-none resize-none text-sm overflow-auto"
          value={text}
          onChange={handleTextChange}
          onScroll={handleScroll}
          placeholder="Start typing here..."
          aria-label="Text editor"
          spellCheck={false}
        />
        {selectedWord && (
          <CorrectionTooltip
            word={selectedWord.text}
            suggestions={selectedWord.suggestions}
            position={tooltipPosition}
            onSelectSuggestion={handleSuggestionSelect}
            onClose={() => setSelectedWord(null)}
          />
        )}
      </div>
    </section>
  );
}
