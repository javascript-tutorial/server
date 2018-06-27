'use strict';

let Router = require('koa-router');

let node = require('./controller/node');

let router = module.exports = new Router();

router.all('/task/:slug/:view/:serverPath*', node.all);
router.all('/article/:slug/:view/:serverPath*', node.all);

