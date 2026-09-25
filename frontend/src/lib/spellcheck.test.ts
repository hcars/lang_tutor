import { describe, it, expect, beforeEach } from 'vitest';
import { spellCheckService } from './spellcheck';

describe('spellcheck', () => {
  beforeEach(async () => {
    await spellCheckService.initialize('en_US');
  });

  describe('checkWord', () => {
    it('should return true for correctly spelled words', () => {
      expect(spellCheckService.checkWord('hello')).toBe(true);
      expect(spellCheckService.checkWord('world')).toBe(true);
      expect(spellCheckService.checkWord('test')).toBe(true);
    });

    it('should return false for misspelled words', () => {
      expect(spellCheckService.checkWord('helo')).toBe(false);
      expect(spellCheckService.checkWord('wrold')).toBe(false);
      expect(spellCheckService.checkWord('tset')).toBe(false);
    });

    it('should handle empty strings', () => {
      expect(spellCheckService.checkWord('')).toBe(true);
      expect(spellCheckService.checkWord('  ')).toBe(true);
    });
  });

  describe('getSuggestions', () => {
    it('should return suggestions for misspelled words', () => {
      const suggestions = spellCheckService.getSuggestions('helo');
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions).toContain('hello');
    });

    it('should limit suggestions to maxSuggestions', () => {
      const suggestions = spellCheckService.getSuggestions('helo', 2);
      expect(suggestions.length).toBeLessThanOrEqual(2);
    });

    it('should return empty array for correctly spelled words', () => {
      const suggestions = spellCheckService.getSuggestions('hello');
      expect(suggestions).toEqual([]);
    });

    it('should return empty array for empty string', () => {
      const suggestions = spellCheckService.getSuggestions('');
      expect(suggestions).toEqual([]);
    });
  });

  describe('checkText', () => {
    it('should identify misspelled words in text', () => {
      const result = spellCheckService.checkText('helo wrold');
      expect(result.misspelledWords).toHaveLength(2);
      expect(result.misspelledWords[0].text).toBe('helo');
      expect(result.misspelledWords[1].text).toBe('wrold');
    });

    it('should return correct positions', () => {
      const result = spellCheckService.checkText('helo wrold');
      expect(result.misspelledWords[0]).toMatchObject({
        text: 'helo',
        start: 0,
        end: 4
      });
      expect(result.misspelledWords[1]).toMatchObject({
        text: 'wrold',
        start: 5,
        end: 10
      });
    });

    it('should include suggestions for each misspelled word', () => {
      const result = spellCheckService.checkText('helo wrold');
      expect(result.misspelledWords[0].suggestions.length).toBeGreaterThan(0);
      expect(result.misspelledWords[1].suggestions.length).toBeGreaterThan(0);
    });

    it('should count total words correctly', () => {
      const result = spellCheckService.checkText('hello world test');
      expect(result.totalWords).toBe(3);
    });

    it('should handle text with no errors', () => {
      const result = spellCheckService.checkText('hello world');
      expect(result.misspelledWords).toHaveLength(0);
      expect(result.totalWords).toBe(2);
    });

    it('should handle empty text', () => {
      const result = spellCheckService.checkText('');
      expect(result.misspelledWords).toHaveLength(0);
      expect(result.totalWords).toBe(0);
    });

    it('should ignore punctuation', () => {
      const result = spellCheckService.checkText('hello, world!');
      expect(result.misspelledWords).toHaveLength(0);
    });
  });

  describe('language management', () => {
    it('should get current language', () => {
      expect(spellCheckService.getLanguage()).toBe('en_US');
    });

    it('should throw error when setting unloaded language', () => {
      expect(() => spellCheckService.setLanguage('es_ES')).toThrow();
    });
  });
});
