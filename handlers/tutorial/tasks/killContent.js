'use strict';

let co = require('co');
let Article = require('../models/article');
let Task = require('../models/task');
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

  let articles = await Article.find({});

  for (let i = 0; i < articles.length; i++) {
    let article = articles[i];

    article.content = '# ' + article.title + '\n\n## Article ' + article.weight + '\n\nText';

    await article.persist();

  }

}

function* renderArticles() {

  let articles = await Article.find({});

  for (let i = 0; i < articles.length; i++) {
    let article = articles[i];

    let renderer = new ArticleRenderer();

    await renderer.renderWithCache(article, {refreshCache: true});

    await article.persist();

  }

}


function* renderTasks() {

  let tasks = await Task.find({});

  for (let i = 0; i < tasks.length; i++) {
    let task = tasks[i];

    let renderer = new TaskRenderer();

    await renderer.renderWithCache(task, {refreshCache: true});

    await task.persist();

  }

}

function* killTasks() {

  let tasks = await Task.find({});

  for (let i = 0; i < tasks.length; i++) {
    let task = tasks[i];

    task.content =  '# ' + task.title + '\n\nTask content ' + task.weight;
    task.solution = 'Task solution ' + task.weight;

    await task.persist();
  }

}