'use strict';

const Article = require('../models/article');
const TutorialTree = require('../models/tutorialTree');
const Task = require('../models/task');
const _ = require('lodash');
const ArticleRenderer = require('../renderer/articleRenderer');
const localStorage = require('localStorage').instance();
const t = require('i18n');

t.requirePhrase('tutorial', 'frontpage');


exports.get = async function (ctx, next) {

  ctx.locals.sitetoolbar = true;
  ctx.locals.siteToolbarCurrentSection = "tutorial";
  ctx.locals.title = t('tutorial.frontpage.modern_javascript_tutorial');

  let topArticlesRendered = await localStorage.getOrGenerate('tutorial:frontpage', renderTop);

  if (!Object.keys(topArticlesRendered).length) {
    ctx.throw(404, "Database is empty?"); // empty db
  }


  let locals = {
    tutorialTree: TutorialTree.instance(),
    topArticlesRendered
  };

  ctx.body = ctx.render('frontpage', locals);
};

// content
// metadata
// modified
// title
// isFolder
// prev
// next
// path
// siblings
async function renderTop() {
  const tree = TutorialTree.instance().tree;

  let articles = {};

  // render top-level content
  for (let slug of tree) {
    let article = TutorialTree.instance().bySlug(slug);

    let renderer = new ArticleRenderer();

    let rendered = await renderer.render(article);

    articles[slug] = rendered;
  }


  return articles;

}
