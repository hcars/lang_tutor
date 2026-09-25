import { describe, it, expect } from 'vitest';
import { tokenize, getWordTokens } from './tokenizer';

describe('tokenizer', () => {
  describe('tokenize', () => {
    it('should return empty array for empty string', () => {
      expect(tokenize('')).toEqual([]);
    });

    it('should tokenize simple text', () => {
      const tokens = tokenize('hello world');
      expect(tokens).toHaveLength(3);
      expect(tokens[0]).toMatchObject({ text: 'hello', isWord: true });
      expect(tokens[1]).toMatchObject({ text: ' ', isWord: false });
      expect(tokens[2]).toMatchObject({ text: 'world', isWord: true });
    });

    it('should track positions correctly', () => {
      const tokens = tokenize('hello world');
      expect(tokens[0]).toMatchObject({ text: 'hello', start: 0, end: 5 });
      expect(tokens[1]).toMatchObject({ text: ' ', start: 5, end: 6 });
      expect(tokens[2]).toMatchObject({ text: 'world', start: 6, end: 11 });
    });

    it('should handle punctuation', () => {
      const tokens = tokenize('hello, world!');
      const words = tokens.filter(t => t.isWord);
      expect(words).toHaveLength(2);
      expect(words[0].text).toBe('hello');
      expect(words[1].text).toBe('world');
    });

    it('should handle multiple spaces', () => {
      const tokens = tokenize('hello   world');
      expect(tokens).toHaveLength(3);
      expect(tokens[0].text).toBe('hello');
      expect(tokens[1].text).toBe('   ');
      expect(tokens[2].text).toBe('world');
    });

    it('should handle newlines', () => {
      const tokens = tokenize('hello\nworld');
      const words = tokens.filter(t => t.isWord);
      expect(words).toHaveLength(2);
    });
  });

  describe('getWordTokens', () => {
    it('should return only word tokens', () => {
      const words = getWordTokens('hello, world! how are you?');
      expect(words).toHaveLength(5);
      expect(words.every(t => t.isWord)).toBe(true);
    });

    it('should return empty array for non-word text', () => {
      const words = getWordTokens('   \n\t  ');
      expect(words).toHaveLength(0);
    });
  });
});
