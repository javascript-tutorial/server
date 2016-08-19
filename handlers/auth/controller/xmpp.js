var User = require('users').User;
var path = require('path');
var config = require('config');

// Remove provider profile from the user
exports.post = function* (next) {

  // anti-bruteforce pause
  yield function(callback) {
    setTimeout(callback, 100);
  };

  var user = yield User.findOne({
    profileName: this.request.body.user
  });

  if (!user) {
    this.log.error("No such user", this.request.body.user);
    this.body = "0";
    return;
  }

  switch(this.request.body.command) {
  case 'auth':
    this.body = user.checkPassword(this.request.body.password) ? "1" : "0";
    return;
  default:
    // do not support other requests yet
    this.log.debug("Command not supported", this.request.body.command);
    this.body = "0";
  }

};
