'use strict';

const parseAttrs = require('../../utils/parseAttrs');
const getPrismLanguage = require('../../getPrismLanguage');

function rewriteInlineToBlockTags(state) {
  for (let idx = 1; idx < state.tokens.length - 1; idx++) {
    if (state.tokens[idx - 1].type == 'paragraph_open' &&
      state.tokens[idx + 1].type == 'paragraph_close' &&
      state.tokens[idx].type == 'inline') {

      let blockTagMatch = state.tokens[idx].content.trim().match(/^\[(\w+\s*[^\]]*)\]$/);
      if (!blockTagMatch) continue;

      let blockTagAttrs = parseAttrs(blockTagMatch[1], true);

      let blockName = blockTagAttrs.blockName;

      // if not supported
      if (!state.md.options.blockTags || state.md.options.blockTags.indexOf(blockName) == -1) continue;

      let tokenType = getPrismLanguage.allSupported.indexOf(blockName) == -1 ? 'blocktag_' + blockName : 'blocktag_source';

      let blockTagToken = new state.Token(tokenType, blockName, state.tokens[idx].nesting);

      blockTagToken.blockTagAttrs = blockTagAttrs;
      blockTagToken.map = state.tokens[idx].map.slice();
      blockTagToken.block = true;
      blockTagToken.level = state.tokens[idx].level;

      state.tokens.splice(idx - 1, 3, blockTagToken);
      // no need to move idx back, because
      // p ! p p ! p
      // 0 1 2
      //   ^ if match here, we have this after move
      // B p ! p
      //   ^ idx position ok

    }
  }
}


module.exports = function(md) {

  md.core.ruler.push('rewrite_inline_to_block_tags', rewriteInlineToBlockTags);

};


