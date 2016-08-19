
// not working (need to render on client-side /templates/mdeditor)
const t = require('i18n');

const LANG = require('config').lang;

t.requirePhrase('mdeditor', require('../locales/' + LANG + '.yml'));

const template = require('../templates/editor.jade');
const clientRender = require('client/clientRender');

module.exports = function(options) {

  return clientRender(template, {
    buttonSet: options.buttonSet
  });

};
