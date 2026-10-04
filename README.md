# Remove Pair Brackets

Remove the nearest pair of brackets surrounding your cursor, keeping everything inside. Supports `()`, `[]`, and `{}` in VS Code.

**Default macOS shortcut: ⌘ + Delete (Command + Backspace).**

[한국어 설명](README.ko.md)

## Example

Place your cursor inside the inner parentheses and press **⌘ + Delete**:

```js
// Before: cursor after c, before the inner closing parenthesis
func(a + (b * c))

// After
func(a + b * c)
```

Nested brackets are supported. In `({[value]})`, placing your cursor inside `value` removes only `[` and `]`.

## Install

Install from the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=SeongCheolBang.remove-pair-brackets), or build a VSIX with `npm run package` and select **Extensions: Install from VSIX...** in the Command Palette. Reload the window if prompted.

## Usage

1. Place your cursor inside a pair of brackets.
2. Press **⌘ + Delete** on macOS, or run **Remove Pair Brackets: Remove Nearest Enclosing Pair** from the Command Palette on any platform.
3. Undo with **⌘Z** on macOS or your usual Undo shortcut.

- The cursor immediately after an opening bracket, immediately before a closing bracket, or immediately after a closing bracket can remove that pair. Empty pairs work too. In nested brackets, placing the cursor immediately after an inner closing bracket removes the inner pair.
- If no matching pair surrounds the cursor, nothing changes.
- With multiple cursors, each cursor removes its nearest pair. A shared pair is removed only once, in a single undoable edit.
- For selections, the active end of each selection determines which pair is removed. Selected content stays intact.
- The default shortcut applies only to writable text editors on macOS.

### Change the shortcut

Open **Keyboard Shortcuts** (`⌘K`, then `⌘S` on macOS), search for **Remove Pair Brackets**, double-click the command, and enter your preferred shortcut.

The default binding overrides the usual Command + Delete action (delete to the beginning of the line) while editing. When no pair is found, the command does nothing; it does not fall back to deleting text. User-defined keybindings take priority. If you previously set a custom shortcut for this command, changing the extension default will not remove it.

VS Code names the Mac keyboard's backward Delete key `backspace`, so the extension declares the combination as `cmd+backspace`. Forward Delete (`Fn + Delete`) is a different key.

## Matching limits

The extension matches bracket characters as plain text. It does not use a language parser: brackets inside strings, comments, and regular expressions also participate in matching. In those cases, the text pair may differ from the language's syntactic pair. Crossing or mismatched brackets are not paired.

## Development

No runtime dependencies, network requests, or telemetry.

Open this folder in VS Code and press **F5** to launch an Extension Development Host. Open `example.txt` there to try the command.

```sh
npm test
npm run package
```

Tests require Node.js 18 or later. The local packaging script uses Python 3's standard library and writes the VSIX to the parent folder. To use the official VS Code packager instead, run `npm run package:vsce` (requires downloading `@vscode/vsce`).

Marketplace Publisher ID: `SeongCheolBang`. To publish, rebuild the VSIX and upload it under this publisher in the Marketplace management page.

## License

MIT. Copyright (c) 2026 SeongCheol Bang. See [LICENSE](LICENSE).
