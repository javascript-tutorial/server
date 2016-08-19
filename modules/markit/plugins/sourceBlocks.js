'use strict';

/**
 * Client/server plugin
 * Rewrites fenced blocks to blocktag_source
 * adds the renderer for it
 */

const parseAttrs = require('../utils/parseAttrs');
const stripIndents = require('textUtil/stripIndents');
const extractHighlight = require('../utils/source/extractHighlight');
const t = require('i18n');
const getPrismLanguage = require('../getPrismLanguage');

const LANG = require('config').lang;

t.requirePhrase('markit.code', require('../locales/code/' + LANG + '.yml'));


function rewriteFenceToSource(state) {

  for (var idx = 0; idx < state.tokens.length; idx++) {

    if (state.tokens[idx].type == 'fence') {
      let attrs = parseAttrs(state.tokens[idx].info, true);

      let langOrExt = attrs.blockName || '';

      if (getPrismLanguage.allSupported.indexOf(langOrExt) == -1) continue;

      state.tokens[idx].type = 'blocktag_source';
      state.tokens[idx].blockTagAttrs = attrs;
    }
  }

}


module.exports = function(md) {

  md.core.ruler.push('rewrite_fence_to_source', rewriteFenceToSource);

  md.renderer.rules.blocktag_source = function(tokens, idx, options, env, slf) {
    let token = tokens[idx];

    let attrs = token.blockTagAttrs;

    var lang = attrs.blockName;
    let prismLanguage = getPrismLanguage(lang);

    token.attrPush([ 'data-trusted', (options.html && !attrs.untrusted) ? 1 : 0]);

    if (attrs.global) {
      token.attrPush(['data-global', 1]);
    }

    token.attrPush([ 'class', 'code-example' ]);

    if (attrs['no-strict']) {
      token.attrPush(['data-no-strict', 1]);
    }

    let height;
    // demo height of
    if (+attrs.height) {
      height = +attrs.height;
      if (!options.html) height = Math.max(height, 800);
      token.attrPush(['data-demo-height', height]);
    }

    if (options.html && attrs.autorun) {
      // autorun may have "no-epub" value meaning that it shouldn't run on epub (code not supported)
      token.attrPush(['data-autorun', attrs.autorun]);
    }

    if (attrs.refresh) {
      token.attrPush(['data-refresh', '1']);
    }

    if (options.html && attrs.demo) {
      token.attrPush(['data-demo', '1']);
    }

    // strip first empty lines
    let content = stripIndents(token.content);

    let highlight = extractHighlight(content);

    if (highlight.block) {
      token.attrPush(['data-highlight-block', highlight.block]);
    }
    if (highlight.inline) {
      token.attrPush(['data-highlight-inline', highlight.inline]);
    }

    content = highlight.text;

    let toolbarHtml = '';
    if (attrs.run) {
      toolbarHtml = `
        <div class="toolbar codebox__toolbar">
          <div class="toolbar__tool">
            <a href="#" title="${t(lang == 'js' ? 'markit.code.run' : 'markit.code.show')}" data-action="run" class="toolbar__button toolbar__button_run"></a>
          </div>
          <div class="toolbar__tool">
            <a href="#" title="${t('markit.code.open.sandbox')}" target="_blank" data-action="edit" class="toolbar__button toolbar__button_edit"></a>
          </div>
        </div>`;
    }

    let codeResultHtml = '';

    //- iframe must be in HTML with the right height
    //- otherwise page sizes will be wrong and autorun leads to resizes/jumps
    if (attrs.autorun && options.html && lang == 'html') {
      //- iframes with about:html are saved to disk incorrectly by FF (1 iframe content for all)
      //- @see https://bugzilla.mozilla.org/show_bug.cgi?id=1154167
      codeResultHtml = `<div class="code-result code-example__result">
        <iframe
          class="code-result__iframe"
          name="code-result-${(Math.random()*1e9^0).toString(36)}"
          style="height:${height || 200}px"
          src="${options.ebookType == 'epub' ? ("/bookify/blank.html?" + Math.random()) : 'about:blank'}"></iframe>
      </div>`;
    }

    return `<div${slf.renderAttrs(token)}>
      <div class="codebox code-example__codebox">
        ${toolbarHtml}
        <div class="codebox__code" data-code="1">
          <pre class="line-numbers language-${prismLanguage}"><code class="language-${prismLanguage}">${md.utils.escapeHtml(content)}</code></pre>
        </div>
      </div>
      ${codeResultHtml}
      </div>`;

  };

};
