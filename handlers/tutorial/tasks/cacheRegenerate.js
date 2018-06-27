'use strict';

const gulp = require('gulp');

const ArticleRenderer = require('../renderer/articleRenderer');
const TaskRenderer = require('../renderer/taskRenderer');
const co = require('co');

module.exports = function() {

  return function() {
    return co(function*() {
      await ArticleRenderer.regenerateCaches();
      await TaskRenderer.regenerateCaches();
    });

  };
};

