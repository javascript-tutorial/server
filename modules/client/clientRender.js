const bem = require('bemJade')();
const thumb = require('client/image').thumb;
const LANG = require('config').lang;

const t = require('i18n');

module.exports = function(template, locals) {
  locals = locals ? Object.create(locals) : {};
  addStandardHelpers(locals);

  return template(locals);
};

function addStandardHelpers(locals) {
  locals.bem = bem;
  locals.t = t;
  locals.thumb = thumb;
  locals.lang = LANG;
}

