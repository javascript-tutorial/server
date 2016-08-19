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


exports.all = function*() {

  // bad path: http://javascript.in/task/capslock-warning-field/solution
  if (this.params.serverPath === undefined) {
    this.throw(404);
  }

  // for /article/ajax-xmlhttprequest/xhr/test: xhr/test
  var serverPath = clean(this.params.serverPath);
  var slug = clean(this.params.slug);
  var view = clean(this.params.view);
  var taskOrArticle = this.url.match(/\w+/)[0];

  var modulePath = path.join(config.publicRoot, taskOrArticle, slug, view, 'server.js');

  this.log.debug("trying modulePath", modulePath);

  if (yield fs.exists(modulePath)) {

    var server = require(modulePath);

    this.req.url = "/" + serverPath;

    var originalUrl = this.request.originalUrl;
    if (~originalUrl.indexOf('?')) {
      this.req.url += originalUrl.slice(originalUrl.indexOf('?'));
    }

    this.res.statusCode = 200; // reset default koa 404 assignment
    this.log.debug("passing control to modulePath server, url=", this.req.url);
    this.respond = false;
    server.accept(this.req, this.res);
  } else {
    this.throw(404);
  }

};

