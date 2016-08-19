const config = require('config');
const mongoose = require('mongoose');
const QuizResult = require('../models/quizResult');
const User = require('users').User;

exports.get = function*() {

  var user = this.userById;

  if (String(this.user._id) != String(user._id)) {
    this.throw(403);
  }

  var results = yield* QuizResult.getLastAttemptsForUser(user._id);

  results = results.map(function(result) {
    return {
      created: result.created,
      quizTitle: result.quizTitle,
      quizUrl: result.quiz && result.quiz.getUrl(),
      score: result.score,
      level: result.level,
      levelTitle: result.levelTitle,
      time: result.time
    };
  });

  this.body = results;

};
