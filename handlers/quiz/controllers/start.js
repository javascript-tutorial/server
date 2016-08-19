const Quiz = require('../models/quiz');
const QuizResult = require('../models/quizResult');
const _ = require('lodash');

exports.post = function*() {

  var quiz = yield Quiz.findOne({
    slug: this.params.slug,
    archived: false
  }).exec();

  if (!quiz) {
    this.throw(404);
  }

  this.log.debug("Starting quiz ", quiz.toObject());

  if (!this.session.quizzes) {
    this.session.quizzes = {};
  }

  var sessionQuiz = {
    started: Date.now(),
    id: quiz._id,
    questionsTakenIds: [],
    answers: []
  };

  // previous attempt will be automatically removed from the session
  this.session.quizzes[quiz.slug] = sessionQuiz;

  sessionQuiz.questionCurrentId = _.sampleSize(quiz.questions, 1)[0]._id;

  this.redirect(quiz.getUrl());
};
