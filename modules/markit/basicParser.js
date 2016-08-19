'use strict';


const LANG = require('config').lang;

const MarkdownIt = require('markdown-it');

const charTypographyPlugin = require('./plugins/charTypography');
const extendedCodePlugin = require('./plugins/extendedCode');
const outlinedBlocksPlugin = require('./plugins/outlinedBlocks');
const sourceBlocksPlugin = require('./plugins/sourceBlocks');

const imgDescToAttrsPlugin = require('./plugins/imgDescToAttrs');

const markdownErrorPlugin = require('./plugins/markdownError');
const blockTagsPlugin = require('./plugins/blockTags/plugin');
const cutPlugin = require('./plugins/blockTags/cut');
const deflistPlugin = require('markdown-it-deflist');
const getPrismLanguage = require('./getPrismLanguage');

module.exports = class BasicParser {

  constructor(options) {
    options = options || {};
    this.options = options;

    this.env = options.env || {};
    this.md = new MarkdownIt(Object.assign({
      typographer:   true,
      blockTags:     ['cut'].concat(getPrismLanguage.allSupported),
      linkHeaderTag: false,
      html:          false,
      quotes:        LANG == 'ru' ? '«»„“' : '“”‘’'
    }, options));

    extendedCodePlugin(this.md);
    outlinedBlocksPlugin(this.md);
    sourceBlocksPlugin(this.md);
    imgDescToAttrsPlugin(this.md);
    markdownErrorPlugin(this.md);
    blockTagsPlugin(this.md);
    cutPlugin(this.md);
    charTypographyPlugin(this.md);
    deflistPlugin(this.md);
  }

  parse(text) {
    return this.md.parse(text, this.env);
  }
  parseInline(text) {
    return this.md.parseInline(text, this.env);
  }

  render(text) {
    return this.md.renderer.render(this.parse(text), this.md.options, this.env);
  }

  renderInline(text) {
    let tokens = this.parseInline(text);
    let result = this.md.renderer.render(tokens, this.md.options, this.env);
    return result;
  }

  renderTokens(tokens) {
    return this.md.renderer.render(tokens, this.md.options, this.env);
  }

};
