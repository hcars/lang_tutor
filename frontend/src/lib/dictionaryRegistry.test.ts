import { describe, it, expect } from 'vitest';
import { getDictionaryUrls, getSupportedLanguages } from './dictionaryRegistry';

describe('dictionaryRegistry', () => {
  describe('getDictionaryUrls', () => {
    it('should return URLs for en_US', () => {
      const urls = getDictionaryUrls('en_US');
      expect(urls.aff).toContain('en/en_US.aff');
      expect(urls.dic).toContain('en/en_US.dic');
    });

    it('should return URLs for es_ES', () => {
      const urls = getDictionaryUrls('es_ES');
      expect(urls.aff).toContain('es/es_ES.aff');
      expect(urls.dic).toContain('es/es_ES.dic');
    });

    it('should return URLs for fr_FR', () => {
      const urls = getDictionaryUrls('fr_FR');
      expect(urls.aff).toContain('fr_FR');
      expect(urls.aff).toContain('fr.aff');
      expect(urls.dic).toContain('fr_FR');
      expect(urls.dic).toContain('fr.dic');
    });

    it('should return URLs for de_DE', () => {
      const urls = getDictionaryUrls('de_DE');
      expect(urls.aff).toContain('de_DE_frami.aff');
      expect(urls.dic).toContain('de_DE_frami.dic');
    });

    it('should throw error for unsupported language', () => {
      expect(() => getDictionaryUrls('unsupported')).toThrow('Unsupported language');
    });

    it('should use LibreOffice GitHub as base URL', () => {
      const urls = getDictionaryUrls('en_US');
      expect(urls.aff).toContain('raw.githubusercontent.com/LibreOffice/dictionaries');
      expect(urls.dic).toContain('raw.githubusercontent.com/LibreOffice/dictionaries');
    });
  });

  describe('getSupportedLanguages', () => {
    it('should return array of supported language codes', () => {
      const languages = getSupportedLanguages();
      expect(languages).toContain('en_US');
      expect(languages).toContain('es_ES');
      expect(languages).toContain('fr_FR');
      expect(languages).toContain('de_DE');
    });

    it('should return exactly 4 languages', () => {
      const languages = getSupportedLanguages();
      expect(languages).toHaveLength(4);
    });
  });
});
