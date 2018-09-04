
const Article = require('jsengine/koa/tutorial').Article;
const TutorialTree = require('jsengine/koa/tutorial').TutorialTree;
const Task = require('jsengine/koa/tutorial').Task;
const _ = require('lodash');
const ArticleRenderer = require('jsengine/koa/tutorial').ArticleRenderer;
const localStorage = require('jsengine/local-storage').instance();
const t = require('jsengine/i18n');

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
