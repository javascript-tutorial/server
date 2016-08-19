
function stripFirstEmptyLines(text) {
  return text.replace(/^\n+/, ''); // no 'm' flag!
}
// strip first empty lines
function rtrim(text) {
  return text.replace(/\s+$/, '');  // no 'm' flag!
}

function rtrimLines(text) {
  return text.replace(/[ \t]+$/gim, '');
}

function stripSpaceIndent(text) {

  if (!text) return text;

  var stripPattern = /^ *(?=\S+)/gm;

  var indentLen = text.match(stripPattern)
    .reduce(function (min, line) {
      return Math.min(min, line.length);
    }, Infinity);

  var indent = new RegExp('^ {' + indentLen + '}', 'gm');
  return indentLen > 0 ? text.replace(indent, '') : text;
}

function stripTabIndent(text) {
  if (!text) return text;

  var stripPattern = /^\t*(?=\S+)/gm;

  var indentLen = text.match(stripPattern)
    .reduce(function (min, line) {
      return Math.min(min, line.length);
    }, Infinity);

  var indent = new RegExp('^\t{' + indentLen + '}', 'gm');
  return indentLen > 0 ? text.replace(indent, '') : text;
}

// same as Ruby strip_heredoc + rtrim every line + strip first lines and rtrim
module.exports = function(text) {
  text = rtrim(text);
  text = rtrimLines(text);
  text = stripFirstEmptyLines(text);

  text = stripSpaceIndent(text);
  text = stripTabIndent(text);

  return text;
};
