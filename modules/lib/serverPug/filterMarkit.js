'use strict';

let filters = require('pug').filters;

let BasicParser = require('markit').BasicParser;

filters.markit = function(html) {
  let parser = new BasicParser({
    html: true
  });

  return parser.render(html);
};

