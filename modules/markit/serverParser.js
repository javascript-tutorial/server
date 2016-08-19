'use strict';

const config = require('config');
const MarkdownIt = require('markdown-it');
const loadSrcAsync = require('./loadSrcAsync');
const loadImgSizeAsync = require('./loadImgSizeAsync');
const dataUtil = require('lib/dataUtil');

const onlineOfflinePlugin = require('./plugins/onlineOffline');
const extendedCodePlugin = require('./plugins/extendedCode');
const outlinedBlocksPlugin = require('./plugins/outlinedBlocks');
const quotePlugin = require('./plugins/quote');
const summaryPlugin = require('./plugins/summary');
const comparePlugin = require('./plugins/compare');
const sourceBlocksPlugin = require('./plugins/sourceBlocks');


const imgDescToAttrsPlugin = require('./plugins/imgDescToAttrs');

// must be before imgFiguresPlugin that transforms img token to figure
// must be before plugins that rely on correct src
// (also resolves links)
const resolveRelativeSrcPlugin = require('./plugins/resolveRelativeSrc');

const resolveMdnSrcPlugin = require('./plugins/resolveMdnSrc');

const imgFiguresPlugin = require('./plugins/imgFigures');
const headerAnchorPlugin = require('./plugins/headerAnchor');
const headerLevelShiftPlugin = require('./plugins/headerLevelShift');
const markdownErrorPlugin = require('./plugins/markdownError');
const blockTagsPlugin = require('./plugins/blockTags/plugin');
const iframePlugin = require('./plugins/blockTags/iframe');
const editPlugin = require('./plugins/blockTags/edit');
const cutPlugin = require('./plugins/blockTags/cut');
const todoPlugin = require('./plugins/blockTags/todo');
const codeTabsPlugin = require('./plugins/blockTags/codetabs');
const demoPlugin = require('./plugins/blockTags/demo');
const charTypographyPlugin = require('./plugins/charTypography');
const stripTitle = require('./stripTitle');
const stripYamlMetadata = require('./stripYamlMetadata');
const deflistPlugin = require('markdown-it-deflist');

module.exports = class ServerParser {

  constructor(options) {
    this.options = options;

    this.env = options.env || {};
    this.md = new MarkdownIt(Object.assign({
      typographer:   true,
      blockTags:     ['iframe', 'edit', 'cut', 'codetabs', 'demo'].concat(require('./getPrismLanguage').allSupported),
      linkHeaderTag: true,
      html:          true,
      publicRoot:    config.publicRoot,
      staticHost:    config.server.staticHost,
      quotes:        config.lang == 'ru' ? '«»„“' : '“”‘’'
    }, options));

    onlineOfflinePlugin(this.md);
    quotePlugin(this.md);
    extendedCodePlugin(this.md);
    outlinedBlocksPlugin(this.md);
    sourceBlocksPlugin(this.md);
    imgDescToAttrsPlugin(this.md);
    resolveRelativeSrcPlugin(this.md);
    resolveMdnSrcPlugin(this.md);
    imgFiguresPlugin(this.md);
    headerAnchorPlugin(this.md);
    headerLevelShiftPlugin(this.md);
    markdownErrorPlugin(this.md);
    blockTagsPlugin(this.md);
    iframePlugin(this.md);
    editPlugin(this.md);
    cutPlugin(this.md);
    todoPlugin(this.md);
    codeTabsPlugin(this.md);
    demoPlugin(this.md);
    summaryPlugin(this.md);
    comparePlugin(this.md);
    charTypographyPlugin(this.md);
    deflistPlugin(this.md);
  }

  *parse(text) {
    const tokens = this.md.parse(text, this.env);
    yield* loadSrcAsync(tokens, this.md.options);
    yield* loadImgSizeAsync(tokens, this.md.options);

    return tokens;
  }

  render(tokens) {
    return this.md.renderer.render(tokens, this.md.options, this.env);
  }

};
