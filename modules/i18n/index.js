'use strict';

const BabelFish = require('babelfish');

const i18n = new BabelFish('en');

const LANG = require('config').lang;
const requireTranslation = require('./requireTranslation');

function t() {

  if (!i18n.hasPhrase(LANG, arguments[0])) {
    console.error("No such phrase", arguments[0]);
  }

  let args = [LANG];
  for (let i = 0; i < arguments.length; i++) {
    args.push(arguments[i]);
  }

  return i18n.t.apply(i18n, args);
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
