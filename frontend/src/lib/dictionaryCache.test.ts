import { describe, it, expect, beforeEach } from 'vitest';
import { getCachedDictionary, setCachedDictionary } from './dictionaryCache';

describe('dictionaryCache', () => {
  describe('getCachedDictionary', () => {
    it('should return null for non-existent language', async () => {
      const result = await getCachedDictionary('nonexistent');
      expect(result).toBeNull();
    });

    it('should return cached dictionary after setting', async () => {
      const affData = 'SET UTF-8\nTEST AFF';
      const dicData = '100\ntest\n';

      await setCachedDictionary('en_US', affData, dicData);
      const result = await getCachedDictionary('en_US');

      expect(result).not.toBeNull();
      expect(result?.aff).toBe(affData);
      expect(result?.dic).toBe(dicData);
    });
  });

  describe('setCachedDictionary', () => {
    it('should store dictionary data', async () => {
      const affData = 'SET UTF-8\nANOTHER AFF';
      const dicData = '200\nword1\nword2\n';

      await setCachedDictionary('es_ES', affData, dicData);
      const result = await getCachedDictionary('es_ES');

      expect(result).not.toBeNull();
      expect(result?.aff).toBe(affData);
      expect(result?.dic).toBe(dicData);
    });

    it('should overwrite existing cached data', async () => {
      const affData1 = 'SET UTF-8\nFIRST';
      const dicData1 = '1\nfirst\n';
      await setCachedDictionary('fr_FR', affData1, dicData1);

      const affData2 = 'SET UTF-8\nSECOND';
      const dicData2 = '2\nsecond\n';
      await setCachedDictionary('fr_FR', affData2, dicData2);

      const result = await getCachedDictionary('fr_FR');
      expect(result?.aff).toBe(affData2);
      expect(result?.dic).toBe(dicData2);
    });
  });
});
