'use strict';

var mongoose = require('mongoose');
var mongooseTimestamp = require('lib/mongooseTimestamp');
var ObjectId = mongoose.Schema.Types.ObjectId;
var Schema = mongoose.Schema;
const config = require('config');
const path = require('path');

let html2search;
try {
  html2search = require('elastic').html2search;
} catch(e) {
  html2search = html => html;
}
const validate = require('validate');

var schema = new Schema({
  title: {
    type:     String,
    required: true,
    trim: true
  },

  importance: {
    type: Number
  },

  libs: [String],

  headJs: String,
  headCss: String,
  headHtml: String,

  slug: {
    type:     String,
    unique:   true,
    required: true,
    lowercase: true,
    trim: true
  },

  content: {
    type:     String,
    required: true,
    trim: true
  },

  solution: {
    // can be empty (assuming there is a solution.view which will be autolinked)
    type:     String,
    trim: true,
    default: ''
  },

  rendered: {
    type: {}
  },

  search: String,
  solutionPlunkId: String,
  sourcePlunkId: String,

  weight: {
    type:     Number,
    required: true
  },

  githubLink: {
    type: String,
    required: true,
    trim: true,
    validate: validate.patterns.webpageUrl
  },

  parent: {
    type:     ObjectId,
    ref:      'Article',
    required: true,
    index:    true
  }

});

// all resources are here
schema.statics.resourceFsRoot = path.join(config.publicRoot, 'task');

schema.statics.getResourceFsRootBySlug = function(slug) {
  return path.join(schema.statics.resourceFsRoot, slug);
};

schema.statics.getResourceWebRootBySlug = function(slug) {
  return '/task/' + slug;
};

schema.statics.getUrlBySlug = function(slug) {
  return '/task/' + slug;
};

schema.methods.getResourceFsRoot = function() {
  return schema.statics.getResourceFsRootBySlug(this.get('slug'));
};

schema.methods.getResourceWebRoot = function() {
  return schema.statics.getResourceWebRootBySlug(this.get('slug'));
};

schema.methods.getUrl = function() {
  return schema.statics.getUrlBySlug(this.get('slug'));
};

schema.pre('save', function(next) {
  if (!this.rendered) return next();

  var searchContent = this.rendered.content;

  var searchSolution = Array.isArray(this.rendered.solution) ? this.rendered.solution.map(function(part) {
    return part.title + "\n" + part.content;
  }).reduce(function(prev, current) {
    return prev + "\n" + current;
  }, '') : this.rendered.solution;

  this.search = html2search(searchContent + "\n\n" + searchSolution);
  next();
});

schema.plugin(mongooseTimestamp);

module.exports = mongoose.model('Task', schema);


