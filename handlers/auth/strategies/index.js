var passport = require('koa-passport');


passport.use(require('./localStrategy'));

passport.use(require('./facebookStrategy'));
passport.use(require('./googleStrategy'));
passport.use(require('./yandexStrategy'));
passport.use(require('./githubStrategy'));
passport.use(require('./vkontakteStrategy'));


