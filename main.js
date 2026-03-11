pixso.showUI(__html__, {
  width: 520,
  height: 340,
  themeColors: true,
});

async function init() {
  var settings = await pixso.clientStorage.getAsync('settings');
  if (settings) {
    pixso.ui.postMessage({ type: 'LOAD_SETTINGS', settings: settings });
  }
}
init();

pixso.ui.onmessage = async function (msg) {
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

function handleCopySelected() {
  var textNodes = getSelectedTextNodes('row');

  if (textNodes.length === 0) {
    pixso.ui.postMessage({ type: 'ERROR', message: 'No text layers selected' });
    return;
  }

  var texts = textNodes.map(function (node) { return node.characters; });
  pixso.ui.postMessage({ type: 'COPY_RESULT', texts: texts });
}

async function handlePaste(lines, options) {
  var textNodes = getSelectedTextNodes(options.sortOrder);

  if (textNodes.length === 0) {
    pixso.ui.postMessage({ type: 'ERROR', message: 'No text layers selected' });
    return;
  }

  if (lines.length === 0) {
    pixso.ui.postMessage({ type: 'ERROR', message: 'No text to paste' });
    return;
  }

  var processedLines = lines.slice();

  if (options.ignoreEnabled && options.ignoreSymbols) {
    processedLines = applyIgnoreSymbols(processedLines, options.ignoreSymbols);
  }

  if (options.reverse) {
    processedLines = processedLines.slice().reverse();
  }

  if (options.loop) {
    processedLines = applyLoopPaste(processedLines, textNodes.length);
  }

  var pastedCount = 0;

  for (var i = 0; i < textNodes.length; i++) {
    if (i >= processedLines.length) break;

    var node = textNodes[i];
    var newText = processedLines[i];

    try {
      var fonts = node.getRangeAllFontNames(0, node.characters.length);
      await Promise.all(fonts.map(function (font) { return pixso.loadFontAsync(font); }));
      node.characters = newText;
      pastedCount++;
    } catch (e) {
      console.error('Failed to paste to node:', e);
    }
  }

  pixso.ui.postMessage({ type: 'PASTE_RESULT', count: pastedCount });
}

function getSelectedTextNodes(sortOrder) {
  var textNodes = pixso.currentPage.selection
    .filter(function (node) { return node.type === 'TEXT'; });

  if (textNodes.length === 0) return [];

  var nodesWithBox = textNodes
    .map(function (node) { return { node: node, box: node.absoluteBoundingBox }; })
    .filter(function (item) { return item.box !== null; });

  if (nodesWithBox.length === 0) return [];

  if (sortOrder === 'row') {
    var rows = clusterByCoordinate(nodesWithBox, 'y');
    rows.sort(function (a, b) { return a.coord - b.coord; });

    var result = [];
    for (var r = 0; r < rows.length; r++) {
      var sorted = rows[r].items.sort(function (a, b) { return a.box.x - b.box.x; });
      for (var s = 0; s < sorted.length; s++) result.push(sorted[s].node);
    }
    return result;
  } else {
    var columns = clusterByCoordinate(nodesWithBox, 'x');
    columns.sort(function (a, b) { return a.coord - b.coord; });

    var result = [];
    for (var c = 0; c < columns.length; c++) {
      var sorted = columns[c].items.sort(function (a, b) { return a.box.y - b.box.y; });
      for (var s = 0; s < sorted.length; s++) result.push(sorted[s].node);
    }
    return result;
  }
}

function clusterByCoordinate(items, coord) {
  if (items.length === 0) return [];

  var sorted = items.slice().sort(function (a, b) { return a.box[coord] - b.box[coord]; });

  var sizeKey = coord === 'x' ? 'width' : 'height';
  var total = 0;
  for (var i = 0; i < sorted.length; i++) total += sorted[i].box[sizeKey];
  var avgSize = total / sorted.length;
  var threshold = avgSize * 0.5;

  var clusters = [];
  var currentCluster = [sorted[0]];
  var clusterStart = sorted[0].box[coord];

  for (var i = 1; i < sorted.length; i++) {
    var item = sorted[i];
    var prevItem = sorted[i - 1];

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

  if (currentCluster.length > 0) {
    var lastItem = currentCluster[currentCluster.length - 1];
    clusters.push({
      coord: clusterStart + (lastItem.box[coord] - clusterStart) / 2,
      items: currentCluster,
    });
  }

  return clusters;
}

function applyLoopPaste(lines, targetCount) {
  if (lines.length === 0 || targetCount === 0) return [];

  var result = [];
  for (var i = 0; i < targetCount; i++) {
    result.push(lines[i % lines.length]);
  }
  return result;
}

function applyIgnoreSymbols(lines, symbolsStr) {
  if (!symbolsStr.trim()) return lines;

  var symbols;

  if (/^[,\s]+$/.test(symbolsStr)) {
    symbols = [','];
  } else {
    symbols = symbolsStr.split(',').map(function (s) { return s.trim(); }).filter(function (s) { return s.length > 0; });
  }

  return lines.map(function (line) {
    var result = line;
    for (var i = 0; i < symbols.length; i++) {
      var escaped = symbols[i].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      result = result.replace(new RegExp(escaped, 'g'), '');
    }
    return result;
  });
}
