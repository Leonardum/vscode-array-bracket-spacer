const vscode = require('vscode');

function activate(context) {
  let disposable = vscode.workspace.onWillSaveTextDocument((event) => {
    const doc = event.document;
    if (doc.languageId !== 'typescript' && doc.languageId !== 'typescriptreact') return;

    const text = doc.getText();

    // Regex: match array definitions, not array access
    // This is a naive regex: it matches [ ... ] where ... is numbers, strings, or identifiers separated by commas
    const arrayDefRegex = /\[\s*([^\[\]\n]+?)\s*\]/g;

    // Replace with spaces inside brackets
    const formatted = text.replace(arrayDefRegex, (match, p1) => {
      // Don't format if it's likely an array access (e.g. arr[0])
      // Heuristic: if previous char is a letter, number, underscore, closing parenthesis or closing square bracket, skip adding the spaces.
      const prevChar = text[match.index - 1];
      if (
        prevChar &&
        (/[a-zA-Z0-9_]/.test(prevChar) || prevChar === ']' || prevChar === ')')
      ) {
        return match;
      }

      return `[ ${p1.trim()} ]`;
    });

    if (formatted !== text) {
      const fullRange = new vscode.Range(
        doc.positionAt(0),
        doc.positionAt(text.length)
      );

      event.waitUntil(Promise.resolve([
        vscode.TextEdit.replace(fullRange, formatted)
      ]));
    }
  });

  context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
};
