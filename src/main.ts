// ManyPaster - Main Plugin Code
// Runs in Pixso sandbox

import { applyLoopPaste, applyReverse, applyIgnoreSymbols } from './utils';

// Enable resizing
pixso.showUI(__html__, { 
  width: 520, 
  height: 340,
  themeColors: true,
});

// Load saved settings on start
async function init() {
  const settings = await pixso.clientStorage.getAsync('settings');
  if (settings) {
    pixso.ui.postMessage({ type: 'LOAD_SETTINGS', settings });
  }
}
init();

// Handle messages from UI
pixso.ui.onmessage = async (msg: { type: string; [key: string]: any }) => {
  switch (msg.type) {
    case 'COPY_SELECTED':
      handleCopySelected();
      break;

    case 'PASTE':
      await handlePaste(msg.lines, msg.options);
      break;

    case 'SAVE_SETTINGS':
      await pixso.clientStorage.setAsync('settings', msg.settings);
      break;

    case 'CLOSE':
      pixso.closePlugin();
      break;
  }
};

function handleCopySelected(): void {
  const textNodes = getSelectedTextNodes('row');
  
  if (textNodes.length === 0) {
    pixso.ui.postMessage({ type: 'ERROR', message: 'No text layers selected' });
    return;
  }

  const texts = textNodes.map(node => node.characters);
  pixso.ui.postMessage({ type: 'COPY_RESULT', texts });
}

async function handlePaste(lines: string[], options: PasteOptions): Promise<void> {
  const textNodes = getSelectedTextNodes(options.sortOrder);

  if (textNodes.length === 0) {
    pixso.ui.postMessage({ type: 'ERROR', message: 'No text layers selected' });
    return;
  }

  if (lines.length === 0) {
    pixso.ui.postMessage({ type: 'ERROR', message: 'No text to paste' });
    return;
  }

  // Apply transformations
  let processedLines = [...lines];

  // Apply ignore symbols first
  if (options.ignoreEnabled && options.ignoreSymbols) {
    processedLines = applyIgnoreSymbols(processedLines, options.ignoreSymbols);
  }

  // Apply reverse
  if (options.reverse) {
    processedLines = applyReverse(processedLines);
  }

  // Apply loop or limit to available lines
  if (options.loop) {
    processedLines = applyLoopPaste(processedLines, textNodes.length);
  }

  let pastedCount = 0;

  for (let i = 0; i < textNodes.length; i++) {
    if (i >= processedLines.length) break;

    const node = textNodes[i];
    const newText = processedLines[i];

    // Load fonts before changing text
    try {
      const fonts = node.getRangeAllFontNames(0, node.characters.length);
      await Promise.all(fonts.map(font => pixso.loadFontAsync(font)));
      node.characters = newText;
      pastedCount++;
    } catch (e) {
      console.error('Failed to paste to node:', e);
    }
  }

  pixso.ui.postMessage({ type: 'PASTE_RESULT', count: pastedCount });
}

function getSelectedTextNodes(sortOrder: 'row' | 'column'): TextNode[] {
  const textNodes = pixso.currentPage.selection
    .filter((node): node is TextNode => node.type === 'TEXT');
  
  if (textNodes.length === 0) return [];

  // Get bounding boxes
  const nodesWithBox = textNodes
    .map(node => ({ node, box: node.absoluteBoundingBox }))
    .filter((item): item is { node: TextNode; box: Rect } => item.box !== null);

  if (nodesWithBox.length === 0) return [];

  if (sortOrder === 'row') {
    // Row by row: group by Y (rows), then sort by X within each row
    const rows = clusterByCoordinate(nodesWithBox, 'y');
    const sortedRows = rows.sort((a, b) => a.coord - b.coord);
    
    const result: TextNode[] = [];
    for (const row of sortedRows) {
      const sorted = row.items.sort((a, b) => a.box.x - b.box.x);
      result.push(...sorted.map(item => item.node));
    }
    return result;
  } else {
    // Column by column: group by X (columns), then sort by Y within each column
    const columns = clusterByCoordinate(nodesWithBox, 'x');
    const sortedColumns = columns.sort((a, b) => a.coord - b.coord);
    
    const result: TextNode[] = [];
    for (const col of sortedColumns) {
      const sorted = col.items.sort((a, b) => a.box.y - b.box.y);
      result.push(...sorted.map(item => item.node));
    }
    return result;
  }
}

// Cluster nodes by coordinate (x or y) with dynamic threshold
function clusterByCoordinate(
  items: { node: TextNode; box: Rect }[],
  coord: 'x' | 'y'
): { coord: number; items: { node: TextNode; box: Rect }[] }[] {
  if (items.length === 0) return [];

  // Sort by the coordinate
  const sorted = [...items].sort((a, b) => a.box[coord] - b.box[coord]);

  // Calculate average size for threshold
  const avgSize = coord === 'x'
    ? sorted.reduce((sum, item) => sum + item.box.width, 0) / sorted.length
    : sorted.reduce((sum, item) => sum + item.box.height, 0) / sorted.length;

  // Threshold: half of average size (adjust as needed)
  const threshold = avgSize * 0.5;

  const clusters: { coord: number; items: { node: TextNode; box: Rect }[] }[] = [];
  let currentCluster: { node: TextNode; box: Rect }[] = [sorted[0]];
  let clusterStart = sorted[0].box[coord];

  for (let i = 1; i < sorted.length; i++) {
    const item = sorted[i];
    const prevItem = sorted[i - 1];
    
    // If gap is larger than threshold, start new cluster
    if (item.box[coord] - prevItem.box[coord] > threshold) {
      clusters.push({
        coord: clusterStart + (prevItem.box[coord] - clusterStart) / 2,
        items: currentCluster,
      });
      currentCluster = [item];
      clusterStart = item.box[coord];
    } else {
      currentCluster.push(item);
    }
  }

  // Add last cluster
  if (currentCluster.length > 0) {
    const lastItem = currentCluster[currentCluster.length - 1];
    clusters.push({
      coord: clusterStart + (lastItem.box[coord] - clusterStart) / 2,
      items: currentCluster,
    });
  }

  return clusters;
}

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Types
interface PasteOptions {
  sortOrder: 'row' | 'column';
  loop: boolean;
  reverse: boolean;
  ignoreEnabled: boolean;
  ignoreSymbols: string;
}
