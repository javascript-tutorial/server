const User = require('users').User;
const FacebookStrategy = require('passport-facebook').Strategy;
const authenticateByProfile = require('../lib/authenticateByProfile');
const config = require('config');
const request = require('co-request');
const co = require('co');

/*
 Returns fields:
{
  "id": "765813916814019",
  "email": "login\u0040mail.ru",
  "gender": "male",
  "link": "https:\/\/www.facebook.com\/app_scoped_user_id\/765813916814019\/",
  "locale": "ru_RU",
  "timezone": 4,
  "verified": true,
  "name": "Ilya Kantor",
  "last_name": "Kantor",
  "first_name": "Ilya"
}

 If I add "picture" to profileURL?fields, I get a *small* picture.

 Real picture is (public):
 (76581...19 is user id)
 http://graph.facebook.com/v2.1/765813916814019/picture?redirect=0&width=1000&height=1000

 redirect=0 means to get meta info, not picture
 then check is_silhouette (if true, no avatar)

 then if is_silhouette = false, go URL
 (P.S. width/height are unreliable, not sure which exactly size we get)

*/

function UserAuthError(message) {
  this.message = message;
}

module.exports = new FacebookStrategy({
    clientID:          config.auth.providers.facebook.appId,
    clientSecret:      config.auth.providers.facebook.appSecret,
    callbackURL:       config.server.siteHost + "/auth/callback/facebook",
    // fields are described here:
    // https://developers.facebook.com/docs/graph-api/reference/v2.1/user
    profileURL:        'https://graph.facebook.com/me?fields=id,about,email,gender,link,locale,timezone,verified,name,last_name,first_name,middle_name',
    passReqToCallback: true
  },
  function(req, accessToken, refreshToken, profile, done) {

    // req example:
    // '/callback/facebook?code=...',

    // accessToken:
    // ... (from ?code)

    // refreshToken:
    // undefined


    co(function*() {

      var permissionError = null;
      // I guess, facebook won't allow to use an email w/o verification, but still...
      if (!profile._json.verified) {
        permissionError = "Почта на facebook должна быть подтверждена";
      }

      if (!profile.emails || !profile.emails[0]) { // user may allow authentication, but disable email access (e.g in fb)
        permissionError = "При входе разрешите доступ к email. Он используется для идентификации пользователя.";
      }

      if (permissionError) {
        // revoke facebook auth, so that next time facebook will ask it again (otherwise it won't)
        var response = yield request({
          method: 'DELETE',
          url: "https://graph.facebook.com/me/permissions?access_token=" + accessToken
        });

        if (response.body != 'true') {
          req.log.error("Unexpected facebook response", {res: response, body: response.body});
          throw new Error("Facebook auth delete call after successful auth must return true");
        }

        throw new UserAuthError(permissionError);
      }

      var response = yield request.get({
        url: 'http://graph.facebook.com/v2.1/' + profile.id + '/picture?redirect=0&width=1000&height=1000',
        json: true
      });

      if (response.statusCode != 200) {
        throw new UserAuthError("Ошибка в запросе к Facebook");
      }

      var photoData = response.body.data;
      /* jshint -W106 */
      profile.photos = [{
        value: photoData.url,
        type: photoData.is_silhouette ? 'default' : 'photo'
      }];

      profile.realName = profile._json.name;

    }).then(function() {
      authenticateByProfile(req, profile, done);
    }, function(err) {
      if (err instanceof UserAuthError) {
        done(null, false, {message: err.message});
      } else {
        done(err);
      }
    });

//    http://graph.facebook.com/v2.1/765813916814019/picture?redirect=0&width=1000&height=1000


  }
);
