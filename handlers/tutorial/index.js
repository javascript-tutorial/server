'use strict';

const mountHandlerMiddleware = require('lib/mountHandlerMiddleware');

const t = require('i18n');

const LANG = require('config').lang;

t.requirePhrase('tutorial.article', require('./locales/article/' + LANG + '.yml'));
t.requirePhrase('tutorial.task', require('./locales/task/' + LANG + '.yml'));


exports.init = function(app) {
  app.use(mountHandlerMiddleware('/', __dirname));
};

exports.Article = require('./models/article');
exports.Task = require('./models/task');

exports.TaskRenderer = require('./renderer/taskRenderer');
exports.ArticleRenderer = require('./renderer/articleRenderer');
