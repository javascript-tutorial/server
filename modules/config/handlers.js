'use strict';

const path = require('path');
const fs = require('fs');

var handlers = [
  'static',
  'mongooseHandler',
  'requestId',
  'requestLog',
  'nocache',
  // this middleware adds this.render method
  // it is *before errorHandler*, because errors need this.render
  'render',

  // errors wrap everything
  'errorHandler',

  // this logger only logs HTTP status and URL
  // before everything to make sure it log all
  'accessLogger',

  // pure node.js examples from tutorial
  // before session
  // before form parsing, csrf checking or whatever, bare node
  'nodeExample',

  // before anything that may deal with body
  // it parses JSON & URLENCODED FORMS,
  // it does not parse form/multipart
  'bodyParser',

  // parse FORM/MULTIPART
  // (many tweaks possible, lets the middleware decide how to parse it)
  'multipartParser',

  // right after parsing body, make sure we logged for development
  'verboseLogger',

  'conditional',

  'tutorial',
  'jobs'
];

module.exports = handlers;
