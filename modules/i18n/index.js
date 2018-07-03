'use strict';


const LANG = require('config').lang;

const log = require('log')();
const path = require('path');
const fs = require('fs');
let config = require('config');
let yaml = require('js-yaml');

let t = require('./t');

let docs = {};

t.requirePhrase = function(moduleName, packageName = '') {

  // if same doc was processed - don't redo it
  if (docs[moduleName] && docs[moduleName].includes(packageName)) {
    return;
  }

  if (!docs[moduleName]) docs[moduleName] = [];
  docs[moduleName].push(packageName);


  let translationPath = moduleName ?
    path.join(path.dirname(require.resolve(moduleName)), 'locales', packageName) :
    path.join(config.projectRoot, 'locales', packageName);

  if (fs.existsSync(path.join(translationPath, LANG + '.yml'))) {
    translationPath = path.join(translationPath, LANG + '.yml');
  } else {
    translationPath = path.join(translationPath, 'en.yml');
  }

  let doc = yaml.safeLoad(fs.readFileSync(translationPath, 'utf-8'));
  let name = (moduleName || 'locales') + (packageName ? ('.' + packageName) : '');

  t.i18n.add(name, doc);
};


module.exports = t;
