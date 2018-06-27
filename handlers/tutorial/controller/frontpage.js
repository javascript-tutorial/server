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

exports.get = async function(ctx, next) {

  ctx.locals.sitetoolbar = true;
  ctx.locals.siteToolbarCurrentSection = "tutorial";
  ctx.locals.title = t('tutorial.frontpage.modern_javascript_tutorial');

  let tutorial = await localStorage.getOrGenerate('tutorial:frontpage', renderTutorial);

  if (!tutorial.length) {
    ctx.throw(404, "Database is empty?"); // empty db
  }

  let locals = {
    chapters: tutorial
  };

  ctx.body = ctx.render('frontpage', locals);
};
/*
// content
// metadata
// modified
// title
// isFolder
// prev
// next
// path
// siblings
async function renderTutorial() {
  const tree = await Article.findTree();

  let treeRendered = await renderTree(tree);

  // render top-level content
  for (let i = 0; i < treeRendered.length; i++) {
    let child = treeRendered[i];
    await populateContent(child);
  }


  return treeRendered;

}


function* renderTree(tree) {
  let children = [];

  for (let i = 0; i < tree.children.length; i++) {
    let child = tree.children[i];

    let childRendered = {
      id: child._id,
      url:   Article.getUrlBySlug(child.slug),
      title: child.title
    };

    if (child.isFolder) {
      childRendered.children = await renderTree(child);
    }

    children.push(childRendered);

  }
  return children;
}


function* populateContent(articleObj) {
  let article = await Article.findById(articleObj.id);

  let renderer = new ArticleRenderer();

  let rendered = await renderer.renderWithCache(article);

  articleObj.content = rendered.content;
}
*/