

document.addEventListener('click', function(e) {
  if (e.target.hasAttribute('data-action-user-logout')) {
    e.preventDefault();
    logout();
  }
});


function logout() {
  var form = document.createElement('form');
  form.method = 'POST';
  form.action = '/auth/logout?_csrf=' + document.cookie.match(/XSRF-TOKEN=([\w-]+)/)[1];
  document.body.appendChild(form);
  form.submit();
}


module.exports = logout;
