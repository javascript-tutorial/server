const LANG = require('config').lang;

const t = require('engine/i18n/t');

module.exports = function(template, locals) {
  locals = locals ? Object.create(locals) : {};
  addStandardHelpers(locals);

  return template(locals);
};

function addStandardHelpers(locals) {
  // locals.bem = bem;
  locals.t = t;
  locals.lang = LANG;
}

