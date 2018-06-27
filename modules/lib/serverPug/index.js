const fs = require('fs');
const path = require('path');
const config = require('config');
const pug = require('pug');

/**
 * extension for require('file.jade'),
 * works in libs that are shared between client & server
 */
require.extensions['.pug'] = function(module, filename) {

  var compiled = pug.compile(
    fs.readFileSync(filename, 'utf-8'),
    Object.assign({}, config.pug, {
      pretty:        false,
      compileDebug:  false,
      filename:      filename
    })
  );

  module.exports = function(locals) {
    locals = locals || {};
    locals.bem = require('bemPug')();

    return compiled(locals);
  };

//  console.log("---------------> HERE", fs.readFileSync(filename, 'utf-8'), module.exports);

};

require('./filterMarkit');

require('./filterUglify');

module.exports = pug;
