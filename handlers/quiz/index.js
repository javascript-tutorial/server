
var mountHandlerMiddleware = require('lib/mountHandlerMiddleware');

exports.init = function(app) {
  app.use( mountHandlerMiddleware('/quiz', __dirname) );
};

exports.QuizResult = require('./models/quizResult');

