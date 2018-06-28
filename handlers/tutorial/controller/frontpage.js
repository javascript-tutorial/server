'use strict';

const Article = require('../models/article');
const TutorialTree = require('../models/tutorialTree');
const Task = require('../models/task');
const _ = require('lodash');
const ArticleRenderer = require('../renderer/articleRenderer');
const localStorage = require('localStorage').instance();
const t = require('i18n');

const LANG = require('config').lang;

t.requirePhrase('tutorial.frontpage', require('../locales/frontpage/' + LANG + '.yml'));

exports.get = async function (ctx, next) {

  ctx.locals.sitetoolbar = true;
  ctx.locals.siteToolbarCurrentSection = "tutorial";
  ctx.locals.title = t('tutorial.frontpage.modern_javascript_tutorial');

  let topArticles = await localStorage.getOrGenerate('tutorial:frontpage', renderTop);

  if (!topArticles.length) {
    ctx.throw(404, "Database is empty?"); // empty db
  }

  let chapters = data.contents.slice(0, 2).concat({
    title: "Additional articles",
    content: "List of extra topics that are not covered by first two parts of tutorial. There is no clear hierarchy here, you can access articles in the order you want.",
    children: data.contents.slice(2)
  });
  let locals = {
    chapters: TutorialTree.instance().tree,
    topArticles
  };


  console.log(locals);

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

  let articles = [];

  // render top-level content
  for (let slug of tree) {
    let article = TutorialTree.instance().bySlug(slug);

    let renderer = new ArticleRenderer();

    let rendered = await renderer.render(article);
    articles.push(rendered);
  }


  return articles;

}
