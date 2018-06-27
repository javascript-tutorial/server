var filters = require('pug').filters;

var UglifyJS = require("uglify-js");

filters.uglify = function(str) {
  var result = UglifyJS.minify(str, {fromString: true});
  return result.code;
};

