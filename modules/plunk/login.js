// Log in to Plnkr.co using Github credentials
// Prints Auth ID (put to config, reuse)

// Usage
// node modules/plunk/login.js

var config = require('config');
var readLine = require('lib/readLine');
var log = require('log')();
var request = require('co-request');

/* jshint -W106 */
function* login() {

  log.debug("readCredentials");

  process.stdout.write('Hi there! We need to establish an auth session with plunker first (only one time).\n1) Log in (sign up if needed) to http://github.com, please.\n2) And then go to http://plnkr.co and log in using GitHub (upper-right corner).\n3) And finally enter GitHub login/password here (will not give anyone, will not store anywhere).\n');
  var username = yield function(callback) {
    readLine({message: 'GitHub Login: '}, callback);
  };

  var password = yield function(callback) {
      readLine({message: 'GitHub Password: ', hidden: true}, callback);
  };

  log.debug("readGithubToken");

  var githubAuthResponse = yield request({
    url:  'https://api.github.com/authorizations',
    auth: {username: username, password: password},
    headers: { 'User-Agent': 'App' },
    json: true
  });


  log.debug(githubAuthResponse);

  if (githubAuthResponse.statusCode == 403) {
    process.stderr.write("Wrong GitHub Login or Password");
    process.exit(1);
  } else if (githubAuthResponse.statusCode != 200) {
    process.stderr.write("Error " + githubAuthResponse.statusCode);
    process.exit(1);
  }


  var authorizations = githubAuthResponse.body;
  var githubPlunkerAuth = authorizations.find(function(item) {
    return item.app.name == 'Plunker';
  });

  if (!githubPlunkerAuth) {
    process.stderr.write("Plunker Auth not found");
    process.exit(1);
  }

  log.debug("readPlnkrAuth");

  var session = yield request({
    url: 'http://api.plnkr.co/sessions',
    json: true
  });

  if (session.statusCode != 200) {
    log.error(session);
    process.exit(1);
  }

  session = session.body;


  log.debug("TOKEN", githubPlunkerAuth.token);
  var plunkerAuthResponse = yield request.post({
    url: session.user_url,
    headers: { 'Content-Type': 'application/json' }, // required(!)
    json: true,
    body: JSON.stringify({
      service: 'github',
      token: githubPlunkerAuth.token
    })
  });

  if (plunkerAuthResponse.statusCode != 201) {
    log.debug(plunkerAuthResponse, githubPlunkerAuth);
    process.stderr.write("Incorrect response from " + session.user_url);
    process.exit(1);
  }

  log.debug("plunkerAuthResponse", plunkerAuthResponse.body);

  process.stdout.write("Plunker Auth ID:" + plunkerAuthResponse.body.id);
}

module.exports = login;

if (!module.parent) {
  require('co')(login)(function(err) {
    if (err) console.error(err.message, err.stack);
  });
}
