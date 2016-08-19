'use strict';

var User = require('users').User;
var jade = require('lib/serverJade');
var path = require('path');
var config = require('config');
var sendMail = require('mailer').send;
var recaptcha = require('recaptcha');

exports.post = function* (next) {

/*  let captchaCheck = yield* recaptcha.checkCtx(this);
  if (!captchaCheck) {
    this.throw(403);
  }*/

  var email = this.request.body.email.toLowerCase();
  var user = yield User.findOne({
    email
  });

  if (!user) {
    this.status = 404;
    this.body = 'Нет такого пользователя.';
    return;
  }

  user.passwordResetToken = Math.random().toString(36).slice(2, 10);
  user.passwordResetTokenExpires = new Date(Date.now() + 86400*1e3);
  user.passwordResetRedirect = this.request.body.successRedirect;

  yield user.persist();

  try {

    yield sendMail({
      templatePath: path.join(this.templateDir, 'forgot-email'),
      to: user.email,
      subject: "Восстановление доступа",
      link: config.server.siteHost + '/auth/forgot-recover/' + user.passwordResetToken
    });

  } catch(e) {
    this.log.error({err: e}, "Mail send failed");
    this.throw(500, "На сервере ошибка отправки email.");
  }

  this.status = 200;
  this.body = 'На вашу почту отправлено письмо со ссылкой на смену пароля.';

};
