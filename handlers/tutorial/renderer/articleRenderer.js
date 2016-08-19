'use strict';

const _ = require('lodash');
const config = require('config');
const log = require('log')();
const Article = require('../models/article');
const TutorialParser = require('../lib/tutorialParser');

// Порядок библиотек на странице
// - встроенный CSS
// - библиотеки CSS
// - [head] (css, important short js w/o libs, js waits libs on DocumentContentLoaded)
// ...
// - встроенный JS
// - библиотеки JS

/**
 * Can render many articles, joining metadata
 * @constructor
 */
function ArticleRenderer() {
  this.libs = [];
  this.headCss = [];
  this.headJs = [];
  this.headHtml = [];

  // shared across all renderings
  // shared headingsMap to prevent same ids
  this.env = {};

  Object.defineProperties(this, {
    headers:{
      get() {
        throw new Error("Deprecated get headers");
      }
    },
    content:{
      get() {
        throw new Error("Deprecated get content");
      }
    }
  });
}

// gets <head> content from metadata.libs & metadata.head
ArticleRenderer.prototype.getHead = function() {
  return [].concat(
    this._libsToJsCss(
      this._unmapLibsNames(this.libs)
    ).css,
    this._libsToJsCss(
      this._unmapLibsNames(this.libs)
    ).js,
    this.headCss.length && `<style>${this.headCss.join('\n')}</style>`,
    this.headJs.length && `<script>${this.headJs.join('\n')}</script>`,
    this.headHtml.join('\n'))
    .filter(Boolean).join('\n');
};

// Все библиотеки должны быть уникальны
// Если один ресурс требует JQUERY и другой тоже, то нужно загрузить только один раз JQUERY
// Именно форматтер окончательно форматирует библиотеки, т.к. он знает про эти мапппинги
//
// Кроме того, парсер может распарсить много документов для сбора метаданных
ArticleRenderer.prototype._unmapLibsNames = function(libs) {
  var libsUnmapped = [];

  // заменить все-все короткие имена
  // предполагается, что короткое имя при раскрытии не содержит другого короткого имени (легко заимплементить)

  libs.forEach(function(lib) {
    switch (lib) {
    case 'lodash':
      libsUnmapped.push("https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.14.0/lodash.min.js");
      break;

    case 'd3':
      libsUnmapped.push("https://cdnjs.cloudflare.com/ajax/libs/d3/3.5.5/d3.min.js");
      break;

    case 'domtree':
      libsUnmapped.push("domtree.css", "domtree.js");
      break;

    default:
      libsUnmapped.push(lib);
    }
  });

  return libsUnmapped;
};


ArticleRenderer.prototype._libsToJsCss = function(libs) {
  var js = [];
  var css = [];

  _.uniq(libs).forEach(function(lib) {
    if (!~lib.indexOf('://')) {
      lib = '//' + config.domain.static + '/libs/' + lib;
    }

    if (lib.slice(-3) == '.js') {
      js.push('<script src="' + lib + '"></script>');
    } else if (lib.slice(-4) == '.css') {
      css.push("<link rel='stylesheet' href='" + lib + "'>");
    } else {
      js.push("<script> alert('Unknown extension for: '" + lib + "');</script>");
    }
  });

  return {
    js:  js,
    css: css
  };
};

/**
 * Render, gather metadata to the renderer object
 * @param article
 * @param options
 * options.headerLevelShift shifts all headers (to render in ebook as a subchapter0
 * @returns {{content: *, headers: *, head: *}}
 */
ArticleRenderer.prototype.render = function* (article, options) {

  options = Object.assign({
    resourceWebRoot: article.getResourceWebRoot(),
    env: this.env
  }, options || {});

  if (options.linkHeaderTag === undefined) options.linkHeaderTag = true;

  let parser = new TutorialParser(options);

  const tokens = yield* parser.parse(article.content);

  let headers = [];

  for (let idx = 0; idx < tokens.length; idx++) {
    let token = tokens[idx];
    if (token.type == 'heading_open') {
      let i = idx + 1;
      while (tokens[i].type != 'heading_close') i++;

      let headingTokens = tokens.slice(idx + 1, i);

      headers.push({
        level: +token.tag.slice(1),
        anchor: token.anchor,
        title: parser.render(headingTokens)
      });

      idx = i;
    }

  }

  let content = parser.render(tokens);

  for (var i = 0; i < article.libs.length; i++) {
    this.libs.push(article.libs[i]);
  }

  if (article.headCss) {
    this.headCss.push(article.headCss);
  }
  if (article.headJs) {
    this.headJs.push(article.headJs);
  }
  if (article.headHtml) {
    this.headHtml.push(article.headHtml);
  }


  return {
    content: content,
    headers: headers,
    head:    this.getHead()
  };
};

/**
 * Render with cache
 * @param article
 * @param options Add refreshCache: true not to use the cached value
 * @returns {*}
 */
ArticleRenderer.prototype.renderWithCache = function*(article, options) {
  options = options || {};

  var useCache = !options.refreshCache && !process.env.TUTORIAL_EDIT;

  if (article.rendered && useCache) return article.rendered;

  var rendered = yield* this.render(article);

  article.rendered = rendered;

  yield article.persist();

  return rendered;
};


ArticleRenderer.regenerateCaches = function*() {
  var articles = yield Article.find({}).exec();

  for (var i = 0; i < articles.length; i++) {
    var article = articles[i];
    log.debug("regenerate article", article._id);
    yield* (new ArticleRenderer()).renderWithCache(article, {refreshCache: true});
  }
};


module.exports = ArticleRenderer;
