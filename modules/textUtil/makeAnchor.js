var transliterate = require('./transliterate');

module.exports = function(title, translitAnchors) {
  var anchor = title.trim()
    .replace(/<\/?[a-z].*?>/gim, '')  // strip tags, leave /<DIGIT/ like: "IE<123"
    .replace(/[ \t\n!"#$%&'()*+,\-.\/:;<=>?@[\\\]^_`{|}~]/g, '-') // пунктуация, пробелы -> дефис
    .replace(/[^a-zа-яё0-9-]/gi, '') // убрать любые символы, кроме [слов цифр дефиса])
    .replace(/-+/gi, '-') // слить дефисы вместе
    .replace(/^-|-$/g, ''); // убрать дефисы с концов

  if (translitAnchors) {
    anchor = transliterate(anchor);
  }
  anchor = anchor.toLowerCase();

  return anchor;
};

