var User = require('users').User;
var jade = require('lib/serverJade');
var path = require('path');
var config = require('config');

exports.get = function* (next) {

  var user = yield User.findOne({
    verifyEmailToken: this.params.verifyEmailToken
  }).exec();

  if (!user) {
    this.throw(404, 'Ссылка подтверждения недействительна или устарела.');
  }

  var redirect = user.verifyEmailRedirect;
  delete user.verifyEmailRedirect;

  if (!user.verifiedEmail) {
    user.verifiedEmail = true;
    user.verifiedEmailsHistory.push({date: new Date(), email: user.email});
    yield user.persist();

  } else if (user.pendingVerifyEmail) {
    user.email = user.pendingVerifyEmail;

    user.verifiedEmailsHistory.push({date: new Date(), email: user.email});
    try {
      yield user.persist();
    } catch (e) {
      if (e.name != 'ValidationError') {
        throw e;
      } else {
        this.throw(400, 'Изменение email невозможно, адрес уже занят.');
      }
    }

  } else {
    this.throw(404, 'Изменений не произведено: ваш email и так верифицирован, его смена не запрашивалась.');
  }

  delete user.verifyEmailToken;

  yield this.login(user);

  this.redirect(redirect);
};
