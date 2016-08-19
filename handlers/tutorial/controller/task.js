"use strict";

const mongoose = require('mongoose');
const Task = require('../models/task');
const Article = require('../models/article');
const TaskRenderer = require('../renderer/taskRenderer');

exports.get = function *get(next) {

  const task = yield Task.findOne({
    slug: this.params.slug
  }).populate('parent');

  if (!task) {
    yield* next;
    return;
  }

  const renderer = new TaskRenderer();

  const rendered = yield* renderer.renderWithCache(task);


  this.locals.githubLink = task.githubLink;

  var breadcrumbs = [];

  var parentId = task.parent._id;
  while (true) {
    let parent = yield Article.findById(parentId, {slug: 1, title: 1, parent: 1}).exec();
    if (!parent) break;
    breadcrumbs.push({
      url:   parent.getUrl(),
      title: parent.title
    });
    parentId = parent.parent;
  }
  breadcrumbs.push({
    title: 'Учебник',
    url:   '/'
  });
  /*
   breadcrumbs.push({
   title: 'JavaScript.ru',
   url: 'http://javascript.ru'
   });
   */

  this.locals.breadcrumbs = breadcrumbs.reverse();

  this.locals.siteToolbarCurrentSection = "tutorial";

  // No support for task.libs & head just yet (not needed?)
  this.locals.title = task.title;

  this.locals.task = {
    title:      task.title,
    importance: task.importance,
    content:    rendered.content,
    solution:   rendered.solution
  };

  this.locals.articleUrl = task.parent.getUrl();

  this.body = this.render("task");
};

