'use strict';

let path = require('path');
let url = require('url');
let fs = require('mz/fs');
let config = require('config');
let util = require('util');

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
  let serverPath = clean(ctx.params.serverPath);
  let slug = clean(ctx.params.slug);
  let view = clean(ctx.params.view);
  let taskOrArticle = ctx.url.match(/\w+/)[0];

  let modulePath = path.join(config.publicRoot, taskOrArticle, slug, view, 'server.js');

  ctx.log.debug("trying modulePath", modulePath);

  if (await fs.exists(modulePath)) {

    let server = require(modulePath);

    ctx.req.url = "/" + serverPath;

    let originalUrl = ctx.request.originalUrl;
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

