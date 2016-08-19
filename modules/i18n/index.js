'use strict';

const BabelFish = require('babelfish');

const i18n = new BabelFish('en');

const LANG = require('config').lang;

function t() {
  let args = [LANG];
  for (let i = 0; i < arguments.length; i++) {
    args.push(arguments[i]);
  }
  return i18n.t.apply(i18n, args);
}

let docs = {};

t.i18n = i18n;

t.requirePhrase = function(packageName, doc) {
  // if same phrase with same doc was processed - don't redo it
  if (docs[packageName] && docs[packageName].indexOf(doc) != -1) return;

  if (!docs[packageName]) docs[packageName] = [];
  docs[packageName].push(doc);

  i18n.addPhrase(LANG, packageName, doc);
};


module.exports = t;
