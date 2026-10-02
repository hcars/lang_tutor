# Load Dictionaries from LibreOffice at Runtime

## Overview
Remove the 5.4MB of dictionary files from git and load them at runtime from the official LibreOffice dictionaries repository on GitHub, with IndexedDB caching for offline support.

## Dictionary Source URLs

All dictionaries served from `https://raw.githubusercontent.com/LibreOffice/dictionaries/master/`:

| Language | .aff path | .dic path |
|----------|-----------|-----------|
| en_US | `en/en_US.aff` | `en/en_US.dic` |
| es_ES | `es/es_ES.aff` | `es/es_ES.dic` |
| fr_FR | `dictionaries/fr_FR/dictionaries/fr.aff` | `dictionaries/fr_FR/dictionaries/fr.dic` |
| de_DE | `de/de_DE_frami.aff` | `de/de_DE_frami.dic` |

## Implementation Steps

### 1. Create dictionary registry (`src/lib/dictionaryRegistry.ts`)
- Map each language code to its LibreOffice raw GitHub URLs (aff + dic)
- Export a `getDictionaryUrls(language: string)` function
- Throw clear error for unsupported languages

### 2. Create IndexedDB cache layer (`src/lib/dictionaryCache.ts`)
- Simple wrapper around IndexedDB with two object stores: `aff` and `dic`
- `get(language)` - returns cached aff+dic strings or null
- `set(language, aff, dic)` - stores dictionary strings
- Database name: `lang-tutor-dictionaries`, version 1

### 3. Modify `src/lib/spellcheck.ts`
- In `initialize()`:
  1. Check IndexedDB cache first
  2. If cache miss, fetch `.aff` and `.dic` from LibreOffice GitHub URLs
  3. Store fetched data in IndexedDB for future use
  4. Construct `Typo` instance with the fetched strings
- Remove the old `/dictionaries/` local path fetching

### 4. Remove dictionary files from git
- Delete `public/dictionaries/en_US.aff`
- Delete `public/dictionaries/en_US.dic`
- Delete `public/dictionaries/es_ES.aff`
- Delete `public/dictionaries/es_ES.dic`
- Delete `public/dictionaries/fr_FR.aff`
- Delete `public/dictionaries/fr_FR.dic`
- Delete `public/dictionaries/de_DE.aff`
- Delete `public/dictionaries/de_DE.dic`
- Remove the `public/dictionaries/` directory

### 5. Update tests
- **`src/test/setup.ts`**: Update the fetch mock to match LibreOffice GitHub URLs (`raw.githubusercontent.com/LibreOffice/dictionaries/master/`) instead of `/dictionaries/`
- **`src/lib/spellcheck.test.ts`**: Tests should still work since they call `initialize()` which will use the mocked fetch
- **`src/lib/dictionaryRegistry.test.ts`**: New test file for the registry
- **`src/lib/dictionaryCache.test.ts`**: New test file for the IndexedDB cache (mock IndexedDB)

### 6. Add loading state for dictionary download
- The existing `isLoading` state in `useSpellCheck` already covers this
- The TextArea already shows "Checking..." when loading
- Consider changing the text to "Loading dictionary..." on first load vs "Checking..." on subsequent checks

## Files Changed

| Action | File |
|--------|------|
| Create | `src/lib/dictionaryRegistry.ts` |
| Create | `src/lib/dictionaryCache.ts` |
| Create | `src/lib/dictionaryRegistry.test.ts` |
| Create | `src/lib/dictionaryCache.test.ts` |
| Modify | `src/lib/spellcheck.ts` |
| Modify | `src/test/setup.ts` |
| Delete | `public/dictionaries/*.aff` (4 files) |
| Delete | `public/dictionaries/*.dic` (4 files) |

## Key Design Decisions

- **IndexedDB over localStorage**: Dictionary files are large (en_US.dic is 539KB, de_DE_frami.dic is 4.3MB). localStorage has a ~5MB limit; IndexedDB has no practical limit.
- **No service worker**: Overkill for this use case. Simple fetch + IndexedDB is sufficient.
- **Fail loudly on unsupported language**: The registry throws rather than silently failing, so the UI can display the error.
- **Cache key is language code**: e.g., `en_US`, `es_ES`. Simple and matches the Typo constructor expectation.

## Verification
1. `bun run test:run` - all tests pass
2. `bun run build` - build succeeds
3. Manual: open app, type text, verify spell check works for en_US
4. Manual: switch to es_ES, type Spanish text, verify spell check works
5. Manual: reload page, verify dictionaries load from cache (no network fetch)
6. Manual: clear IndexedDB, reload, verify dictionaries re-download
