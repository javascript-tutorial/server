'use strict';

module.exports = function(md) {

  md.core.ruler.push('header_level_shift', function(state) {

    let headerLevelShift = state.md.options.headerLevelShift;

    if (!headerLevelShift) return;

    let tokens = state.tokens;
    for (let idx = 0; idx < state.tokens.length; idx++) {
      let token = state.tokens[idx];

      if (token.type == 'heading_open' || token.type == 'heading_close') {
        let newLevel = +tokens[idx].tag.slice(1) + headerLevelShift;
        token.tag = 'h' + newLevel;
      }

    }
  });


};


