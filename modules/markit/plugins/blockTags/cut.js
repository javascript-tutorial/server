'use strict';


function removeCut(state) {
  for (let idx = state.tokens.length - 1; idx >= 0; idx--) {

    if (state.tokens[idx].type !== 'inline') continue;

    doReplacementsInToken(state.tokens[idx].children);
  }
}

function doReplacementsInToken(inlineTokens) {
  let i, token;

  for (i = 0; i < inlineTokens.length; i++) {
    token = inlineTokens[i];
    if (token.type === 'text') {
      token.content = token.content.replace('[cut]', '');
    }
  }
}

module.exports = function smartArrows_plugin(md, scheme) {
  // must come before the built-in m-dash and n-dash support
  md.core.ruler.before('replacements', 'remove_cut', removeCut);
};
