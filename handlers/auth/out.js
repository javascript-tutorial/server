// deprecated, not used
exports.get = function*(next) {
  this.logout();
  this.redirect('/');
};
