'use strict';

const config = require('config');
const Quiz = require('../models/quiz');
const QuizResult = require('../models/quizResult');
const QuizStat = require('../models/quizStat');
const BasicParser = require('markit').BasicParser;

exports.get = function*() {

  this.nocache();

  // session may have many quiz at the same time
  // take the current one
  // it may be archived!
  var sessionQuiz = this.session.quizzes && this.session.quizzes[this.params.slug];

  if (!sessionQuiz) {
    // let the user start a new quiz here
    // not archived!
    let quiz = yield Quiz.findOne({
      slug: this.params.slug,
      archived: false
    }).exec();

    if (!quiz) {
      this.log.debug('No quiz: ' + this.params.slug);
      this.throw(404);
    }

    this.locals.quiz = quiz;
    this.locals.title = new BasicParser().renderInline(quiz.title);
    this.body = this.render('quiz-start');
    return;
  }

  // we have a session quiz, but it may be archived! (user started it before the update)
  // so let's look by id
  let quiz = yield Quiz.findById(sessionQuiz.id).exec();

  if (!quiz) {
    // invalid id in sessionQuiz, probably db was cleared
    this.log.debug('No quiz with id: ' + sessionQuiz.id);
    // invalid quiz in session, delete and go /quiz
    delete this.session.quizzes[this.params.slug];
    this.redirect('/quiz');
    return;
  }

  this.locals.quiz = quiz;
  this.locals.title = new BasicParser().renderInline(quiz.title);

  console.log(quiz.title, this.locals.title);
  this.log.debug('sessionQuiz', sessionQuiz);

  if (sessionQuiz.result) {

    var belowPercentage = yield QuizStat.getBelowScorePercentage(quiz.slug, sessionQuiz.result.score);

    this.locals.quizResult = new QuizResult(sessionQuiz.result);
    this.locals.quizBelowPercentage = belowPercentage;

    this.locals.quizQuestions = sessionQuiz.questionsTakenIds.map(function(id, num) {
      var question = quiz.questions.id(id).toObject();
      question.userAnswer = sessionQuiz.answers[num];
      question.correct = quiz.questions.id(id).checkAnswer(question.userAnswer);
      return question;
    });

    this.body = this.render('results');
  } else {
    // show current question
    this.locals.question = quiz.questions.id(sessionQuiz.questionCurrentId);

    this.locals.progressNow = sessionQuiz.questionsTakenIds.length + 1;
    this.locals.progressTotal = quiz.questionsToAskCount;

    this.body = this.render('quiz');
  }
};
