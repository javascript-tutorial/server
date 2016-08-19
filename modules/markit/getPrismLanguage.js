'use strict';

let ext2language = {
  html:   'markup',
  js:     'javascript',
  coffee: 'coffeescript',
  '':     'none'
};

let languages = 'none markup javascript css coffeescript php http java ruby scss sql'.split(' ');

let allSupported = Object.keys(ext2language).concat(languages);

function getPrismLanguage(language) {
  language = ext2language[language] || language;
  if (languages.indexOf(language) == -1) language = 'none';

  return language;
}

// all supported programming languages
getPrismLanguage.languages = languages;

// all supported programming languages and extensions
getPrismLanguage.allSupported = allSupported;

module.exports = getPrismLanguage;
