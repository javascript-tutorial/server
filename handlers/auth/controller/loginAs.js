'use strict';

const User = require('users').User;

exports.get = function* () {

  if (!(this.user && this.user.hasRole('admin')) && process.env.NODE_ENV != 'development') {
    this.throw(403);
  }

  let user = yield User.findOne({
    profileName: this.params.profileNameOrEmailOrId
  }).exec();

  if (!user) {
    user = yield User.findOne({
      email: this.params.profileNameOrEmailOrId.replace('--', '.')
    }).exec();
  }

  if (!user) {
    try {
      user = yield User.findById(this.params.profileNameOrEmailOrId).exec();
    } catch(e) {}
  }

  if (!user) this.throw(404);

  yield this.login(user);

  this.redirect('/');
};
