'use strict';

var co = require('co');
var Article = require('../models/article');
var Task = require('../models/task');
const ArticleRenderer = require('../renderer/articleRenderer');
const TaskRenderer = require('../renderer/taskRenderer');

module.exports = function() {

  return function() {

    return co(function*() {

      yield* killArticles();
      yield* killTasks();

      yield* renderTasks();
      yield* renderArticles();
      console.log("DONE");
    });
  };

};

function* killArticles() {

  var articles = yield Article.find({}).exec();

  for (var i = 0; i < articles.length; i++) {
    var article = articles[i];

    article.content = '# ' + article.title + '\n\n## Article ' + article.weight + '\n\nText';

    yield article.persist();

  }

}

function* renderArticles() {

  var articles = yield Article.find({}).exec();

  for (var i = 0; i < articles.length; i++) {
    var article = articles[i];

    var renderer = new ArticleRenderer();

    yield* renderer.renderWithCache(article, {refreshCache: true});

    yield article.persist();

  }

}


function* renderTasks() {

  var tasks = yield Task.find({}).exec();

  for (var i = 0; i < tasks.length; i++) {
    var task = tasks[i];

    var renderer = new TaskRenderer();

    yield* renderer.renderWithCache(task, {refreshCache: true});

    yield task.persist();

  }

}

function* killTasks() {

  var tasks = yield Task.find({}).exec();

  for (var i = 0; i < tasks.length; i++) {
    var task = tasks[i];

    task.content =  '# ' + task.title + '\n\nTask content ' + task.weight;
    task.solution = 'Task solution ' + task.weight;

    yield task.persist();
  }

}