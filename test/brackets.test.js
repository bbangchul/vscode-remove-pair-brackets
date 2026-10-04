'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { findEnclosingPairs } = require('../extension');
function remove(marked) {
  const offset = marked.indexOf('|');
  const text = marked.replace('|', '');
  const pair = findEnclosingPairs(text, [offset])[0];
  return pair ? text.slice(0, pair.open) + text.slice(pair.open + 1, pair.close) + text.slice(pair.close + 1) : text;
}
for (const [input, expected] of [
  ['(a |+ b)', 'a + b'], ['[a|]', 'a'], ['{a|}', 'a'],
  ['func(a + (b * c|))', 'func(a + b * c)'],
  ['({[a|]})', '({a})'], ['(|)', ''], ['(abc|)', 'abc'],
  ['|(abc)', '(abc)'], ['(abc)|', 'abc'], ['a|bc', 'abc'],
  ['(abc|', '(abc'], ['([a|)]', '([a)]'], ['(😀|)', '😀'],
  ['(a\n b|)', 'a\n b'], ['(a) [b|]', '(a) b'],
  ['((a)|)', '(a)'],
  ['{value}|', 'value'], ['[value]|', 'value'],
  ['({value}|)', '(value)'], ['[{value}]|', '{value}'],
  ['{value} |', '{value} ']
]) test(input, () => assert.equal(remove(input), expected));
test('multiple cursors find shared and distinct pairs', () => {
  assert.deepEqual(findEnclosingPairs('(ab) [c]', [1, 2, 6]), [
    { open: 0, close: 3 }, { open: 0, close: 3 }, { open: 5, close: 7 }
  ]);
});
test('command deletes shared brackets once in a single undoable edit', async () => {
  const Module = require('node:module');
  const originalLoad = Module._load;
  let command;
  let edits;
  let options;
  const editor = {
    document: { getText: () => '(ab)', offsetAt: x => x, positionAt: x => x },
    selections: [{ active: 1 }, { active: 2 }],
    edit: async (callback, opts) => {
      edits = [];
      options = opts;
      callback({ delete: range => edits.push([range.start, range.end]) });
      return true;
    }
  };
  const mock = {
    window: { activeTextEditor: editor },
    commands: { registerCommand: (id, handler) => { command = handler; return { dispose() {} }; } },
    Range: class { constructor(start, end) { this.start = start; this.end = end; } }
  };
  Module._load = function(id, ...args) { return id === 'vscode' ? mock : originalLoad.call(this, id, ...args); };
  try {
    const context = { subscriptions: [] };
    require('../extension').activate(context);
    assert.equal(context.subscriptions.length, 1);
    await command();
    assert.deepEqual(edits, [[0, 1], [3, 4]]);
    assert.deepEqual(options, { undoStopBefore: true, undoStopAfter: true });
    editor.selections = [{ active: 0 }];
    edits = null;
    await command();
    assert.equal(edits, null);
    mock.window.activeTextEditor = undefined;
    await command();
  } finally { Module._load = originalLoad; }
});
