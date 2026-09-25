import "@testing-library/jest-dom";
import { vi } from 'vitest';
import 'fake-indexeddb/auto';

Element.prototype.hasPointerCapture = Element.prototype.hasPointerCapture || function() {
  return false;
};

Element.prototype.setPointerCapture = Element.prototype.setPointerCapture || function() {};
Element.prototype.releasePointerCapture = Element.prototype.releasePointerCapture || function() {};

Element.prototype.scrollIntoView = Element.prototype.scrollIntoView || function() {};

const originalFetch = globalThis.fetch;
globalThis.fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = typeof input === 'string' ? input : input.toString();
  
  if (url.includes('raw.githubusercontent.com/LibreOffice/dictionaries')) {
    if (url.endsWith('.aff')) {
      return {
        ok: true,
        text: async () => 'SET UTF-8\n'
      } as Response;
    }
    if (url.endsWith('.dic')) {
      return {
        ok: true,
        text: async () => '1\nhello\n'
      } as Response;
    }
  }
  return originalFetch(input, init);
});
