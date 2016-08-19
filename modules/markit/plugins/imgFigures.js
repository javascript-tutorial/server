'use strict';

/**
 * Reads attrs from ![alt|height=100 width=200](...) into image token
 *
 * P.S. Plugins that work like ![...](/url =100x150) require special parser, not markdown-compatible markup
 */

const parseAttrs = require('../utils/parseAttrs');
const tokenUtils = require('../utils/token');

function imgFigures(state) {

  for (let idx = 1; idx < state.tokens.length - 1; idx++) {
    let token = state.tokens[idx];

    if (token.type !== 'inline') continue;

    // inline token must have 1 child
    if (!token.children || token.children.length !== 1) continue;
    // child is image
    if (token.children[0].type !== 'image') continue;
    // prev token is paragraph open

    let isInParagraph = state.tokens[idx - 1].type == 'paragraph_open' &&
        state.tokens[idx + 1].type == 'paragraph_close';

    let hasFigureAttr = tokenUtils.attrGet(token.children[0], 'figure');

    tokenUtils.attrDel(token.children[0], 'figure'); // this attr is not needed any more

    if (!isInParagraph && !hasFigureAttr) continue;

    // we have a figure!
    // replace <p><img></p> with figure
    let figureToken = token.children[0];
    figureToken.type = 'figure';
    figureToken.tag = 'figure';

    if (isInParagraph) {
      state.tokens.splice(idx - 1, 3, figureToken);
    }
  }

}

module.exports = function(md) {

  md.core.ruler.push('img_figures', imgFigures);

  md.renderer.rules.figure = function(tokens, idx, options, env, slf) {
    let token = tokens[idx];
    let width = tokenUtils.attrGet(token, 'width');
    let height = tokenUtils.attrGet(token, 'height');

    if (options.ebookType || !width || !height) {
      return `<figure><img${slf.renderAttrs(token)}></figure>`;
    }

    // here we assume a figure <img> has no "class" attribute
    // so we put our own class on it
    // (if it had, it would refer to figure?)

    return `<figure><div class="image" style="width:${width}px">
      <div class="image__ratio" style="padding-top:${height / width * 100}%"></div>
      <img${slf.renderAttrs(token)} class="image__image">
      </div></figure>`;

  };
};
