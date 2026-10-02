import { useState, useRef, useCallback, useEffect } from 'react';
import { useSpellCheck } from '@/hooks/useSpellCheck';
import { CorrectionTooltip } from './CorrectionTooltip';
import type { MisspelledWord } from '@/lib/spellcheck';

interface TextAreaProps {
  language?: string;
}

function getCharAtPoint(x: number, y: number): number | null {
  const doc = document as Document & {
    caretPositionFromPoint?: (x: number, y: number) => { offset: number } | null;
  };
  if (typeof doc.caretPositionFromPoint === 'function') {
    const pos = doc.caretPositionFromPoint(x, y);
    return pos ? pos.offset : null;
  }
  if (typeof document.caretRangeFromPoint === 'function') {
    const range = document.caretRangeFromPoint(x, y);
    return range ? range.startOffset : null;
  }
  return null;
}

export function TextArea({ language = 'en_US' }: TextAreaProps) {
  const [text, setText] = useState('');
  const [selectedWord, setSelectedWord] = useState<MisspelledWord | null>(null);
  const [hoveredWord, setHoveredWord] = useState<MisspelledWord | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  
  const { result, isLoading } = useSpellCheck(text, { language });

  const findWordAtPosition = useCallback((charIndex: number): MisspelledWord | null => {
    if (!result) return null;
    return result.misspelledWords.find(
      (w) => charIndex >= w.start && charIndex < w.end
    ) ?? null;
  }, [result]);

  const handleScroll = useCallback(() => {
    if (textareaRef.current && overlayRef.current) {
      overlayRef.current.scrollTop = textareaRef.current.scrollTop;
      overlayRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  }, []);

  const applySuggestion = useCallback((word: MisspelledWord, suggestion: string) => {
    const newText =
      text.slice(0, word.start) +
      suggestion +
      text.slice(word.end);

    setText(newText);
    setSelectedWord(null);
    setHoveredWord(null);

    if (textareaRef.current) {
      textareaRef.current.focus();
      const newCursorPos = word.start + suggestion.length;
      textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
    }
  }, [text]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    setSelectedWord(null);
    setHoveredWord(null);
  };

  const handleTextareaMouseUp = useCallback((e: React.MouseEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;
    const charIndex = textarea.selectionStart;
    if (charIndex === null) return;

    const word = findWordAtPosition(charIndex);
    if (!word) {
      setSelectedWord(null);
      return;
    }

    const rect = textarea.getBoundingClientRect();
    setTooltipPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top + 20
    });
    setSelectedWord(word);
  }, [findWordAtPosition]);

  const handleTextareaMouseMove = useCallback((e: React.MouseEvent<HTMLTextAreaElement>) => {
    const charIndex = getCharAtPoint(e.clientX, e.clientY);
    if (charIndex === null) {
      setHoveredWord(null);
      return;
    }

    const word = findWordAtPosition(charIndex);
    if (!word) {
      setHoveredWord(null);
      return;
    }

    const rect = textareaRef.current!.getBoundingClientRect();
    setHoverPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top + 20
    });
    setHoveredWord(word);
  }, [findWordAtPosition]);

  const handleTextareaMouseLeave = useCallback(() => {
    setHoveredWord(null);
  }, []);

  const handleSuggestionSelect = useCallback((suggestion: string) => {
    if (!selectedWord) return;
    applySuggestion(selectedWord, suggestion);
  }, [selectedWord, applySuggestion]);

  const handleHoverSuggestionSelect = useCallback((suggestion: string) => {
    if (!hoveredWord) return;
    applySuggestion(hoveredWord, suggestion);
  }, [hoveredWord, applySuggestion]);

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
          className="spelling-error"
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
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('[data-testid="hover-tooltip"]') || target.closest('[role="dialog"]')) {
        return;
      }
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
          onMouseUp={handleTextareaMouseUp}
          onMouseMove={handleTextareaMouseMove}
          onMouseLeave={handleTextareaMouseLeave}
          onScroll={handleScroll}
          placeholder="Start typing here..."
          aria-label="Text editor"
          spellCheck={false}
        />
        {hoveredWord && hoveredWord.suggestions.length > 0 && (
          <div
            data-testid="hover-tooltip"
            className="absolute z-40 bg-card border border-border rounded-md shadow-lg p-2 min-w-[150px]"
            style={{
              left: `${hoverPosition.x}px`,
              top: `${hoverPosition.y}px`
            }}
          >
            <div className="text-xs text-muted-foreground mb-2 px-1">
              Suggestions for &quot;{hoveredWord.text}&quot;
            </div>
            <div className="space-y-1">
              {hoveredWord.suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleHoverSuggestionSelect(suggestion)}
                  className="w-full text-left px-2 py-1 text-sm rounded hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
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
