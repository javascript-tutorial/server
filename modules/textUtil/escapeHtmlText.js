module.exports = function(text) {
  // need toString to escape numbers
  return String(text).replace(/&([^#]|#[^0-9]?|#x[^0-9]?|$)/g, '&amp;$1').replace(/</g, '&lt;').replace(/>/g, '&gt;');
};
