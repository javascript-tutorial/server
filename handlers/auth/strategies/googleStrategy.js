var User = require('users').User;
const GoogleStrategy = require('passport-google-oauth').Strategy;
const authenticateByProfile = require('./../lib/authenticateByProfile');
const config = require('config');

// Doesn't work: error when denied access,
// maybe https://www.npmjs.org/package/passport-google-plus ?
// should not require G+

/* Result example:
 var result = {
 "kind":        "plus#person",
 "etag":        "\"pNz5TVTpPz2Rn5Xw8UrubkkbOJ0/79ehDjWVUdPtREa5lO-8QSWwSUQ\"",
 "emails":      [
 {
 "value": "julia.b.kantor@gmail.com",
 "type":  "account"
 }
 ],
 "objectType":  "person",
 "id":          "104971107141139955646",
 "displayName": "Юлия Кантор",
 "name":        {
 "familyName": "Кантор",
 "givenName":  "Юлия"
 },
 "image":       {
 "url":       "https://lh3.googleusercontent.com/-XdUIqdMkCWA/AAAAAAAAAAI/AAAAAAAAAAA/4252rscbv5M/photo.jpg?sz=50",
 "isDefault": true
 },
 "isPlusUser":  false,
 "language":    "ru",
 "verified":    false
 }
 */

/*

 For image:
 ?sz=SIZE, large picture without sz!
 isDefault: true if no picture

 */

/*
 // revoke permission: https://security.google.com/settings/security/permissions?pli=1
 */

module.exports = new GoogleStrategy({
    clientID:          config.auth.providers.google.appId,
    clientSecret:      config.auth.providers.google.appSecret,
    callbackURL:       config.server.siteHost + "/auth/callback/google",
    passReqToCallback: true
  },
  function(req, token, tokenSecret, profile, done) {

    profile.realName = profile._json.nickname;

    authenticateByProfile(req, profile, done);
  }
);

