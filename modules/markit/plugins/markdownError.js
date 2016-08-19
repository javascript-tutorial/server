'use strict';

module.exports = function(md) {

  md.renderer.rules.markdown_error_block = function(tokens, idx, options, env, slf) {
    return '<div class="markdown-error">' + md.utils.escapeHtml(tokens[idx].content) + '</div>';
  };

  md.renderer.rules.markdown_error_inline = function(tokens, idx, options, env, slf) {
    return '<span class="markdown-error">' + md.utils.escapeHtml(tokens[idx].content) + '</span>';
  };

};
