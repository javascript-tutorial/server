'use strict';

/**
 * Client/server plugin
 */

const t = require('i18n');

const LANG = require('config').lang;

t.requirePhrase('markit.iframe', require('../../locales/iframe/' + LANG + '.yml'));
t.requirePhrase('markit.error', require('../../locales/error/' + LANG + '.yml'));

module.exports = function(md) {

  md.renderer.rules.blocktag_iframe = function(tokens, idx, options, env, slf) {

    let token = tokens[idx];

    let trusted = options.html && !token.blockTagAttrs.untrusted ? 1 : 0;

    let height = +token.blockTagAttrs.height || 300;

    if (!options.html) {
      height = Math.min(height, 800);
    }

    let src = token.blockTagAttrs.src;

    let iframeId = options.html && token.blockTagAttrs.id ? ` id="${token.blockTagAttrs.id}"` : '';

    if (!src) {
      return `<div class="markdown-error">${t('markit.error.attr_required', {attr: 'src'})}</div>`;
    }

    // relative url w/o domain means we want static host
    //    [iframe src="dir"]
    // otherwise we want a dynamic service e.g
    //    [iframe src="/ajax/service"]
    if (src[0] != '/' && !~src.indexOf('://')) {
      if (!~src.indexOf('.')) src += '/';
      // samedomain means we keep iframe on current domain
      // for using js between it and the main window (see travel/ in tutorial)
      src = (options.html && token.blockTagAttrs.samedomain ? '' : options.staticHost) + options.resourceWebRoot + '/' + src;
    }

    let toolbarHtml = '';
    if (token.blockTagAttrs.link) {
      toolbarHtml += `<div class="toolbar__tool">
        <a href="${src}" target="_blank" title="${t('markit.iframe.open.window')}" class="toolbar__button toolbar__button_external"></a>
      </div>
      `;
    }

    if (token.plunk && token.blockTagAttrs.edit) {
      toolbarHtml += `<div class="toolbar__tool">
        <a href="http://plnkr.co/edit/${token.plunk.plunkId}?p=preview" target="_blank" title="${t('markit.iframe.open.sandbox')}"
        data-plunk-id="${token.plunk.plunkId}" class="toolbar__button toolbar__button_edit"></a>
      </div>
      `;
    }

    if (token.plunk && token.blockTagAttrs.zip) {
      let zipname = src.split('/').filter(Boolean).reverse()[0];
      let href = `/tutorial/zipview/${zipname}.zip?plunkId=${token.plunk.plunkId}`;
      toolbarHtml += `<div class="toolbar__tool">
        <a href="${href}" target="_blank" title="${t('markit.iframe.open.download')}" class="toolbar__button toolbar__button_download"></a>
      </div>
      `;
    }

    return `<div class="code-result">
    <div class="code-result__toolbar toolbar">${toolbarHtml}</div>
    <iframe${iframeId} class="code-result__iframe" data-trusted="${trusted}" style="height:${height}px" src="${src}"></iframe>
  </div>`;

  };
};
