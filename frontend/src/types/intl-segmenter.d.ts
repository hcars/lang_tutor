declare namespace Intl {
  interface SegmenterOptions {
    granularity?: 'grapheme' | 'word' | 'sentence';
    localeMatcher?: 'lookup' | 'best fit';
  }

  interface SegmentData {
    segment: string;
    index: number;
    input: string;
    isWordLike: boolean;
  }

  interface Segments {
    [Symbol.iterator](): IterableIterator<SegmentData>;
    containing(index?: number): SegmentData;
    from(index: number): SegmentData;
  }

  class Segmenter {
    constructor(locales?: string | string[], options?: SegmenterOptions);
    segment(input: string): Segments;
    resolvedOptions(): {
      locale: string;
      granularity: 'grapheme' | 'word' | 'sentence';
    };
    static supportedLocalesOf(
      locales: string | string[],
      options?: { localeMatcher?: 'lookup' | 'best fit' }
    ): string[];
  }
}
