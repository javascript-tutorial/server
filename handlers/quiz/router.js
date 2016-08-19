var Router = require('koa-router');

var index = require('./controllers/index');
var start = require('./controllers/start');
var save = require('./controllers/save');
var answer = require('./controllers/answer');
var quiz = require('./controllers/quiz');
var resultsByUser = require('./controllers/resultsByUser');

var mustBeAuthenticated = require('auth').mustBeAuthenticated;
var router = module.exports = new Router();
router.param('userById', require('users').routeUserById);

router.get("/", index.get);
router.get("/results/user/:userById", mustBeAuthenticated, resultsByUser.get);
router.post("/start/:slug", start.post);
router.post("/save/:slug", mustBeAuthenticated, save.post);
router.post("/answer/:slug", answer.post);
router.get("/:slug", quiz.get);

