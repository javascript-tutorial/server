'use strict';

/**
 * Replaces relative img src with resourceRoot/src
 */

const tokenUtils = require('../utils/token');

module.exports = function(md) {

  md.core.ruler.push('resolve_mdn_src', function(state) {

    for (let idx = 0; idx < state.tokens.length; idx++) {
      let token = state.tokens[idx];

      if (token.type !== 'inline') continue;

      for (let i = 0; i < token.children.length; i++) {
        let inlineToken = token.children[i];

        if (inlineToken.type == 'link_open') {
          let href = tokenUtils.attrGet(inlineToken, 'href');

          if (href.startsWith('mdn:')) {
            let parts = href.slice(4).split('/');

            let prefix = `https://developer.mozilla.org/${process.env.NODE_LANG == 'ru' ? 'ru' : 'en-US'}/docs/Web`;

            if (parts[0] == 'js') {
              prefix += '/JavaScript/Reference/Global_Objects/';
            } else if (parts[0] == 'api') {
              prefix += '/API/';
            } else {
              prefix += '/';
            }

            parts.shift();
            href = prefix + parts.join('/');

            tokenUtils.attrReplace(inlineToken, 'href', href);
          }
        }
      }
    }

  });

};
