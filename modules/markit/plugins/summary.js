'use strict';

/**
 * Client/server plugin
 */

const markdownItContainer = require('markdown-it-container');
const parseAttrs = require('../utils/parseAttrs');
const t = require('i18n');

const LANG = require('config').lang;

module.exports = function(md) {

  md.use(markdownItContainer, 'summary', {
    marker: '`',
    render(tokens, idx) {

      if (tokens[idx].nesting === 1) {
        return `<div class="summary"><div class="summary__content">`;
      } else {
        // closing tag
        return '</div></div>\n';
      }
    }
  });

};
