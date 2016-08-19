var User = require('users').User;
const GithubStrategy = require('passport-github').Strategy;
const authenticateByProfile = require('./../lib/authenticateByProfile');
const config = require('config');
const request = require('request');

/*
Minimal result example:
{
 login: 'a1109126',
 id: 8511653,
 avatar_url: 'https://avatars.githubusercontent.com/u/8511653?v=2',
 gravatar_id: '93243a77b75990dc8a614056ab9e4f65',
 url: 'https://api.github.com/users/a1109126',
 html_url: 'https://github.com/a1109126',
 followers_url: 'https://api.github.com/users/a1109126/followers',
 following_url: 'https://api.github.com/users/a1109126/following{/other_user}',
 gists_url: 'https://api.github.com/users/a1109126/gists{/gist_id}',
 starred_url: 'https://api.github.com/users/a1109126/starred{/owner}{/repo}',
 subscriptions_url: 'https://api.github.com/users/a1109126/subscriptions',
 organizations_url: 'https://api.github.com/users/a1109126/orgs',
 repos_url: 'https://api.github.com/users/a1109126/repos',
 events_url: 'https://api.github.com/users/a1109126/events{/privacy}',
 received_events_url: 'https://api.github.com/users/a1109126/received_events',
 type: 'User',
 site_admin: false,
 public_repos: 0,
 public_gists: 0,
 followers: 0,
 following: 0,
 created_at: '2014-08-21T08:48:48Z',
 updated_at: '2014-08-21T08:48:48Z'
}

Result example:
{
  login:  'iliakan',
  id:                  349336,
  avatar_url:          'https://avatars.githubusercontent.com/u/349336?v=2',
  gravatar_id:         '0cfca32a200bbd63e41058ec5b8e51ed',
  url:                 'https://api.github.com/users/iliakan',
  html_url:            'https://github.com/iliakan',
  followers_url:       'https://api.github.com/users/iliakan/followers',
  following_url:       'https://api.github.com/users/iliakan/following{/other_user}',
  gists_url:           'https://api.github.com/users/iliakan/gists{/gist_id}',
  starred_url:         'https://api.github.com/users/iliakan/starred{/owner}{/repo}',
  subscriptions_url:   'https://api.github.com/users/iliakan/subscriptions',
  organizations_url:   'https://api.github.com/users/iliakan/orgs',
  repos_url:           'https://api.github.com/users/iliakan/repos',
  events_url:          'https://api.github.com/users/iliakan/events{/privacy}',
  received_events_url: 'https://api.github.com/users/iliakan/received_events',
  type:                'User',
  site_admin:          false,
  name:                'Ilya Kantor',
  company:             '',
  blog:                'http://javascript.ru',
  location:            '',
  email:               '',
  hireable:            false,
  bio:                 null,
  public_repos:        37,
  public_gists:        663,
  followers:           85,
  following:           0,
  created_at:          '2010-07-30T14:31:35Z',
  updated_at:          '2014-08-20T14:48:14Z' }
}

*/

module.exports = new GithubStrategy({
    clientID:     config.auth.providers.github.appId,
    clientSecret: config.auth.providers.github.appSecret,
    callbackURL:  config.server.siteHost + "/auth/callback/github",
    passReqToCallback: true
  },
  function(req, accessToken, refreshToken, profile, done) {

    // this may be a default avatar, or a real user pic, can't be sure
    /* jshint -W106 */
    profile.photos = [
      {
        value: profile._json.avatar_url
      }
    ];

    var options = {
      headers: {
        'User-Agent':    'JavaScript.ru',
        'Authorization': 'token ' + accessToken
      },
      json:    true,
      url:     'https://api.github.com/user/emails'
    };

    // get emails using oauth token
    request(options, function(error, response, body) {
      if (error || response.statusCode != 200) {
        req.log.error(error, body);
        done(null, false, {message: "Ошибка связи с сервером github."});
        return;
      }

//      [ { email: 'iliakan@gmail.com', primary: true, verified: true } ],

      var emails = body.filter(function(email) {
        return email.verified;
      });

      if (!emails.length) {
        return done(null, false, {message: "Почта на github должна быть подтверждена."});
      }

      profile.emails = [
        {value: emails[0].email }
      ];

      profile.realName = profile.displayName;

      authenticateByProfile(req, profile, done);
    });


  }
);
