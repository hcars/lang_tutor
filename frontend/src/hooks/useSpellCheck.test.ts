import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSpellCheck } from './useSpellCheck';

describe('useSpellCheck', () => {
  it('should initialize with null result', () => {
    const { result } = renderHook(() => useSpellCheck(''));
    expect(result.current.result).toBeNull();
  });

  it('should set loading state initially', () => {
    const { result } = renderHook(() => useSpellCheck('hello'));
    expect(result.current.isLoading).toBe(true);
  });

  it('should provide getSuggestions function', () => {
    const { result } = renderHook(() => useSpellCheck('hello'));
    expect(typeof result.current.getSuggestions).toBe('function');
  });

  it('should provide checkWord function', () => {
    const { result } = renderHook(() => useSpellCheck('hello'));
    expect(typeof result.current.checkWord).toBe('function');
  });

  it('should accept custom debounce time', () => {
    const { result } = renderHook(() => useSpellCheck('test', { debounceMs: 500 }));
    expect(result.current).toBeDefined();
  });

  it('should accept custom language', () => {
    const { result } = renderHook(() => useSpellCheck('test', { language: 'en_US' }));
    expect(result.current).toBeDefined();
  });
});
