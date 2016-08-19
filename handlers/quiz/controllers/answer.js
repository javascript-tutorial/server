const Quiz = require('../models/quiz');
const QuizResult = require('../models/quizResult');
const QuizStat = require('../models/quizStat');
const QuizQuestion = require('../models/quizQuestion');
const _ = require('lodash');

exports.post = function*() {
  var self = this;
  if (!this.session.quizzes) {
    this.log.debug("No session quizzes");
    this.throw(404);
  }

  var sessionQuiz = this.session.quizzes[this.params.slug];

  if (!sessionQuiz) {
    this.log.debug("No session quiz with such slug");
    this.throw(404);
  }

  var quiz = yield Quiz.findById(sessionQuiz.id).exec();

  if (!quiz) {
    this.log.debug("No quiz with id " + sessionQuiz.id);
    this.throw(404);
  }

  // save selected answers in the question and push to questionsTaken
  var question = quiz.questions.id(sessionQuiz.questionCurrentId);

  sessionQuiz.questionsTakenIds.push(question._id);

  if (question.type == 'single') {
    sessionQuiz.answers.push(+this.request.body.answer);
  } else if (question.type == 'multi') {
    if (!Array.isArray(this.request.body.answer)) {
      this.throw(400);
    }
    sessionQuiz.answers.push(this.request.body.answer.map(Number));
  } else {
    throw new Error("Unknown question type: " + question.type);
  }

  if (sessionQuiz.questionsTakenIds.length == quiz.questionsToAskCount) {

    var totalScore = 0;
    sessionQuiz.questionsTakenIds.forEach(function(id, i) {
      totalScore += quiz.questions.id(id).checkAnswer(sessionQuiz.answers[i]);
    });

    // percentage of solved
    totalScore = Math.round(totalScore / quiz.questionsToAskCount * 100);

    var quizResult = new QuizResult({
      user:      this.user && this.user._id,
      quizSlug:  quiz.slug,
      quizTitle: quiz.title,
      score: totalScore,
      level:  totalScore <= 40 ? 'junior' : totalScore <= 80 ? 'medium' : 'senior',
      time:  Date.now() - sessionQuiz.started // in ms!
    });

    sessionQuiz.result = quizResult.toObject();


    yield QuizStat.update({
      slug:  quiz.slug,
      score: totalScore
    }, {
      $inc: {
        count: 1
      }
    }, {
      upsert: true
    }).exec();


    this.body = {
      reload: true
    };

  } else {

    // select one more question among non-taken
    var questionsAvailable = quiz.questions.filter(function(question) {
      // if a quiz.question is taken, exclude it from the list
      var found = false;
      sessionQuiz.questionsTakenIds.forEach(function(id) {

        if (String(id) == String(question._id)) {
          self.log.debug("Excluding " + id);
          found = true;
        }
      });

      return !found;
    });

    self.log.debug(questionsAvailable);
    sessionQuiz.questionCurrentId = _.sampleSize(questionsAvailable, 1)[0]._id;

    this.locals.question = quiz.questions.id(sessionQuiz.questionCurrentId);

    self.log.debug(this.locals.question, sessionQuiz.questionCurrentId);

    this.body = {
      html:           this.render('partials/_question'),
      questionNumber: sessionQuiz.questionsTakenIds.length
    };


  }

};
