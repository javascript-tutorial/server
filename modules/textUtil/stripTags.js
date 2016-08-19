module.exports = function(text) {
  return text.replace(/<\/?[a-z].*?>/gim, '');
};
