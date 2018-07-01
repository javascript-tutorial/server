'use strict';

let Router = require('koa-router');

let task = require('./controller/task');
let article = require('./controller/article');
let frontpage = require('./controller/frontpage');
let zipview = require('./controller/zipview');

let router = module.exports = new Router();

router.get('/task/:slug', task.get);
router.get('/tutorial/zipview/:name', zipview.get);
router.get('/', frontpage.get);
router.get('/tutorial', function*() {
  this.status = 301;
  this.redirect('/');
});

router.get('/:slug', article.get);
