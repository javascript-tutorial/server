const fs = require('fs');
const path = require('path');
const config = require('config');
const pug = require('pug');
const pugResolve = require('pugResolve');

/**
 * extension for require('file.pug'),
 * works in libs that are shared between client & server
 */
require.extensions['.pug'] = function(module, filename) {

  let compiled = pug.compile(
    fs.readFileSync(filename, 'utf-8'),
    Object.assign({}, config.pug, {
      pretty:        false,
      compileDebug:  false,
      filename:      filename,
      plugins: [{
        resolve: pugResolve
      }]
    })
  );


  module.exports = function(locals) {
    locals = locals || {};

    return compiled(locals);
  };

//  console.log("---------------> HERE", fs.readFileSync(filename, 'utf-8'), module.exports);

};

require('./filterMarkit');

require('./filterUglify');

module.exports = pug;
