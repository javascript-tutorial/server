const fs = require('fs');
const path = require('path');
let yaml = require('js-yaml');

const LANG = require('config').lang;

module.exports = function (modulePath, packagePath) {

  let translationPath = path.join(path.dirname(require.resolve(modulePath)), 'locales', packagePath);

  if (fs.existsSync(path.join(translationPath, LANG + '.yml'))) {
    translationPath = path.join(translationPath, LANG + '.yml');
  } else {
    translationPath = path.join(translationPath, 'en.yml');
  }

  return yaml.safeLoad(fs.readFileSync(translationPath, 'utf-8'));

};