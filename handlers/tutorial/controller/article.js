'use strict';

const TutorialTree = require('../models/tutorialTree');
const Article = require('../models/article');
const Task = require('../models/task');
const ArticleRenderer = require('../renderer/articleRenderer');
const TaskRenderer = require('../renderer/taskRenderer');
const _ = require('lodash');
const makeAnchor = require('textUtil/makeAnchor');
const t = require('i18n');
const localStorage = require('localStorage').instance();

exports.get = async function(ctx, next) {

  let renderedArticle = await localStorage.getOrGenerate(
    'tutorial:article:' + ctx.params.slug, 
    () => renderArticle(ctx),
    process.env.TUTORIAL_EDIT
  );

  if (!renderedArticle) {
    await next();
    return;
  }

  let locals = renderedArticle;

  locals.sitetoolbar = true;

  locals.githubLink = renderedArticle.githubLink;
  locals.siteToolbarCurrentSection = "tutorial";

  if (!renderedArticle.isFolder) {
    locals.comments = true;
  }

  let sections = [];
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

    let headerLinks = renderedArticle.headers
      .filter(function(header) {
        // [level, titleHtml, anchor]
        return header.level === 2;
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

    let section2 = {
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
      title: t('locales.comments'),
      url:   '#comments'
    });

    sections.push(section2);

  }

  locals.sidebar = {
    sections: sections
  };

  ctx.body = ctx.render(renderedArticle.isFolder ? "folder" : "article", locals);

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
async function renderArticle(ctx) {

  let slug = ctx.params.slug;

  const tree = TutorialTree.instance();

  const article = tree.bySlug(slug);

  // console.log("HERE", slug, article);

  if (!article || !(article instanceof Article)) {
    return null;
  }

  ctx.log.debug("article", article);
  
  let renderer = new ArticleRenderer();

  let rendered = await renderer.render(article);

  // ctx.log.debug("rendered");

  rendered.isFolder = article.isFolder;
  rendered.modified = article.modified;
  rendered.title = article.title;
  rendered.isFolder = article.isFolder;
  rendered.weight = article.weight;
  rendered.githubLink = article.githubLink;
  rendered.canonicalPath = article.getUrl();

  await renderProgress();

  await renderPrevNext();
  await renderBreadCrumb();
  await renderSiblings();
  await renderChildren();

  if (!article.isFolder) {
    await renderTasks();
  }


  // strip / and /tutorial
  rendered.level = rendered.breadcrumbs.length - 2; // starts at 0

  if (article.isFolder) {
    // levelMax is 2 for deep courses or 1 for plain courses

    rendered.levelMax = rendered.level + 1;
    if (article.children.length && tree.bySlug(article.children[0]).isFolder) {
      rendered.levelMax++;
    }
  }


  async function renderPrevNext() {

    let prev = tree.getPrev(article.slug);

    if (prev) {
      prev = tree.bySlug(prev);
      rendered.prev = {
        url:   prev.getUrl(),
        title: prev.title
      };
    }

    let next = tree.getNext(article.slug);
    if (next) {
      next = tree.bySlug(next);
      rendered.next = {
        url:   next.getUrl(),
        title: next.title
      };
    }
  }



  async function renderProgress() {
    let parent = article;
    while (parent.parent) {
      parent = tree.bySlug(parent.parent);
    }

    let bookRoot = parent;
    // now bookroot is 1st level tree item, book root, let's count items in it

    //console.log(bookRoot);

    let bookLeafCount = 0;
    let bookChildNumber;
    function countChildren(article) {
      if (tree === article) {
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

  async function renderBreadCrumb() {
    let path = [];
    let parent = article.parent;
    while (parent) {
      let a = tree.bySlug(parent);
      path.push({
        title: a.title,
        url:   a.getUrl()
      });
      parent = a.parent;
    }
    path.push({
      title: t('locales.tutorial'),
      url: '/'
    });
    path = path.reverse();

    rendered.breadcrumbs = path;
  }

  async function renderSiblings() {
    let siblings = tree.getSiblings(article.slug);
    rendered.siblings = siblings.map(slug => {
      let sibling = tree.bySlug(slug);
      return {
        title: sibling.title,
        url:   sibling.getUrl()
      };
    });
  }

  async function renderChildren() {
    if (!article.isFolder) return;
    let children = article.children || [];
    rendered.children = children.map(slug => {
      let child = tree.bySlug(slug);
      let renderedChild = {
        title: child.title,
        url:   child.getUrl(),
        weight: child.weight
      };

      if (child.isFolder) {
        renderedChild.children = (child.children || []).map((slug) => {
          let subChild = tree.bySlug(slug);
          return {
            title: subChild.title,
            url:   subChild.getUrl(),
            weight: subChild.weight
          };
        });
      }

      return renderedChild;
    });
  }

  async function renderTasks() {
    let tasks = article.children.map(slug => {
      return tree.bySlug(slug);
    });

    const taskRenderer = new TaskRenderer();

    rendered.tasks = [];

    for (let task of tasks) {
      let taskRendered = await taskRenderer.render(task);
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

