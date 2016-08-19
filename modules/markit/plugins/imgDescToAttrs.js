'use strict';

/**
 * Reads attrs from ![alt|height=100 width=200](...) into image token
 *
 * P.S. Plugins that work like ![...](/url =100x150) require special parser, not markdown-compatible markup
 */

const parseAttrs = require('../utils/parseAttrs');
const tokenUtils = require('../utils/token');

function readImgAttrs(state) {

  for (let idx = 0; idx < state.tokens.length; idx++) {
    let token = state.tokens[idx];

    if (token.type !== 'inline') continue;

    for (let i = 0; i < token.children.length; i++) {
      let inlineToken = token.children[i];

      if (inlineToken.type == 'image') {
        processImg(inlineToken);
      }
    }
  }


  // doesn't work for ![desc *me*|height="*hi*"](fig.png)
  // works for ![desc *me*|height="hi"](fig.png)
  function processImg(imgToken) {
    if (!imgToken.children.length) return; // ![](..) empty image

    // last always textToken
    let lastTextToken = imgToken.children[imgToken.children.length - 1];

    let parts = lastTextToken.content.split('|');
    if (parts.length != 2) { // no | or many || (invalid)
      // try ', ' for tables
      parts = lastTextToken.content.split(', ');
      if (parts.length != 2) {
        // still invalid
        return;
      }
    }

    lastTextToken.content = parts[0];

    let attrs = parseAttrs(parts[1]);

    for (let name in attrs) {
      if (!state.md.options.html && ['height', 'width'].indexOf(name) == -1) continue;
      tokenUtils.attrReplace(imgToken, name, attrs[name]);
    }
  }


}

module.exports = function(md) {

  md.core.ruler.push('read_img_attrs', readImgAttrs);

};
