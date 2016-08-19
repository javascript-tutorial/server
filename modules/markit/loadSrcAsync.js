'use strict';

/**
 * Loads info from external sources for
 * sandbox: links
 * codetabs
 * edit
 * iframe edit
 * [js src...] (for editing)
 *
 * @type {ok|exports|module.exports}
 */

const assert = require('assert');
const Plunk = require('plunk').Plunk;
const path = require('path');
const fs = require('mz/fs');
const t = require('i18n');

const tokenUtils = require('./utils/token');

var LANG = require('config').lang;

t.requirePhrase('markit.error', require('./locales/error/' + LANG + '.yml'));


class SrcError extends Error {
}

function srcUnderRoot(root, src) {
  let absolutePath = path.join(root, src);

  if (absolutePath.slice(0, root.length + 1) != root + '/') {
    throw new SrcError(t('markit.error.src_outside_of_root', {src}));
  }

  return absolutePath;
}


module.exports = function* (tokens, options) {

  let methods = {
    blocktag_codetabs: src2plunk,
    blocktag_edit: src2plunk,
    blocktag_iframe,
    blocktag_source,
    link_open
  };

  function* src2plunk(token) {

    let src = path.join(options.resourceWebRoot, token.blockTagAttrs.src);

    let plunk = yield Plunk.findOne({webPath: src});

    if (!plunk) {
      throw new SrcError(t('markit.error.no_such_plunk', {src}));
    }

    token.plunk = plunk;
  }

  function* link_open(token) {
    let href = tokenUtils.attrGet(token, 'href');
    if (!href.startsWith('sandbox:')) return;

    let src = path.join(options.resourceWebRoot, href.slice('sandbox:'.length));

    let plunk = yield Plunk.findOne({webPath: src});

    if (!plunk) {
      throw new SrcError(t('markit.error.no_such_plunk', {src: href}));
    }

    tokenUtils.attrReplace(token, 'href', plunk.getUrl());
  }

  function* blocktag_iframe(token) {
    if (token.blockTagAttrs.edit || token.blockTagAttrs.zip) {
      yield* src2plunk(token);
    }
  }

  function* blocktag_source(token) {

    if (!token.blockTagAttrs.src) return;

    let sourcePath = srcUnderRoot(
      options.publicRoot,
      path.join(options.resourceWebRoot, token.blockTagAttrs.src)
    );

    let content;

    try {
      content = yield fs.readFile(sourcePath, 'utf-8');
    } catch (e) {
      throw new SrcError(
        t('markit.error.read_file', {src: token.blockTagAttrs.src}) +
        (process.env.NODE_ENV == 'development' ? ` [${sourcePath}]` : '')
      );
    }

    token.content = content;
  }

  function* walk(tokens, isInline) {

    for (let idx = 0; idx < tokens.length; idx++) {
      let token = tokens[idx];
      let process = methods[token.type];
      if (process) {
        try {
          yield* process(token);
        } catch (err) {
          if (err instanceof SrcError) {
            token.type = isInline ? 'markdown_error_inline' : 'markdown_error_block';
            token.content = err.message;
          } else {
            throw err;
          }
        }
      }

      if (token.children) {
        yield* walk(token.children, true);
      }

    }

  }


  yield* walk(tokens);
};


