// ManyPaster - Pure utility functions (testable)

/**
 * Parse textarea content into lines
 * Each line = one element for paste
 */
export function parseTextToLines(text: string): string[] {
  if (!text) return [];
  return text.split('\n').filter(line => line.length > 0);
}

/**
 * Sort nodes by position: top to bottom, left to right
 */
export function sortByPosition<T extends { x: number; y: number }>(nodes: T[]): T[] {
  return [...nodes].sort((a, b) => {
    if (a.y !== b.y) return a.y - b.y;
    return a.x - b.x;
  });
}

/**
 * Apply loop paste: cycle through lines if more targets than lines
 */
export function applyLoopPaste(lines: string[], targetCount: number): string[] {
  if (lines.length === 0 || targetCount === 0) return [];
  
  const result: string[] = [];
  for (let i = 0; i < targetCount; i++) {
    result.push(lines[i % lines.length]);
  }
  return result;
}

/**
 * Reverse array
 */
export function applyReverse<T>(items: T[]): T[] {
  return [...items].reverse();
}

/**
 * Remove specified symbols/words from lines
 * Symbols are comma-separated, but a single comma itself is also valid
 */
export function applyIgnoreSymbols(lines: string[], symbolsStr: string): string[] {
  if (!symbolsStr.trim()) return lines;
  
  let symbols: string[];
  
  // Handle edge case: if input is just comma(s), treat comma as the symbol
  if (/^[,\s]+$/.test(symbolsStr)) {
    symbols = [','];
  } else {
    // Split by comma, trim each symbol
    symbols = symbolsStr.split(',').map(s => s.trim()).filter(s => s.length > 0);
  }
  
  return lines.map(line => {
    let result = line;
    for (const symbol of symbols) {
      // Escape special regex characters
      const escaped = symbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      result = result.replace(new RegExp(escaped, 'g'), '');
    }
    return result;
  });
}
