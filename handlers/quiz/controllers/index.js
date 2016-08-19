const Quiz = require('../models/quiz');
const QuizResult = require('../models/quizResult');

exports.get = function*() {

  this.nocache();

  var quizzes = yield Quiz.find({
    archived: false
  }).sort({weight: 1}).exec();

  this.locals.quizzes = [];

  // FIXME: all quiz/* must have this
  this.locals.siteToolbarCurrentSection = "quiz";
  this.locals.title = 'Тестирование знаний';

  var quizResults = [];
  if (this.user) {
    quizResults = yield* QuizResult.getLastAttemptsForUser(this.user._id);
  }

  for (var i = 0; i < quizzes.length; i++) {
    var quiz = quizzes[i];
    var q = {
      title: quiz.title,
      description: quiz.description,
      slug: quiz.slug
    };
    quizResults.forEach(function(quizResult) {
      if (quizResult.quizSlug == quiz.slug) {
        q.quizResultScore = quizResult.score;
      }
    });

    this.locals.quizzes.push(q);
  }

  this.body = this.render('index');
};
