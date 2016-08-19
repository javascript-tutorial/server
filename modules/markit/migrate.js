'use strict';

const parseAttrs = require('./utils/parseAttrs');
const yaml = require('js-yaml');
const stripIndents = require('textUtil/stripIndents');

module.exports = function(text) {

  text = text.replace(/[ \t]+$/gim, ''); // remove spaces

  text = text.replace(/\[(edit.*?)\](.*?)\[\/edit\]/g, '[$1 title="$2"]');
  text = text.replace(/\[(edit.*?)\/\]/g, '[$1]');

  // remove [pre no-typography]...[/pre]
  text = text.replace(/^\[pre.*?\]/gim, '');
  text = text.replace(/^\[\/pre\]/gim, '');

  text = text.replace(/\[\]\(\/(.*?)\)/g, '<info:$1>');
  text = text.replace(/\[\]\((http.*?)\)/g, '<$1>');

  text = text.replace(/\[(https?:.*?)\]\(\)/g, '<$1>');

  text = text.replace(/\[key (.*?)\]/g, '`key:$1`');

  text = text.replace(/\[demo([^\]]*?)\s*\/\]/g, '[demo$1]');

  text = text.replace(/^```(\w+)[ ]*\n([\s\S]*?)^```/gim, function(match, lang, code) {
    let comment;

    code = code.trim();

    comment = code.match(/^\/\/\+(.*?)(\n|$)/);

    if (comment) {
      comment = comment[1];
      code = code.replace(/^\/\/\+(.*?)(\n|$)/, '');
    } else {
      comment = code.match(/^<!--\+(.*?)-->(\n|$)/);
      if (comment) {
        comment = comment[1];
        code = code.replace(/^<!--\+(.*?)-->(\n|$)/, '');
      }
    }

    code = stripIndents(code);

    if (comment) comment = ' ' + comment.replace(/  /g, ' ').trim();
    else comment = '';

    if (!code) return `[${lang}${comment}]`;
    else return '```' + lang + comment + '\n' + code + '\n' + '```';
  });

  // EXTRACT META...
  let meta = {};
  // importance -> meta

  text = text.replace(/\n\[importance (\d)\]\n/, function(match, importance) {
    meta.importance = +importance;
    return '\n';
  });

  text = text.replace(/\n\[libs\]([\s\S]*?)\[\/libs\]/, function(match, libs) {
    meta.libs = libs.trim().split('\n');
    return '\n';
  });

  let head = '';

  text = text.replace(/\n\[head\]([\s\S]*?)\[\/head\]/, function(match, headContent) {
    head = headContent.trim();
    return '\n';
  });

  // ...EXTRACT META...

  // WITH LABELS...

  let codeBlockLabels = {};
  let codeInlineLabels = {};

  text = text.replace(/\n```[\s\S]*?^```/gim, function(code) {
    let label = '~CODELABEL:' + (Math.random() * 1e8 ^ 0) + '\n';
    codeBlockLabels[label] = code;

    return label;
  });

  let r = new RegExp('`[^`\n]+`', 'gim');
  text = text.replace(r, function(code) {
    let label = '~INLINECODE:' + (Math.random() * 1e8 ^ 0);
    codeInlineLabels[label] = code;
    return label;
  });

  text = text.replace(/^(\[.*?\])$/gim, '\n$1\n'); // ensure that all block tags are in paragraphs


  function fixListItem(listItem) {

    listItem = listItem.replace(/\n\n([.<*!а-яёa-z0-9])/gim, '\n\n    $1');

    let codeLabels = listItem.match(/~CODELABEL:\d+(\n|$)/g) || [];
    for (var i = 0; i < codeLabels.length; i++) {
      var label = codeLabels[i];
      if (label[label.length - 1] != '\n') label += '\n';
      codeBlockLabels[label] = indent(codeBlockLabels[label]);
    }

    return listItem;
  }

  text = text.replace(/<ul>([\s\S]+?)<\/ul>/gim, function(match, list) {

    list = list.replace(/<\/li><li>/g, '</li>\n<li>');

    list = list.replace(/<li>\s*([\s\S]*?)\s*<\/li>/gim, function(m, listItem) {

      listItem = fixListItem(listItem);

      return '- ' + listItem;
    });

    return list;
  });

  text = text.replace(/<ol>([\s\S]+?)<\/ol>/gim, function(match, list) {

    list = list.replace(/<\/li><li>/g, '</li>\n<li>');
    let i = 0;
    list = list.replace(/<li>\s*([\s\S]*?)\s*<\/li>/gim, function(m, listItem) {

      listItem = fixListItem(listItem);

      return ++i + '. ' + listItem;
    });

    return list;
  });

  text = text.replace(/<dl>([\s\S]+?)<\/dl>/gim, function(match, list) {


    list = list.replace(/<\/dt><dd>/g, '</dt>\n<dd>');
    list = list.replace(/<dt>\s*([\s\S]*?)\s*<\/dt>/gim, '$1');

    list = list.replace(/<dd>\s*([\s\S]*?)\s*<\/dd>/gim, function(m, listItem) {

      //console.log("\n--------------\nLISTITEM FROM\n", listItem);
      listItem = fixListItem(listItem);

      //console.log("LISTITEM TO\n", listItem);
      return ': ' + listItem.replace(/^\s+/, '') + '\n';
    });

    return list;
  });


  text = text.replace(/<img(.*?)>/g, function(match, attrs) {
    attrs = parseAttrs(attrs);

    let src = attrs.src;
    if (!src) throw new Error('No src in match ' + match);

    delete attrs.src;
    let attrString = [];
    for (let name in attrs) {
      attrString.push(`${name}="${attrs[name]}"`);
    }
    attrString = attrString.join(' ');

    if (attrString) attrString = '|' + attrString;
    return `![${attrString}](${src})`;
  });


  for (let label in codeInlineLabels) {
    text = text.replace(label, escapeRegReplace(codeInlineLabels[label]));
  }

  // code inside non-md table is not supported any more
  text = text.replace(/<(th|td)>(.*?)<\/\1>/gim, function(match, td, content) {
    return `<${td}>` + content.replace(/`(.*?)`/gim, '<code>$1</code>') + `</${td}>`;
  });

  for (let label in codeBlockLabels) {
    text = text.replace(label, escapeRegReplace(codeBlockLabels[label]) + '\n');
  }

  // ...WITH LABELS

  text = text.replace(/[ \t]+$/gim, ''); // trailing spaces
  text = text.replace(/\n{3,}/gim, '\n\n'); // many line breaks into 2

  text = text.replace(/\n\[compare\]([\s\S]*?)\[\/compare\]/g, function(match, content) {
    // -List -> - List
    return '\n```compare\n' + content.trim().replace(/^([-+])/gim, '$1 ') + '\n```';
  });


  text = text.replace(/\n\[(smart|warn|ponder|summary|online|offline|quote)(.*?)\]([\s\S]*?)\[\/\1\]/g, function(match, name, attrs, content) {
    content = content.trim();

    let delim = '```';

    if (content.indexOf('```') > -1) delim = '````';

    return '\n' + delim + name + (attrs ? ' ' + attrs.trim() : '') + '\n' + content + '\n' + delim;
  });


  if (Object.keys(meta).length) {
    text = yaml.safeDump(meta) + '\n---\n\n' + text.replace(/^\s*/, '');
  }

  return {meta, head, text};
};

function indent(code) {
  return '    ' + code.replace(/\n/gim, '\n    ');
}

// escape a string to use as a safe replace
// otherwise $1 becomes backreference
function escapeRegReplace(string) {
  return string.replace(/\$/g, '$$$$'); // $ -> $$
}
