'use strict';

const path = require('path');
const fs = require('fs');

let handlerNames = [
  'engine/koa/static',
  'engine/koa/requestId',
  'engine/koa/requestLog',
  'engine/koa/nocache',

  // this middleware adds this.render method
  // it is *before error*, because errors need this.render
  'render',

  // errors wrap everything
  'engine/koa/error',

  // this logger only logs HTTP status and URL
  // before everything to make sure it log all
  'engine/koa/accessLogger',

  // pure node.js examples from tutorial
  // before session
  // before form parsing, csrf checking or whatever, bare node
  'engine/koa/nodeExample',

  // before anything that may deal with body
  // it parses JSON & URLENCODED FORMS,
  // it does not parse form/multipart
  'engine/koa/bodyParser',

  // parse FORM/MULTIPART
  // (many tweaks possible, lets the middleware decide how to parse it)
  'engine/koa/multipartParser',

  // right after parsing body, make sure we logged for development
  'engine/koa/verboseLogger',

  'engine/koa/conditional',

  process.env.NODE_ENV === 'development' && 'dev',
  'engine/koa/tutorial',
  'frontpage'
].filter(Boolean);

let handlers = {};

for (const name of handlerNames) {
  let handlerPath = require.resolve(name);
  if (handlerPath.endsWith('index.js')) {
    handlerPath = path.dirname(handlerPath);
  }
  handlers[name] = {
    path: handlerPath
  }
}


module.exports = handlers;
