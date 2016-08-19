module.exports = function() {
  var csrfCookie = document.cookie.match(/XSRF-TOKEN=([\w-]+)/);
  return csrfCookie ? csrfCookie[1] : null;
};

