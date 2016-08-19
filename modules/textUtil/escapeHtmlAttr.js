

module.exports = function(text) {
  return text.toString().replace(/"/g, '&quot;').replace(/'/g, '&#39;');
};

