'use strict';

const ArticleRenderer = require('../renderer/articleRenderer');
const TaskRenderer = require('../renderer/taskRenderer');

module.exports = function() {

  return function() {
    return async function() {
      await ArticleRenderer.regenerateCaches();
      await TaskRenderer.regenerateCaches();
    }();

  };
};

