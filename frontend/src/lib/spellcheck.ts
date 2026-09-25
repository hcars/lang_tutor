import Typo from 'typo-js';
import type { Token } from './tokenizer';
import { getWordTokens } from './tokenizer';
import { getDictionaryUrls } from './dictionaryRegistry';
import { getCachedDictionary, setCachedDictionary } from './dictionaryCache';

export interface MisspelledWord extends Token {
  suggestions: string[];
}

export interface SpellCheckResult {
  misspelledWords: MisspelledWord[];
  totalWords: number;
}

class SpellCheckService {
  private dictionaries: Map<string, Typo> = new Map();
  private currentLanguage: string = 'en_US';

  async initialize(language: string): Promise<void> {
    if (this.dictionaries.has(language)) {
      this.currentLanguage = language;
      return;
    }

    try {
      const cached = await getCachedDictionary(language);
      
      let affData: string;
      let dicData: string;

      if (cached) {
        affData = cached.aff;
        dicData = cached.dic;
      } else {
        const urls = getDictionaryUrls(language);
        
        const [affResponse, dicResponse] = await Promise.all([
          fetch(urls.aff),
          fetch(urls.dic)
        ]);

        if (!affResponse.ok || !dicResponse.ok) {
          throw new Error(`Failed to load dictionary files for ${language}`);
        }

        affData = await affResponse.text();
        dicData = await dicResponse.text();

        await setCachedDictionary(language, affData, dicData);
      }

      const dictionary = new Typo(language, affData, dicData);
      this.dictionaries.set(language, dictionary);
      this.currentLanguage = language;
    } catch (error) {
      console.error(`Failed to load dictionary for ${language}:`, error);
      throw error;
    }
  }

  setLanguage(language: string): void {
    if (!this.dictionaries.has(language)) {
      throw new Error(`Dictionary for ${language} not loaded. Call initialize() first.`);
    }
    this.currentLanguage = language;
  }

  getLanguage(): string {
    return this.currentLanguage;
  }

  checkWord(word: string): boolean {
    const dictionary = this.dictionaries.get(this.currentLanguage);
    if (!dictionary) {
      console.warn('No dictionary loaded, skipping spell check');
      return true;
    }

    if (!word || word.length === 0) return true;
    
    const trimmed = word.trim();
    if (trimmed.length === 0) return true;

    return dictionary.check(trimmed);
  }

  getSuggestions(word: string, maxSuggestions: number = 5): string[] {
    const dictionary = this.dictionaries.get(this.currentLanguage);
    if (!dictionary) {
      return [];
    }

    const trimmed = word.trim();
    if (trimmed.length === 0) return [];

    const suggestions = dictionary.suggest(trimmed);
    return suggestions.slice(0, maxSuggestions);
  }

  checkText(text: string, language?: string): SpellCheckResult {
    if (language) {
      this.setLanguage(language);
    }

    const wordTokens = getWordTokens(text, this.getLanguageCode());
    const misspelledWords: MisspelledWord[] = [];

    for (const token of wordTokens) {
      if (!this.checkWord(token.text)) {
        misspelledWords.push({
          ...token,
          suggestions: this.getSuggestions(token.text)
        });
      }
    }

    return {
      misspelledWords,
      totalWords: wordTokens.length
    };
  }

  private getLanguageCode(): string {
    const langMap: Record<string, string> = {
      'en_US': 'en',
      'es_ES': 'es',
      'fr_FR': 'fr',
      'de_DE': 'de'
    };
    return langMap[this.currentLanguage] || 'en';
  }
}

export const spellCheckService = new SpellCheckService();
