import { useState, useEffect, useCallback, useRef } from 'react';
import { spellCheckService, type SpellCheckResult } from '@/lib/spellcheck';

interface UseSpellCheckOptions {
  debounceMs?: number;
  language?: string;
}

interface UseSpellCheckReturn {
  result: SpellCheckResult | null;
  isLoading: boolean;
  error: string | null;
  getSuggestions: (word: string) => string[];
  checkWord: (word: string) => boolean;
}

export function useSpellCheck(
  text: string,
  options: UseSpellCheckOptions = {}
): UseSpellCheckReturn {
  const { debounceMs = 300, language = 'en_US' } = options;
  
  const [result, setResult] = useState<SpellCheckResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const languageRef = useRef(language);

  useEffect(() => {
    let cancelled = false;
    
    const initializeDictionary = async () => {
      try {
        setIsLoading(true);
        setError(null);
        await spellCheckService.initialize(language);
        if (!cancelled) {
          setIsInitialized(true);
          languageRef.current = language;
        }
      } catch (err) {
        if (!cancelled) {
          setError(`Failed to load dictionary: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    if (language !== languageRef.current || !isInitialized) {
      initializeDictionary();
    }

    return () => {
      cancelled = true;
    };
  }, [language, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!text.trim()) {
      setResult({ misspelledWords: [], totalWords: 0 });
      return;
    }

    setIsLoading(true);
    
    debounceRef.current = setTimeout(() => {
      try {
        const checkResult = spellCheckService.checkText(text);
        setResult(checkResult);
        setError(null);
      } catch (err) {
        setError(`Spell check failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setIsLoading(false);
      }
    }, debounceMs);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [text, debounceMs, isInitialized]);

  const getSuggestions = useCallback((word: string): string[] => {
    return spellCheckService.getSuggestions(word);
  }, []);

  const checkWord = useCallback((word: string): boolean => {
    return spellCheckService.checkWord(word);
  }, []);

  return {
    result,
    isLoading,
    error,
    getSuggestions,
    checkWord
  };
}
