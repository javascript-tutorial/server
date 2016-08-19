exports.AuthModal = require('./authModal');

const AuthForm = require('./authForm');

function init() {

  var form = new AuthForm(window.authOptions);

  document.getElementById("auth-form").appendChild(form.getElem());

}

init();
