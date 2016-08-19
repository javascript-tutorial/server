var Modal = require('./modal');
var Spinner = require('client/spinner');

document.addEventListener("click", function(event) {
  if (!event.target.hasAttribute('data-action-login')) {
    return;
  }

  event.preventDefault();
  login();

});

function login() {
  var modal = new Modal({ hasClose: false, mixClass: 'login-modal' });
  var spinner = new Spinner();
  modal.setContent(spinner.elem);
  spinner.start();

  require.ensure('auth/client/authModal', function() {
    modal.remove();
    var AuthModal = require('auth/client/authModal');
    new AuthModal();
  }, 'authClient');

}

module.exports = login;
