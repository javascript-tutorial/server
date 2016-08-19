var Modal = require('client/head/modal');
var AuthForm = require('./authForm');

/**
 * Options:
 *   - callback: function to be called after successful login (by default - go to successRedirect)
 *   - message: form message to be shown when the login form appears ("Log in to leave the comment")
 *   - successRedirect: the page to redirect (current page by default)
 *       - after immediate login
 *       - after registration for "confirm email" link
 */
class AuthModal extends Modal {

  constructor(options) {
    super(options);
    this.options = options || {};
    this.options.inModal = true;

    var authForm = new AuthForm(this.options);
    this.setContent(authForm.getElem());
  }


  render() {
    super.render();
    this.elem.classList.add('login-form-modal');
  }

}


module.exports = AuthModal;
