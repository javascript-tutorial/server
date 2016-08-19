var yaml = require('js-yaml');
var fs = require('fs');
var Quiz = require('./models/quiz');
var path = require('path');
var log = require('log')();

function QuizImporter(options) {
  this.fileContent = fs.realpathSync(options.yml);
}


QuizImporter.prototype.addDot = function(question) {
  // numbers have no dot (looks better)
  if (/^\d+$/.test(question)) return question;

  // do not wrap code
  if (/^`[^`]+`$/.test(question)) return question;

  if (!/[.!?)]$/.test(question)) {
    question += '.';
  }
  return question;
};

QuizImporter.prototype.import = function*() {

  var quizObj = yaml.safeLoad(fs.readFileSync(this.fileContent, 'utf8'));


  for (var i = 0; i < quizObj.questions.length; i++) {
    var question = quizObj.questions[i];

    for (var j = 0; j < question.answers.length; j++) {
      var answer = question.answers[j];
      // all primitive values become titles w/o description
      if (typeof answer != 'object') {
        answer = question.answers[j] = {
          title: answer
        };
      } else {
        if (!answer.title) {
          log.error("No title for answer", question);
        }
      }
      // convert title to string, cause string methods will be called on it
      answer.title = this.addDot(String(answer.title).trim());
    }

  }


  var quiz = new Quiz(quizObj);

  quiz.archived = false;

  yield Quiz.update({
    slug: quiz.slug
  }, {
    $set: {
      archived: true
    }
  }, {
    multi: true
  }).exec();

  try {
    yield quiz.persist();
  } catch (e) {
    if (e.errors) console.error(e.errors);
    throw e;
  }

};


module.exports = QuizImporter;