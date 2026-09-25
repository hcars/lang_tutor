export interface Token {
  text: string;
  start: number;
  end: number;
  isWord: boolean;
}

export function tokenize(text: string, language: string = 'en'): Token[] {
  if (!text) return [];

  const segmenter = new Intl.Segmenter(language, { granularity: 'word' });
  const segments = Array.from(segmenter.segment(text));

  return segments.map((segment) => ({
    text: segment.segment,
    start: segment.index,
    end: segment.index + segment.segment.length,
    isWord: segment.isWordLike
  }));
}

export function getWordTokens(text: string, language: string = 'en'): Token[] {
  return tokenize(text, language).filter(token => token.isWord);
}
