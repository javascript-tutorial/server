const fs = require('fs');
const path = require('path');
const config = require('config');
const jade = require('jade');

/**
 * extension for require('file.jade'),
 * works in libs that are shared between client & server
 */
require.extensions['.jade'] = function(module, filename) {

  var compiled = jade.compile(
    fs.readFileSync(filename, 'utf-8'),
    Object.assign({}, config.jade, {
      pretty:        false,
      compileDebug:  false,
      filename:      filename
    })
  );

  module.exports = function(locals) {
    locals = locals || {};
    locals.bem = require('bemJade')();

    return compiled(locals);
  };

//  console.log("---------------> HERE", fs.readFileSync(filename, 'utf-8'), module.exports);

};

require('./filterMarkit');

require('./filterUglify');

module.exports = jade;
