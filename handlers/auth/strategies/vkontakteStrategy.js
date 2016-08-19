var User = require('users').User;
const VkontakteStrategy = require('passport-vkontakte').Strategy;
const authenticateByProfile = require('../lib/authenticateByProfile');
const config = require('config');

/*
result:
{ id: 1818925,
  first_name:      'Юля',
  last_name:       'Дубовик',
  sex:             1,
  screen_name:     'id1818925',
  photo:           'http://cs5475.vk.me/u1818925/e_974b5ece.jpg'
}
(email in oauthResponse)
*/

module.exports = new VkontakteStrategy({
    clientID:          config.auth.providers.vkontakte.appId,
    clientSecret:      config.auth.providers.vkontakte.appSecret,
    callbackURL:       config.server.siteHost + "/auth/callback/vkontakte",
    passReqToCallback: true
  },
  function(req, accessToken, refreshToken, oauthResponse, profile, done) {

    // Vkontakte gives email in oauthResponse, not in profile (which is 1 more request)
    if (!oauthResponse.email) {
      return done(null, false, {message: "При входе разрешите доступ к email. Он используется для идентификации пользователя."});
    }


    profile.emails = [
      {value: oauthResponse.email}
    ];

    // vkontakte assumes this to be a real name
    profile.realName = profile.displayName;

    authenticateByProfile(req, profile, done);
  }
);

