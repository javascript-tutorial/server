var User = require('users').User;
var jade = require('lib/serverJade');
var path = require('path');
var config = require('config');
var sendMail = require('mailer').send;

// Регистрация пользователя.
exports.post = function* (next) {

  var email = this.request.body.email.toLowerCase();
  if (!email) {
    this.throw(404, 'Не указан email пользователя.');
  }

  var user = yield User.findOne({
    email: email
  });

  if (!user) {
    this.throw(404, 'Нет такого пользователя.');
  }

  if (user.verifiedEmail) {
    this.throw(403, 'Ваш Email уже подтверждён.');
  }

  try {

    yield sendMail({
      templatePath: path.join(this.templateDir, 'verify-registration-email'),
      to: user.email,
      subject: "Подтверждение email",
      link: config.server.siteHost + '/auth/verify/' + user.verifyEmailToken
    });

  } catch(e) {
    this.log.error({err: e}, "Reverify failed");
    this.throw(500, "На сервере ошибка отправки email.");
  }

  this.body = '';
};
