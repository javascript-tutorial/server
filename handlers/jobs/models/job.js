'use strict';

const mongoose = require('mongoose');
const mongooseTimestamp = require('lib/mongooseTimestamp');
const ObjectId = mongoose.Schema.Types.ObjectId;
const Schema = mongoose.Schema;
const config = require('config');
const path = require('path');

const validate = require('validate');

const schema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  }
});

schema.plugin(mongooseTimestamp);

module.exports = mongoose.model('Job', schema);


