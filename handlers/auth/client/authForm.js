var xhr = require('client/xhr');

var delegate = require('client/delegate');
var Spinner = require('client/spinner');
// var recaptcha = require('client/recaptcha');

var loginForm = require('../templates/login-form.jade');
var registerForm = require('../templates/register-form.jade');
var forgotForm = require('../templates/forgot-form.jade');

var clientRender = require('client/clientRender');

var notification = require('client/notification');

/**
 * Options:
 *   - callback: function to be called after successful login (by default - go to successRedirect)
 *   - message: form message to be shown when the login form appears ("Log in to leave the comment")
 *   - successRedirect: the page to redirect (current page by default)
 *       - after immediate login
 *       - after registration for "confirm email" link
 */
class AuthForm {

  constructor(options) {
    this.options = options;

    if (!options.successRedirect) {
      options.successRedirect = window.STATUS_CODE < 300 ? window.location.href : '/';
    }
  }

  render() {
    this.elem = document.createElement('div');
    this.elem.innerHTML = clientRender(loginForm, this.options);

    if (this.options.message) {
      this.showFormMessage(this.options.message);
    }

    this.initEventHandlers();
  }

  getElem() {
    if (!this.elem) this.render();
    return this.elem;
  }

  successRedirect() {
    if (window.location.href == this.options.successRedirect) {
      window.location.reload();
    } else {
      window.location.href = this.options.successRedirect;
    }
  }

  clearFormMessages() {
    /*
     remove error for this notation:
     span.text-input.text-input_invalid.login-form__input
     input.text-input__control#password(type="password", name="password")
     span.text-inpuxt__err Пароли не совпадают
     */
    [].forEach.call(this.elem.querySelectorAll('.text-input_invalid'), function(elem) {
      elem.classList.remove('text-input_invalid');
    });

    [].forEach.call(this.elem.querySelectorAll('.text-input__err'), function(elem) {
      elem.remove();
    });

    // clear form-wide notification
    this.elem.querySelector('[data-notification]').innerHTML = '';
  }

  request(options) {
    var request = xhr(options);

    request.addEventListener('loadstart', function() {
      var onEnd = this.startRequestIndication();
      request.addEventListener('loadend', onEnd);
    }.bind(this));

    return request;
  }

  startRequestIndication() {
    this.elem.classList.add('modal-overlay_light');
    var self = this;

    var submitButton = this.elem.querySelector('[type="submit"]');

    if (submitButton) {
      var spinner = new Spinner({
        elem:      submitButton,
        size:      'small',
        class:     '',
        elemClass: 'button_loading'
      });
      spinner.start();
    }

    return function onEnd() {
      self.elem.classList.remove('modal-overlay_light');
      if (spinner) spinner.stop();
    };

  }

  initEventHandlers() {

    this.delegate('[data-switch="register-form"]', 'click', function(e) {
      e.preventDefault();
      this.elem.innerHTML = clientRender(registerForm, this.options);
      // recaptcha.render(this.elem.querySelector('.login-form__recaptcha'));
    });

    this.delegate('[data-switch="login-form"]', 'click', function(e) {
      e.preventDefault();
      this.elem.innerHTML = clientRender(loginForm, this.options);
    });

    this.delegate('[data-switch="forgot-form"]', 'click', function(e) {
      e.preventDefault();

      // move currently entered email into forgotForm
      var oldEmailInput = this.elem.querySelector('[type="email"]');
      this.elem.innerHTML = clientRender(forgotForm, this.options);
      // recaptcha.render(this.elem.querySelector('.login-form__recaptcha'));
      var newEmailInput = this.elem.querySelector('[type="email"]');
      newEmailInput.value = oldEmailInput.value;
    });


    this.delegate('[data-form="login"]', 'submit', function(event) {
      event.preventDefault();
      this.submitLoginForm(event.target);
    });


    this.delegate('[data-form="register"]', 'submit', function(event) {
      event.preventDefault();
      this.submitRegisterForm(event.target);
    });

    this.delegate('[data-form="forgot"]', 'submit', function(event) {
      event.preventDefault();
      this.submitForgotForm(event.target);
    });

    this.delegate("[data-provider]", "click", function(event) {
      event.preventDefault();
      this.openAuthPopup('/auth/login/' + event.delegateTarget.dataset.provider);
    });

    this.delegate('[data-action-verify-email]', 'click', function(event) {
      event.preventDefault();

      var payload = new FormData();
      var email = event.delegateTarget.dataset.actionVerifyEmail;
      payload.append("email", email);

      var request = this.request({
        method: 'POST',
        url:    '/auth/reverify',
        body:   payload
      });

      var self = this;
      request.addEventListener('success', function(event) {

        if (this.status == 200) {
          self.showFormMessage({
            html: `
            <p>Письмо-подтверждение отправлено ещё раз.</p>
            <p><a href='#' data-action-verify-email='${email}'>перезапросить подтверждение.</a></p>
            `,
            type: 'success'
          });
        } else {
          self.showFormMessage({type: 'error', html: event.result});
        }

      });

    });
  }

  submitRegisterForm(form) {
    /*
    if (!form.elements['g-recaptcha-response'].value) {
      new notification.Error("Подтвердите, пожалуйста, что вы не робот (капча).");
      return;
    }
    */
    this.clearFormMessages();

    var hasErrors = false;
    if (!form.elements.email.value) {
      hasErrors = true;
      this.showInputError(form.elements.email, 'Введите, пожалуста, email.');
    }

    if (!form.elements.displayName.value) {
      hasErrors = true;
      this.showInputError(form.elements.displayName, 'Введите, пожалуста, имя пользователя.');
    }

    if (!form.elements.password.value) {
      hasErrors = true;
      this.showInputError(form.elements.password, 'Введите, пожалуста, пароль.');
    }

    if (hasErrors) return;

    var payload = new FormData(form);
    payload.append("successRedirect", this.options.successRedirect);

    var request = this.request({
      method:         'POST',
      url:            '/auth/register',
      normalStatuses: [201, 400],
      body:           payload
    });

    var self = this;
    request.addEventListener('success', function(event) {

      if (this.status == 201) {
        self.elem.innerHTML = clientRender(loginForm, self.options);
        self.showFormMessage({
          html: "<p>С адреса notify@javascript.ru отправлено письмо со ссылкой-подтверждением.</p>" +
                "<p><a href='#' data-action-verify-email='" + form.elements.email.value + "'>перезапросить подтверждение.</a></p>",
          type: 'success'
        });
        return;
      }

      if (this.status == 400) {
        for (var field in event.result.errors) {
          self.showInputError(form.elements[field], event.result.errors[field]);
        }
        return;
      }

      self.showFormMessage({html: "Неизвестный статус ответа сервера", type:'error'});
    });

  }


  submitForgotForm(form) {

    /*
    if (!form.elements['g-recaptcha-response'].value) {
      new notification.Error("Подтвердите, пожалуйста, что вы не робот (капча).");
      return;
    }
    */

    this.clearFormMessages();

    var hasErrors = false;
    if (!form.elements.email.value) {
      hasErrors = true;
      this.showInputError(form.elements.email, 'Введите, пожалуста, email.');
    }

    if (hasErrors) return;

    var payload = new FormData(form);
    payload.append("successRedirect", this.options.successRedirect);

    var request = this.request({
      method:         'POST',
      url:            '/auth/forgot',
      normalStatuses: [200, 404, 403],
      body:           payload
    });

    var self = this;
    request.addEventListener('success', function(event) {

      if (this.status == 200) {
        self.elem.innerHTML = clientRender(loginForm, self.options);
        self.showFormMessage({html: event.result, type: 'success'});
      } else if (this.status == 404) {
        self.showFormMessage({html: event.result, type: 'error'});
      } else if (this.status == 403) {
        self.showFormMessage({html: event.result.message || "Действие запрещено.", type: 'error'});
      }
    });

  }

  showInputError(input, error) {
    input.parentNode.classList.add('text-input_invalid');
    var errorSpan = document.createElement('span');
    errorSpan.className = 'text-input__err';
    errorSpan.innerHTML = error;
    input.parentNode.appendChild(errorSpan);
  }

  showFormMessage(message) {
    var html = message.html;
    if (html.indexOf('<p>') !== 0) {
      html = '<p>' + html + '</p>';
    }

    var type = message.type;
    if (['info', 'error', 'warning', 'success'].indexOf(type) == -1) {
      throw new Error("Unsupported type: " + type);
    }

    var container = document.createElement('div');
    container.className = 'login-form__' + type;
    container.innerHTML = html;

    this.elem.querySelector('[data-notification]').innerHTML = '';
    this.elem.querySelector('[data-notification]').appendChild(container);
  }

  submitLoginForm(form) {

    this.clearFormMessages();

    var hasErrors = false;
    if (!form.elements.email.value) {
      hasErrors = true;
      this.showInputError(form.elements.email, 'Введите, пожалуста, email.');
    }

    if (!form.elements.password.value) {
      hasErrors = true;
      this.showInputError(form.elements.password, 'Введите, пожалуста, пароль.');
    }

    if (hasErrors) return;

    var request = xhr({
      method:           'POST',
      url:              '/auth/login/local',
      noDocumentEvents: true, // we handle all events/errors in this code
      normalStatuses:   [200, 401],
      body:             new FormData(form)
    });

    var onEnd = this.startRequestIndication();

    request.addEventListener('success', (event) => {

      if (request.status == 401) {
        onEnd();
        this.onAuthFailure(event.result.message);
        return;
      }

      // don't stop progress indication if login successful && we're making redirect
      if (!this.options.callback) {
        this.onAuthSuccess(event.result.user);
      } else {
        onEnd();
        this.onAuthSuccess(event.result.user);
      }
    });

    request.addEventListener('fail', (event) => {
      onEnd();
      this.onAuthFailure(event.reason);
    });

  }

  openAuthPopup(url) {
    if (this.authPopup && !this.authPopup.closed) {
      this.authPopup.close(); // close old popup if any
    }
    var width = 800, height = 600;
    var top = (window.outerHeight - height) / 2;
    var left = (window.outerWidth - width) / 2;
    window.authForm = this;
    this.authPopup = window.open(url, 'authForm', 'width=' + width + ',height=' + height + ',scrollbars=0,top=' + top + ',left=' + left);
  }

  /*
   все обработчики авторизации (включая Facebook из popup-а и локальный)
   в итоге триггерят один из этих каллбэков
   */
  onAuthSuccess(user) {
    window.currentUser = user;
    if (this.options.callback) {
      this.options.callback();
    } else {
      this.successRedirect();
    }
  }

  onAuthFailure(errorMessage) {
    this.showFormMessage({html: errorMessage || "Отказ в авторизации.", type: 'error'});
  }
}


delegate.delegateMixin(AuthForm.prototype);

module.exports = AuthForm;
