'use strict';

const mongoose = require('mongoose');
const Article = require('../models/article');
const Task = require('../models/task');
const ArticleRenderer = require('../renderer/articleRenderer');
const TaskRenderer = require('../renderer/taskRenderer');
const _ = require('lodash');
const CacheEntry = require('cache').CacheEntry;
const makeAnchor = require('textUtil/makeAnchor');
const t = require('i18n');

exports.get = function *get(next) {


  var renderedArticle = yield* CacheEntry.getOrGenerate({
    key:  'tutorial:article:' + this.params.slug,
    tags: ['article']
  }, renderArticle.bind(this, this.params.slug), process.env.TUTORIAL_EDIT);

  if (!renderedArticle) {
    yield* next;
    return;
  }

  var locals = renderedArticle;

  locals.sitetoolbar = true;

  locals.githubLink = renderedArticle.githubLink;
  locals.siteToolbarCurrentSection = "tutorial";

  if (!renderedArticle.isFolder) {
    locals.comments = true;
  }

  var sections = [];
  if (renderedArticle.isFolder) {

    sections.push({
      title: t('tutorial.article.sibling_chapters'),
      links: renderedArticle.siblings
    });

  } else {

    sections.push({
      title: t('tutorial.article.chapter'),
      links: [renderedArticle.breadcrumbs[renderedArticle.breadcrumbs.length-1]]
    });

    var headerLinks = renderedArticle.headers
      .filter(function(header) {
        // [level, titleHtml, anchor]
        return header.level == 2;
      }).map(function(header) {
        return {
          title: header.title,
          url:   '#' + header.anchor
        };
      });

    if (headerLinks.length) {
      sections.push({
        title: t('tutorial.article.lesson_navigation'),
        links: headerLinks
      });
    }

  }

  if (!renderedArticle.isFolder) {

    var section2 = {
      class: '_separator_before',
      links: []
    };

    if (renderedArticle.tasks.length) {
      section2.links.push({
        title: t('tutorial.article.tasks') + ' (' + renderedArticle.tasks.length + ')',
        url: '#tasks'
      });
    }

    section2.links.push({
      title: t('site.comments'),
      url:   '#comments'
    });

    sections.push(section2);

  }

  locals.sidebar = {
    class: "sidebar_sticky-footer",
    sections: sections
  };

  this.body = this.render(renderedArticle.isFolder ? "folder" : "article", locals);

};

// body
// metadata
// modified
// title
// isFolder
// prev
// next
// path
// siblings
function* renderArticle(slug) {

  const article = yield Article.findOne({ slug: slug }).exec();
  if (!article) {
    return null;
  }

  this.log.debug("article", article._id);


  var renderer = new ArticleRenderer();

  var rendered = yield* renderer.renderWithCache(article);

  this.log.debug("rendered");

  rendered.isFolder = article.isFolder;
  rendered.modified = article.modified;
  rendered.title = article.title;
  rendered.isFolder = article.isFolder;
  rendered.weight = article.weight;
  rendered.githubLink = article.githubLink;
  rendered.canonicalPath = article.getUrl();

  const tree = yield* Article.findTree();
  const articleInTree = tree.byId(article._id);

  yield* renderProgress();
  yield* renderPrevNext();
  yield* renderBreadCrumb();
  yield* renderSiblings();
  yield* renderChildren();
  yield* renderTasks();


  // strip / and /tutorial
  rendered.level = rendered.breadcrumbs.length - 2; // starts at 0

  if (articleInTree.isFolder) {
    // levelMax is 2 for deep courses or 1 for plain courses
    rendered.levelMax = articleInTree.children[0].isFolder ? rendered.level + 2 : rendered.level + 1;
  }


  function* renderPrevNext() {

    var prev = tree.byId(articleInTree.prev);

    if (prev) {
      rendered.prev = {
        url:   Article.getUrlBySlug(prev.slug),
        title: prev.title
      };
    }

    var next = tree.byId(articleInTree.next);
    if (next) {
      rendered.next = {
        url:   Article.getUrlBySlug(next.slug),
        title: next.title
      };
    }
  }

  function* renderProgress() {
    var parent = articleInTree.parent;
    var bookRoot = articleInTree;
    while (parent) {
      bookRoot = tree.byId(parent);
      parent = bookRoot.parent;
    }

    // now bookroot is 1st level tree item, book root, let's count items in it

    //console.log(bookRoot);

    var bookLeafCount = 0;
    var bookChildNumber;
    function countChildren(tree) {
      if (tree == articleInTree) {
        bookChildNumber = bookLeafCount + 1;
      }

      if (!tree.children) {
        bookLeafCount++;
      } else {
        tree.children.forEach(countChildren);
      }
    }

    countChildren(bookRoot);

    if (!(bookChildNumber == 1 && rendered.isFolder)) {
      // not on top level first chapters
      rendered.bookLeafCount = bookLeafCount;
      rendered.bookChildNumber = bookChildNumber;
    }

    //console.log(bookLeafCount, bookChildNumber);
  }

  function* renderBreadCrumb() {
    var path = [];
    var parent = articleInTree.parent;
    while (parent) {
      var a = tree.byId(parent);
      path.push({
        title: a.title,
        url:   Article.getUrlBySlug(a.slug)
      });
      parent = a.parent;
    }
    path.push({
      title: 'Учебник',
      url: '/'
    });
    /*
    path.push({
      title: 'JavaScript.ru',
      url: 'http://javascript.ru'
    });
    */
    path = path.reverse();

    rendered.breadcrumbs = path;
  }

  function* renderSiblings() {
    var siblings = tree.siblings(articleInTree._id);
    rendered.siblings = siblings.map(function(sibling) {
      return {
        title: sibling.title,
        url:   Article.getUrlBySlug(sibling.slug)
      };
    });
  }

  function* renderChildren() {
    if (!articleInTree.isFolder) return;
    var children = articleInTree.children || [];
    rendered.children = children.map(function(child) {
      var renderedChild = {
        title: child.title,
        url:   Article.getUrlBySlug(child.slug),
        weight: child.weight
      };

      if (child.isFolder) {
        renderedChild.children = (child.children || []).map(function(subChild) {
          return {
            title: subChild.title,
            url:   Article.getUrlBySlug(subChild.slug),
            weight: child.weight
          };
        });
      }

      return renderedChild;
    });
  }

  function *renderTasks() {
    var tasks = yield Task.find({
      parent: article._id
    }).sort({weight: 1}).exec();

    const taskRenderer = new TaskRenderer();


    rendered.tasks = [];

    for (var i = 0; i < tasks.length; i++) {
      var task = tasks[i];

      var taskRendered = yield* taskRenderer.renderWithCache(task);
      rendered.tasks.push({
        url: task.getUrl(),
        title: task.title,
        anchor: makeAnchor(task.title),
        importance: task.importance,
        content: taskRendered.content,
        solution: taskRendered.solution
      });

    }

  }

  return rendered;

}

