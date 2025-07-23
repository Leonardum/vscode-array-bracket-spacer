const vscode = require('vscode');

function normalizeArrays(text) {
  const formatted = text.replace(/\[\s*([^\[\]\n]+?)\s*\]/g, (match, p1, offset) => {
    const prevChar = text[offset - 1] || '';
    const isLikelyAccess =  prevChar
      ? /[\w\)\]\.]/.test(prevChar)
      : false;

    return isLikelyAccess || !p1.trim() // Likely array access or empty array, so do not add the spaces.
      ? `[${p1.trim()}]`
      : `[ ${p1.trim()} ]`;
  });

  return formatted;
}

function removeSpacesBeforeSelfClosingTags(text) {
  const formatted = text.replace(/\s*\/>/g, () => {
    return '/>';
  });

  return formatted;
}

function activate(context) {
  const formatArraysOnSave = vscode.workspace.onWillSaveTextDocument((event) => {
    const doc = event.document;

    if (![ 'typescript', 'typescriptreact' ].includes(doc.languageId)) {
      return;
    };

    const text = doc.getText();
    const arraysFormatted = normalizeArrays(text);
    const formatted = removeSpacesBeforeSelfClosingTags(arraysFormatted);

    if (formatted !== text) {
      const fullRange = new vscode.Range(doc.positionAt(0), doc.positionAt(text.length));
      event.waitUntil(Promise.resolve([ vscode.TextEdit.replace(fullRange, formatted) ]));
    }
  });

  context.subscriptions.push(formatArraysOnSave);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
};
