var User = require('users').User;
const YandexStrategy = require('passport-yandex').Strategy;
const authenticateByProfile = require('../lib/authenticateByProfile');
const config = require('config');

/*
 profile: {
 "provider": "yandex",
 "id": "11111",
 "username": "iliakan",
 "displayName": "iliakan",
 "name": {
 "familyName": "Ilya",
 "givenName": "Kantor"
 },
 "gender": "male",
 "emails": [
 {
 "value": "login@yandex.ru"
 }
 ],
 "_raw": "{\"first_name\": \"Ilya\", \"last_name\": \"Kantor\", \"display_name\": \"iliakan\", \"emails\": [\"login@yandex.ru\"], \"default_email\": \"login@yandex.ru\", \"real_name\": \"Ilya Kantor\", \"default_avatar_id\": \"11111\", \"login\": \"login\", \"sex\": \"male\", \"id\": \"11111\"}",
 "_json": {
 "first_name": "Ilya",
 "last_name": "Kantor",
 "display_name": "iliakan",
 "emails": [
 "login@yandex.ru"
 ],
 "default_email": "login@yandex.ru",
 "real_name": "Ilya Kantor",
 "default_avatar_id": "11111",
 "login": "login",
 "sex": "male",
 "id": "11111"
 },
 "realName": "Ilya Kantor"
 }
*/

module.exports = new YandexStrategy({
    clientID:          config.auth.providers.yandex.appId,
    clientSecret:      config.auth.providers.yandex.appSecret,
    callbackURL:       config.server.siteHost + "/auth/callback/yandex",
    passReqToCallback: true
  },
  function(req, accessToken, refreshToken, profile, done) {
    /* jshint -W106 */
    profile.realName = profile._json.real_name;

    // there is no way to know if it is a default avatar or not
    // if user has no avatar, this gives us the "default yandex blank avatar"
    profile.photos = [{
      value: `https://avatars.yandex.net/get-yapic/${profile._json.default_avatar_id}/islands-200`
    }];

    authenticateByProfile(req, profile, done);
  }
);

