'use strict';

const Article = require('../models/article');
const Task = require('../models/task');
const _ = require('lodash');
const ArticleRenderer = require('../renderer/articleRenderer');

exports.get = function *get(next) {

  this.locals.sitetoolbar = true;
  this.locals.siteToolbarCurrentSection = "tutorial";
  this.locals.title = "Современный учебник JavaScript";


  var tutorial = await CacheEntry.getOrGenerate({
    key:  'tutorial:frontpage',
    tags: ['article']
  }, renderTutorial);

  if (!tutorial.length) {
    this.throw(404, "Database is empty?"); // empty db
  }

  var locals = {
    chapters: tutorial
  };

  this.body = this.render('frontpage', locals);
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
function* renderTutorial() {
  const tree = await Article.findTree();

  var treeRendered = await renderTree(tree);

  // render top-level content
  for (var i = 0; i < treeRendered.length; i++) {
    var child = treeRendered[i];
    await populateContent(child);
  }


  return treeRendered;

}


function* renderTree(tree) {
  var children = [];

  for (var i = 0; i < tree.children.length; i++) {
    var child = tree.children[i];

    var childRendered = {
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
  var article = await Article.findById(articleObj.id);

  var renderer = new ArticleRenderer();

  var rendered = await renderer.renderWithCache(article);

  articleObj.content = rendered.content;
}
