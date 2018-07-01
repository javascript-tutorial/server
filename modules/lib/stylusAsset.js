let fs = require('fs'),
    path = require('path'),
    crypto = require('crypto'),
    nodes = require('stylus').nodes,
    utils = require('stylus').utils;

module.exports = function(options) {

  let getVersion = options.getVersion || function(file) {
    let buf = fs.readFileSync(file);
    return crypto.createHash('md5').update(buf).digest('hex').substring(0, 8);
  };

  return function(style) {
    let paths = style.options.paths || [];

    style.define('asset', function(url) {
      let literal = new nodes.Literal('url("' + url.val + '")');

      let evaluator = this;
      let file = utils.lookup(url.val, paths);

      if (!file) {
        throw new Error('File ' + literal + ' not be found');
      }

      let version = getVersion(file);

      let ext = path.extname(url.val);
      let filepath = url.val.slice(0, url.val.length - ext.length);

      let newUrl = options.assetVersioning == 'query' ? (url.val + '?' + version) :
        options.assetVersioning == 'file' ? (filepath + '.v' + version + ext) :
          url.val;

      literal = new nodes.Literal('url("../i/' + newUrl + '")');

      return literal;
    });
  };
};
