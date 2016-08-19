'use strict';

var Router = require('koa-router');

var node = require('./controller/node');

var router = module.exports = new Router();

router.all('/task/:slug/:view/:serverPath*', node.all);
router.all('/article/:slug/:view/:serverPath*', node.all);

