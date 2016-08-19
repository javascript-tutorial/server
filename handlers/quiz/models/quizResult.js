const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Quiz = require('./quiz');

// An attempt of quiz solving
const schema = new Schema({
  user:        {
    type: Schema.Types.ObjectId,
    ref:  'User',
    index: true
  },
  // we keep full information about the quiz, not linking by id,
  // because the quiz may be replaced
  // and even deleted
  // but the information must stay
  quizSlug:        {
    lowercase: true,
    type: String,
    required: true
  },

  quizTitle:        {
    type: String,
    required: true
  },

  level:     {
    type: String,
    enum: ['junior','medium', 'senior'],
    required: true
  },

  score: {
    type: Number,
    required: true
  },

  time: {
    type: Number,
    required: true
  },

  // better than XX% participants is not stored here,
  // because it is not persistent

  created: {
    type: Date,
    required: true,
    default: Date.now
  }
});

schema.virtual('levelTitle').get(function() {
  return {junior: 'новичок', medium: 'средний', senior: 'профи'}[this.level];
});

schema.statics.getLastAttemptsForUser = function*(user) {

  var allResults = yield QuizResult.find({user: user}).sort({created: -1}).exec();

  var lastAttemptResults = {};

  // get only first (by creation) result for each quizSlug
  for (var i = 0; i < allResults.length; i++) {
    var result = allResults[i];
    if (lastAttemptResults[result.quizSlug]) continue;
    lastAttemptResults[result.quizSlug] = result;
  }

  var quizzes = yield Quiz.find({
    archived: false,
    slug: {
      $in: Object.keys(lastAttemptResults)
    }
  }).exec();

  var quizBySlug = {};
  for (var i = 0; i < quizzes.length; i++) {
    var quiz = quizzes[i];
    quizBySlug[quiz.slug] = quiz;
  }

  var results = [];
  for(var key in lastAttemptResults) {
    lastAttemptResults[key].quiz = quizBySlug[lastAttemptResults[key].quizSlug];
    results.push(lastAttemptResults[key]);
  }

  return results;
};

var QuizResult = module.exports = mongoose.model('QuizResult', schema);
