var Router = require('koa-router');
var mongoose = require('mongoose');
var CacheEntry = require('./models/cacheEntry');

var router = module.exports = new Router();
