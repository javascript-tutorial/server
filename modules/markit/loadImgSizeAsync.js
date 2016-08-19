'use strict';

const assert = require('assert');

assert(typeof IS_CLIENT === 'undefined');


const imageSize = require('image-size');

const path = require('path');
const tokenUtils = require('./utils/token');
const t = require('i18n');
const fs = require('mz/fs');
const gm = require('gm');

var LANG = require('config').lang;

t.requirePhrase('markit.error', require('./locales/error/' + LANG + '.yml'));

class SrcError extends Error {
}

module.exports = function* (tokens, options) {


  for (let idx = 0; idx < tokens.length; idx++) {
    let token = tokens[idx];

    if (token.type == 'figure') {

      yield* processImageOrFigure(token);
      continue;
    }

    if (token.type != 'inline') continue;

    for (let i = 0; i < token.children.length; i++) {
      let inlineToken = token.children[i];
      // <td><figure></td> gives figure inside inline token
      if (inlineToken.type != 'image' && inlineToken.type != 'figure') continue;

      yield* processImageOrFigure(inlineToken);
    }

  }

  function* processImageOrFigure(token) {

    if (token.attrIndex('height') != -1 || token.attrIndex('width') != -1) return;

    try {
      yield* doProcessImageOrFigure(token);
    } catch (error) {
      if (error instanceof SrcError) {
        // replace image with error text
        token.type = (token.type == 'image') ? 'markdown_error_inline' : 'markdown_error_block';
        token.tag = '';
        token.children = null;
        token.attrs = null;
        token.content = error.message;
      } else {
        throw error;
      }

    }
  }

  function srcUnderRoot(root, src) {
    let absolutePath = path.join(root, src);

    if (absolutePath.slice(0, root.length + 1) != root + '/') {
      throw new SrcError(t('markit.error.src_outside_of_root', {src}));
    }

    return absolutePath;
  }

  function* getImageInfo(src) {

    let sourcePath = srcUnderRoot(
      options.publicRoot,
      src
    );

    // check readability
    let stat;

    try {
      stat = yield fs.stat(sourcePath);
    } catch (e) {
      throw new SrcError(t('markit.error.image_not_found', {src}));
    }

    if (!stat.isFile()) {
      throw new SrcError(t('markit.error.image_not_found', {src}));
    }

    if (/\.svg$/i.test(sourcePath)) {
      try {
        let size = yield function(callback) {
          // GraphicsMagick fails with `gm identify my.svg`
          gm(sourcePath).options({imageMagick: true}).identify('{"width":%w,"height":%h}', callback);
        };

        size = JSON.parse(size); // warning: no error processing

        return size;
      } catch (e) {
        throw new SrcError(`${src}: ${e.message}`);
      }
    }


    try {
      return yield function(callback) {
        imageSize(sourcePath, callback);
      };

    } catch (e) {
      if (e instanceof TypeError) {
        throw new SrcError(t('markit.error.image_invalid', {src}));
      }

      throw new SrcError(`${src}: ${e.message}`);
    }
  }

  function* doProcessImageOrFigure(token) {
    let src = tokenUtils.attrGet(token, 'src');
    if (!src) return;

    let imageInfo = yield* getImageInfo(src);

    tokenUtils.attrReplace(token, 'width', imageInfo.width);
    tokenUtils.attrReplace(token, 'height', imageInfo.height);
  }


};


