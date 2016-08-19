'use strict';

const markdownItContainer = require('markdown-it-container');
const parseAttrs = require('../utils/parseAttrs');

module.exports = function(md) {

  md.use(markdownItContainer, 'online', {
    marker: '`'
  });
  md.use(markdownItContainer, 'offline', {
    marker: '`'
  });


  md.core.ruler.push('remove_online_offline', function(state) {

    let isEbook = Boolean(state.md.options.ebookType);

    let tokens = state.tokens;

    let remove = isEbook ? 'online' : 'offline';

    // remove online/offline what's appropriate
    for (let idx = 0; idx < state.tokens.length; idx++) {
      let token = state.tokens[idx];

      if (token.type == `container_${remove}_open`) {
        let i = idx + 1;
        while(tokens[i].type != `container_${remove}_close`) i++;

        tokens.splice(idx, i - idx + 1);
        idx --;
      }
    }
  });

  function renderEmpty() {
    return '';
  }

  md.renderer.rules.container_online_open = renderEmpty;
  md.renderer.rules.container_online_close = renderEmpty;
  md.renderer.rules.container_offline_open = renderEmpty;
  md.renderer.rules.container_offline_close = renderEmpty;

};
