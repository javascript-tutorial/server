const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const config = require('config');
const path = require('path');
const assert = require('assert');
const _ = require('lodash');
const QuizQuestion = require('./quizQuestion');


const quizSchema = new Schema({
  // when a new quiz is imported, the current one gets archived: false,
  // but still remains in db for some time, to those people who are passing it in the moment of update
  archived: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  weight: {
    type: Number,
    required: true
  },
  slug: {
    type:     String,
    lowercase: true,
    required: true,
    index:    true
  },
  questionsToAskCount: {
    type: Number,
    required: true
  },
  created: {
    type: Date,
    required: true,
    default: Date.now
  },
  questions: [QuizQuestion.schema]
});

quizSchema.statics.getUrlBySlug = function(slug) {
  return '/quiz/' + slug;
};

quizSchema.methods.getUrl = function() {
  return quizSchema.statics.getUrlBySlug(this.get('slug'));
};


module.exports = mongoose.model('Quiz', quizSchema);
