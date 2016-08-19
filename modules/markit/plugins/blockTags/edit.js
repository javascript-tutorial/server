'use strict';

/**
 * Client/server plugin
 */

const t = require('i18n');

const LANG = require('config').lang;

t.requirePhrase('markit.edit', require('../../locales/edit/' + LANG + '.yml'));
t.requirePhrase('markit.error', require('../../locales/error/' + LANG + '.yml'));

module.exports = function(md) {

  md.renderer.rules.blocktag_edit = function(tokens, idx, options, env, slf) {

    let token = tokens[idx];

    let text = token.blockTagAttrs.title || t('markit.edit.open.sandbox');

    let href = `http://plnkr.co/edit/${token.plunk.plunkId}?p=preview`;
    return `<a class="edit" target="_blank" href="${href}">${md.utils.escapeHtml(text)}</a>`;
  };

};
