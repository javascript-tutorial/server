const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
  slug: {
    type:     String,
    required: true,
    index:    true
  },
  score: {
    type: Number,
    required: true
  },
  // count of tests with this score
  count: {
    type: Number,
    required: true
  }
});

schema.index({slug: 1, score: 1}, {unique: true});

schema.statics.getBelowScorePercentage = function*(slug, score) {

  var belowCount = yield QuizStat.aggregate({
      $match: {
        slug: slug,
        score: {
          $lt: score
        }
      }
    }, {
      $group: {
        _id: null,
        total: {
          $sum: "$count"
        }
      }
    }
  ).exec();

  var totalCount = yield QuizStat.aggregate(
    {
      $match: {
        slug: slug
      }
    }, {
      $group: {
        _id: null,
        total: {
          $sum: "$count"
        }
      }
    }
  ).exec();

  belowCount = belowCount.length ? belowCount[0].total : 0;
  totalCount = totalCount.length ? totalCount[0].total : 1;
  return Math.round(belowCount / totalCount * 100);

};


var QuizStat = module.exports = mongoose.model('QuizStat', schema);
