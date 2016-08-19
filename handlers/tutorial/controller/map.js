'use strict';

const mongoose = require('mongoose');
const Article = require('../models/article');
const Task = require('../models/task');
const ArticleRenderer = require('../renderer/articleRenderer');
const TaskRenderer = require('../renderer/taskRenderer');
const _ = require('lodash');
const CacheEntry = require('cache').CacheEntry;
const makeAnchor = require('textUtil/makeAnchor');

exports.get = function *get(next) {

  var renderedMap = yield CacheEntry.getOrGenerate({
    key:  'map:rendered',
    tags: ['article']
  }, renderMap);

  var locals = {
    children: renderedMap
  };

  var template = this.get('X-Requested-With') ? '_map' : 'map';

  this.body = this.render(template, locals);
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
function* renderMap() {

  const tree = yield* Article.findTree();

  function* renderTree(tree) {
    var children = [];

    for (var i = 0; i < tree.children.length; i++) {
      var child = tree.children[i];

      var childRendered = {
        url:   Article.getUrlBySlug(child.slug),
        title: child.title
      };

      if (child.isFolder) {
        childRendered.children = yield* renderTree(child);
      }

      var tasks = yield Task.find({
        parent: child._id
      }).sort({weight: 1}).select('-_id slug title importance').lean().exec();

      tasks = tasks.map(function(task) {
        task.url = Task.getUrlBySlug(task.slug);
        delete task.slug;
        task.anchor = childRendered.url + '#' + makeAnchor(task.title);
        return task;
      });

      childRendered.tasks = tasks;
      children.push(childRendered);

    }
    return children;
  }

  var treeRendered = yield* renderTree(tree);


  return [
    treeRendered[0],
    treeRendered[1],
    {
      url:      '#',
      title:    'Дополнительно',
      children: treeRendered.slice(2)
    }
  ];

}


