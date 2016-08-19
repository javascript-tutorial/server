var User = require('users').User;
var jade = require('lib/serverJade');
var path = require('path');
var config = require('config');

exports.get = function* (next) {

  var passwordResetToken = this.params.passwordResetToken;

  var user = yield User.findOne({
    passwordResetToken:        passwordResetToken,
    passwordResetTokenExpires: {
      $gt: new Date()
    }
  }).exec();

  if (!user) {
    this.throw(404, 'Вы перешли по устаревшей или недействительной ссылке на восстановление.');
  }

  this.body = this.render('forgot-recover', {
    passwordResetToken: passwordResetToken
  });

};

exports.post = function* (next) {

  var passwordResetToken = this.request.body.passwordResetToken;

  var user = yield User.findOne({
    passwordResetToken:        passwordResetToken,
    passwordResetTokenExpires: {
      $gt: new Date()
    }
  }).exec();

  if (!user) {
    this.throw(404, 'Ваша ссылка на восстановление недействительна или устарела.');
  }

  var error = "";
  if (!this.request.body.password) {
    error = "Пароль не должен быть пустым.";
  }
  if (this.request.body.password.length < 4) {
    error = "Пароль должен содержать минимум 4 символа.";
  }

  if (error) {
    this.body = this.render('forgot-recover', {
      passwordResetToken: passwordResetToken,
      error: error
    });

    return;
  }

  var redirect = user.passwordResetRedirect;

  delete user.passwordResetToken;
  delete user.passwordResetTokenExpires;
  delete user.passwordResetRedirect;

  user.password = this.request.body.password;

  yield user.persist();

  yield this.login(user);

  this.redirect(redirect);
};
