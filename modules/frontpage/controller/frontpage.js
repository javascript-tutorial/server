
const Article = require('engine/koa/tutorial').Article;
const TutorialTree = require('engine/koa/tutorial').TutorialTree;
const Task = require('engine/koa/tutorial').Task;
const _ = require('lodash');
const ArticleRenderer = require('engine/koa/tutorial').ArticleRenderer;
const localStorage = require('engine/local-storage').instance();
const t = require('engine/i18n');

t.requirePhrase('frontpage');

exports.get = async function (ctx, next) {

  ctx.locals.sitetoolbar = true;
  ctx.locals.siteToolbarCurrentSection = "tutorial";
  ctx.locals.title = t('frontpage.modern_javascript_tutorial');

  let topArticlesRendered = await localStorage.getOrGenerate('frontpage', renderTop, process.env.TUTORIAL_EDIT);

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
  const roots = TutorialTree.instance().roots;

  let articles = {};

  // render top-level content
  for (let slug of roots) {
    let article = TutorialTree.instance().bySlug(slug);

    let renderer = new ArticleRenderer();

    let rendered = await renderer.render(article);

    articles[slug] = rendered;
  }


  return articles;

}
