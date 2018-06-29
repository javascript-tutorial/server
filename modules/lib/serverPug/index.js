const fs = require('fs');
const path = require('path');
const config = require('config');
const pug = require('pug');

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
        resolve
      }]
    })
  );

  function resolve(filename, source, loadOptions) {
    if (filename[0] === '/') {
      return path.join(loadOptions.basedir, filename);
    }
    if (filename[0] === '~') {
      return require.resolve(filename.slice(1));
    }

    return path.join(path.dirname(source), filename);
  }

  module.exports = function(locals) {
    locals = locals || {};

    return compiled(locals);
  };

//  console.log("---------------> HERE", fs.readFileSync(filename, 'utf-8'), module.exports);

};

require('./filterMarkit');

require('./filterUglify');

module.exports = pug;
