'use strict';

// Offsets are UTF-16 positions, matching VS Code's document.offsetAt().
function findEnclosingPairs(text, offsets) {
  const stack = [];
  const pairs = [];
  const openers = '([{';
  const closers = ')]}';
  for (let i = 0; i < text.length; i++) {
    const character = text[i];
    if (openers.includes(character)) {
      stack.push({ character, offset: i });
    } else if (closers.includes(character)) {
      const top = stack[stack.length - 1];
      if (top && openers.indexOf(top.character) === closers.indexOf(character)) {
        stack.pop();
        pairs.push({ open: top.offset, close: i });
      } else {
        // A crossing/mismatched pair must not be treated as enclosing.
        stack.length = 0;
      }
    }
  }
  return offsets.map(offset => {
    let nearest = null;
    for (const pair of pairs) {
      // Also include the cursor immediately after the closing bracket.
      if (pair.open < offset && offset <= pair.close + 1 &&
          (!nearest || pair.open > nearest.open)) nearest = pair;
    }
    return nearest;
  });
}

function activate(context) {
  const vscode = require('vscode');
  context.subscriptions.push(vscode.commands.registerCommand(
    'removePairBrackets.removeNearest', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;
      const document = editor.document;
      const offsets = editor.selections.map(selection => document.offsetAt(selection.active));
      const pairs = findEnclosingPairs(document.getText(), offsets);
      const positions = [...new Set(pairs.filter(Boolean).flatMap(pair => [pair.open, pair.close]))]
        .sort((a, b) => a - b);
      if (!positions.length) return;
      await editor.edit(builder => {
        for (const offset of positions) {
          builder.delete(new vscode.Range(document.positionAt(offset), document.positionAt(offset + 1)));
        }
      }, { undoStopBefore: true, undoStopAfter: true });
      // VS Code adjusts all selections for the edit, preserving multicursor state.
    }
  ));
}

module.exports = { activate, findEnclosingPairs };
