'use strict';

var path = require('path');
var url = require('url');
var fs = require('mz/fs');
var config = require('config');
var util = require('util');

function clean(pathOrPiece) {
  pathOrPiece = pathOrPiece.replace(/[^\/.a-z0-9_-]/gim, '');

  // .. -> .
  pathOrPiece = pathOrPiece.replace(/\.+/g, '.');

  //  //// -> /
  pathOrPiece = pathOrPiece.replace(/\/+/g, '/');

  return pathOrPiece;
}


exports.all = async function(ctx) {

  // bad path: http://javascript.local/task/capslock-warning-field/solution
  if (ctx.params.serverPath === undefined) {
    ctx.throw(404);
  }

  // for /article/ajax-xmlhttprequest/xhr/test: xhr/test
  var serverPath = clean(ctx.params.serverPath);
  var slug = clean(ctx.params.slug);
  var view = clean(ctx.params.view);
  var taskOrArticle = ctx.url.match(/\w+/)[0];

  var modulePath = path.join(config.publicRoot, taskOrArticle, slug, view, 'server.js');

  ctx.log.debug("trying modulePath", modulePath);

  if (await fs.exists(modulePath)) {

    var server = require(modulePath);

    ctx.req.url = "/" + serverPath;

    var originalUrl = ctx.request.originalUrl;
    if (~originalUrl.indexOf('?')) {
      ctx.req.url += originalUrl.slice(originalUrl.indexOf('?'));
    }

    ctx.res.statusCode = 200; // reset default koa 404 assignment
    ctx.log.debug("passing control to modulePath server, url=", ctx.req.url);
    ctx.respond = false;
    server.accept(ctx.req, ctx.res);
  } else {
    ctx.throw(404);
  }

};

