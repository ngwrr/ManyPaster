import { describe, it, expect } from 'vitest';
import {
  parseTextToLines,
  sortByPosition,
  applyLoopPaste,
  applyReverse,
  applyIgnoreSymbols,
} from '../src/utils';

// 3.1 parseTextToLines
describe('parseTextToLines', () => {
  it('splits text by newline', () => {
    const result = parseTextToLines('one\ntwo\nthree');
    expect(result).toEqual(['one', 'two', 'three']);
  });

  it('filters empty lines', () => {
    const result = parseTextToLines('one\n\ntwo\n\n\nthree');
    expect(result).toEqual(['one', 'two', 'three']);
  });

  it('handles text with commas and special characters', () => {
    const result = parseTextToLines('Hello, world!\nPrice: $100\nEmail: test@mail.com');
    expect(result).toEqual(['Hello, world!', 'Price: $100', 'Email: test@mail.com']);
  });

  it('returns empty array for empty string', () => {
    expect(parseTextToLines('')).toEqual([]);
  });

  it('returns empty array for null/undefined', () => {
    expect(parseTextToLines(null as any)).toEqual([]);
    expect(parseTextToLines(undefined as any)).toEqual([]);
  });

  it('handles single line without newline', () => {
    expect(parseTextToLines('single line')).toEqual(['single line']);
  });

  it('preserves leading/trailing spaces in lines', () => {
    const result = parseTextToLines('  spaced  \n  text  ');
    expect(result).toEqual(['  spaced  ', '  text  ']);
  });
});

// 3.2 sortByPosition
describe('sortByPosition', () => {
  it('sorts by Y first (top to bottom)', () => {
    const nodes = [
      { x: 0, y: 100 },
      { x: 0, y: 0 },
      { x: 0, y: 50 },
    ];
    const result = sortByPosition(nodes);
    expect(result.map(n => n.y)).toEqual([0, 50, 100]);
  });

  it('sorts by X when Y is equal (left to right)', () => {
    const nodes = [
      { x: 100, y: 0 },
      { x: 0, y: 0 },
      { x: 50, y: 0 },
    ];
    const result = sortByPosition(nodes);
    expect(result.map(n => n.x)).toEqual([0, 50, 100]);
  });

  it('sorts by Y then X combined', () => {
    const nodes = [
      { x: 100, y: 100 },
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 0, y: 100 },
    ];
    const result = sortByPosition(nodes);
    expect(result).toEqual([
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 0, y: 100 },
      { x: 100, y: 100 },
    ]);
  });

  it('does not mutate original array', () => {
    const nodes = [{ x: 100, y: 100 }, { x: 0, y: 0 }];
    const original = [...nodes];
    sortByPosition(nodes);
    expect(nodes).toEqual(original);
  });
});

// 3.3 applyLoopPaste
describe('applyLoopPaste', () => {
  it('returns lines as-is when count <= lines.length', () => {
    const lines = ['A', 'B', 'C'];
    expect(applyLoopPaste(lines, 2)).toEqual(['A', 'B']);
    expect(applyLoopPaste(lines, 3)).toEqual(['A', 'B', 'C']);
  });

  it('loops when count > lines.length', () => {
    const lines = ['A', 'B', 'C'];
    expect(applyLoopPaste(lines, 5)).toEqual(['A', 'B', 'C', 'A', 'B']);
    expect(applyLoopPaste(lines, 7)).toEqual(['A', 'B', 'C', 'A', 'B', 'C', 'A']);
  });

  it('handles single line', () => {
    expect(applyLoopPaste(['X'], 3)).toEqual(['X', 'X', 'X']);
  });

  it('returns empty array for empty input', () => {
    expect(applyLoopPaste([], 5)).toEqual([]);
    expect(applyLoopPaste(['A'], 0)).toEqual([]);
  });
});

// 3.4 applyReverse
describe('applyReverse', () => {
  it('reverses array', () => {
    expect(applyReverse(['A', 'B', 'C'])).toEqual(['C', 'B', 'A']);
  });

  it('handles single element', () => {
    expect(applyReverse(['A'])).toEqual(['A']);
  });

  it('handles empty array', () => {
    expect(applyReverse([])).toEqual([]);
  });

  it('does not mutate original array', () => {
    const original = ['A', 'B', 'C'];
    applyReverse(original);
    expect(original).toEqual(['A', 'B', 'C']);
  });
});

// 3.5 applyIgnoreSymbols
describe('applyIgnoreSymbols', () => {
  it('removes single symbol', () => {
    const result = applyIgnoreSymbols(['Hello, World!'], ',');
    expect(result).toEqual(['Hello World!']);
  });

  it('removes multiple symbols (comma-separated)', () => {
    const result = applyIgnoreSymbols(['$100, €200'], '$, €');
    expect(result).toEqual(['100, 200']);
  });

  it('removes words', () => {
    const result = applyIgnoreSymbols(['Hello World Test'], 'World');
    expect(result).toEqual(['Hello  Test']);
  });

  it('handles multiple lines', () => {
    const result = applyIgnoreSymbols(['$10', '$20', '$30'], '$');
    expect(result).toEqual(['10', '20', '30']);
  });

  it('returns original if symbols string is empty', () => {
    const lines = ['Hello', 'World'];
    expect(applyIgnoreSymbols(lines, '')).toEqual(lines);
    expect(applyIgnoreSymbols(lines, '   ')).toEqual(lines);
  });

  it('handles special regex characters', () => {
    const result = applyIgnoreSymbols(['Price: $100.00'], '$, .');
    expect(result).toEqual(['Price: 10000']);
  });
});
