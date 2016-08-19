'use strict';

/**
 * ```quote author="Author"
 */

const markdownItContainer = require('markdown-it-container');
const parseAttrs = require('../utils/parseAttrs');

module.exports = function(md) {

  md.use(markdownItContainer, 'quote', {
    marker: '`'
  });

  md.renderer.rules.container_quote_open = function(tokens, idx, options, env, slf) {
    return `<blockquote class="quote"><div class="quote__i"><div class="quote__text">`;
  };

  md.renderer.rules.container_quote_close = function(tokens, idx, options, env, slf) {
    let result = '</div></div>';

    let i = idx - 1;
    while (tokens[i].type != 'container_quote_open') i--;

    let attrs = parseAttrs(tokens[i].info, true);

    if (attrs.author) {
      result += `<footer class="quote__footer">
        <cite class="quote__author">${md.utils.escapeHtml(attrs.author)}</cite>
       </footer>`;
    }

    return result + '</blockquote>';
  };


};
