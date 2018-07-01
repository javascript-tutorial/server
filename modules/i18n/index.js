'use strict';

const BabelFish = require('babelfish');

const i18n = new BabelFish('en');

const LANG = require('config').lang;
const requireTranslation = require('./requireTranslation');

let err = console.error;

if (typeof IS_CLIENT === 'undefined') {
  const log = require('log')();
  err = (...args) => log.error(...args)
}

function t() {

  if (!i18n.hasPhrase(LANG, arguments[0])) {
    err("No such phrase", arguments[0]);
  }

  return i18n.t(LANG, ...arguments);
}


let docs = {};

t.i18n = i18n;

if (LANG !== 'en') {
  i18n.setFallback(LANG, 'en');
}

// packageName can be empty
t.requirePhrase = function(module, packageName = '') {

  // if same doc was processed - don't redo it
  if (docs[module] && docs[module].includes(packageName)) return;

  if (!docs[module]) docs[module] = [];
  docs[module].push(packageName);

  let doc = requireTranslation(module, packageName);

  i18n.addPhrase(LANG, module + (packageName ? ('.' + packageName) : ''), doc);

};


module.exports = t;
