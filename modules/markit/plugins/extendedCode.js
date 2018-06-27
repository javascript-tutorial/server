'use strict';

/**
 * Adds `key:Ctrl+B` support to code_inline
 * @param md
 */

module.exports = function(md) {

  md.renderer.rules.code_inline = function(tokens, idx, options, env, slf) {

    let token = tokens[idx];
    let content = token.content.trim();

    if (content.indexOf('key:') == 0) {
      return renderKey(content.slice(4));
    } else {
      let codePrefixes = ['pattern', 'match', 'subject'];
      for (let i = 0; i < codePrefixes.length; i++) {
        let prefix = codePrefixes[i];
        if (content.startsWith(prefix + ':')) {
          return `<code class="${prefix}">${md.utils.escapeHtml(content.slice(prefix.length + 1))}</code>`;
        }
      }
    }

    return '<code>' + md.utils.escapeHtml(content) + '</code>';
  };

  function renderKey(keys) {

    let results = [];

    if (keys === '+') {
      return `<kbd class="shortcut">+</kbd>`;
    }

    let plusLabel = Math.random();
    keys = keys.replace(/\+\+/g, '+' + plusLabel);
    keys = keys.split('+');

    for (let i = 0; i < keys.length; i++) {
      let key = keys[i];
      results.push((key == plusLabel) ? '+' : md.utils.escapeHtml(key));
      if (i < keys.length - 1) {
        results.push('<span class="shortcut__plus">+</span>');
      }
    }

    return `<kbd class="shortcut">${results.join('')}</kbd>`;
  }

};
