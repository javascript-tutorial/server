'use strict';

/**
 * Replaces relative img src with resourceRoot/src
 */

const tokenUtils = require('../utils/token');

module.exports = function(md) {

  md.core.ruler.push('resolve_relative_src', function(state) {

    let methods = {
      link_open,
      image
    };

    for (let idx = 0; idx < state.tokens.length; idx++) {
      let token = state.tokens[idx];

      if (token.type !== 'inline') continue;

      for (let i = 0; i < token.children.length; i++) {
        let inlineToken = token.children[i];

        if (methods[inlineToken.type]) {
          methods[inlineToken.type](inlineToken);
        }
      }
    }

    function image(imgToken) {
      let src = tokenUtils.attrGet(imgToken, 'src');

      if (src.indexOf('://') == -1 && src[0] != '/') {
        src = state.md.options.resourceWebRoot + '/' + src;
        tokenUtils.attrReplace(imgToken, 'src', src);
      }
    }

    function link_open(token) {
      let href = tokenUtils.attrGet(token, 'href');

      // don't touch info:tutorial link protocol
      // don't touch absolute links
      // don't touch in-page #hash
      if (!href.match(/^\w+:/) && href[0] != '/' && href[0] != '#') {
        href = state.md.options.resourceWebRoot + '/' + href;
        tokenUtils.attrReplace(token, 'href', href);
      }

    }

  });

};
