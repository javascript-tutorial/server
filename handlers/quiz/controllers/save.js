const config = require('config');
const Quiz = require('../models/quiz');
const QuizResult = require('../models/quizResult');

exports.post = function*() {

  if (!this.session.quizzes) {
    this.redirect('/quiz');
    return;
  }

  // session may have many quiz at the same time
  // take the current one
  var sessionQuiz = this.session.quizzes[this.params.slug];

  if (!sessionQuiz || !sessionQuiz.result) {
    this.redirect('/quiz');
    return;
  }

  // prevent double saving of the same result
  if (!sessionQuiz.resultSaved) {

    var result = sessionQuiz.result;

    // only now we bind quizResult to user (!)
    // because the user may be GUEST when finishing the test
    // and authorize after it

    result.user = this.user._id;

    result = new QuizResult(result);

    yield result.persist();

    if (!~this.user.profileTabsEnabled.indexOf('quiz')) {
      this.user.profileTabsEnabled.addToSet('quiz');
      yield this.user.persist();
    }

    sessionQuiz.resultSaved = true;
  }

  // done with that quiz
  // delete this.session.quizzes[this.params.slug];

  this.body = "DONE";

};
