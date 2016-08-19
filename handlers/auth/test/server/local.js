/* globals describe, it, before */

const db = require('lib/dataUtil');
const mongoose = require('lib/mongoose');
const path = require('path');
const request = require('request-promise');
const fixtures = require(path.join(__dirname, '../fixtures/db'));
const app = require('app');
const assert = require('better-assert');


describe('Authorization', function() {

  var server;
  var prefix = 'http://127.0.0.1:1234';

  function getCsrf(jar) {
    var cookie = jar.getCookies(prefix).filter(cookie => cookie.key == 'XSRF-TOKEN')[0];
    return cookie && cookie.value;
  }

  before(function*() {

    yield* db.loadModels(fixtures, {reset: true});
    server = app.listen(1234, '127.0.0.1');
    console.log(server.address());
  });

  after(function*() {
    yield function(callback) {
      server.close(callback);
    };
  });

  describe('login', function() {
    it('should require verified email', function*() {
      var hadError = false;
      try {
        yield request({
          method: 'post',
          url:    `${prefix}/auth/login/local`,
          form:   {
            email:    fixtures.User[2].email,
            password: fixtures.User[2].password
          }
        });

      } catch (e) {
        hadError = true;
        e.statusCode.should.be.eql(401);
      }

      hadError.should.be.true;
    });
  });

  describe('login flow', function() {
    var jar;

    before(function() {
      jar = request.jar();
    });

    it('should log in when email is verified', function*() {
      var result = yield request({
        method: 'POST',
        url: `${prefix}/auth/login/local`,
        jar: jar,
        form: {
          email:    fixtures.User[0].email,
          password: fixtures.User[0].password
        }
      });

      var cookieNames = jar.getCookies(prefix).map(cookie => cookie.key);
      cookieNames.should.containDeep(['sid', 'remember']);
    });

    it('should log out', function*() {
      var csrf = getCsrf(jar);
      var hadRedirect = false;
      try {
        yield request({
          method:         'POST',
          jar:            jar,
          followRedirect: false,
          url:            `${prefix}/auth/logout?_csrf=${csrf}`
        });
      } catch (e) {
        e.statusCode.should.eql(302);
        hadRedirect = true;
      }

      hadRedirect.should.be.true;

      var cookieNames = jar.getCookies(prefix).map(cookie => cookie.key);

      cookieNames.should.not.containEql('remember');
      cookieNames.should.not.containEql('sid');
    });

    it('should return error when repeat logout (the session is incorrect)', function*() {
      var csrf = getCsrf(jar);
      var hadError = false;
      try {
        yield request({
          method:         'POST',
          jar:            jar,
          followRedirect: false,
          url:            `${prefix}/auth/logout?_csrf=${csrf}`
        });
      } catch (e) {
        e.statusCode.should.eql(401);
        hadError = true;
      }

      hadError.should.be.true;

    });
  });

  describe('register', function() {
    var jar;

    before(function() {
      jar = request.jar();
    });

    var userData = {
      email:       Math.random() + "@gmail.com",
      displayName: "Random guy",
      password:    "somepass"
    };

    it('should create a new user', function*() {
      var result = yield request.post({
        url: `${prefix}/auth/register`,
        jar: jar,
        form: userData,
        resolveWithFullResponse: true
      });


      result.statusCode.should.be.eql(201);

      var cookieNames = jar.getCookies(prefix).map(cookie => cookie.key);

      cookieNames.should.not.containEql('remember');
      cookieNames.should.not.containEql('sid');
    });

    it('should fail to create a new user with same email', function*() {
      var error;
      try {
        yield request.post({
          url:                     `${prefix}/auth/register`,
          jar:                     jar,
          form:                    userData,
          json: true,
          resolveWithFullResponse: true
        });
      } catch (e) {
        error = e;
      }

      error.statusCode.should.be.eql(400);
      error.response.body.errors.email.should.exist;
    });

  });

});
