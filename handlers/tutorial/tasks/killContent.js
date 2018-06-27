'use strict';

var co = require('co');
var Article = require('../models/article');
var Task = require('../models/task');
const ArticleRenderer = require('../renderer/articleRenderer');
const TaskRenderer = require('../renderer/taskRenderer');

module.exports = function() {

  return function() {

    return co(function*() {

      await killArticles();
      await killTasks();

      await renderTasks();
      await renderArticles();
      console.log("DONE");
    });
  };

};

function* killArticles() {

  var articles = await Article.find({});

  for (var i = 0; i < articles.length; i++) {
    var article = articles[i];

    article.content = '# ' + article.title + '\n\n## Article ' + article.weight + '\n\nText';

    await article.persist();

  }

}

function* renderArticles() {

  var articles = await Article.find({});

  for (var i = 0; i < articles.length; i++) {
    var article = articles[i];

    var renderer = new ArticleRenderer();

    await renderer.renderWithCache(article, {refreshCache: true});

    await article.persist();

  }

}


function* renderTasks() {

  var tasks = await Task.find({});

  for (var i = 0; i < tasks.length; i++) {
    var task = tasks[i];

    var renderer = new TaskRenderer();

    await renderer.renderWithCache(task, {refreshCache: true});

    await task.persist();

  }

}

function* killTasks() {

  var tasks = await Task.find({});

  for (var i = 0; i < tasks.length; i++) {
    var task = tasks[i];

    task.content =  '# ' + task.title + '\n\nTask content ' + task.weight;
    task.solution = 'Task solution ' + task.weight;

    await task.persist();
  }

}