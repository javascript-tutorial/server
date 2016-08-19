'use strict';

const mongoose = require('mongoose');
const mongooseTimestamp = require('lib/mongooseTimestamp');
const ObjectId = mongoose.Schema.Types.ObjectId;
const Schema = mongoose.Schema;
const config = require('config');
const path = require('path');
const Task = require('./task');

let html2search;
try {
  html2search = require('elastic').html2search;
} catch(e) {
  html2search = html => html;
}

const schema = new Schema({
  title: {
    type:     String,
    required: true
  },

  slug: {
    type:     String,
    unique:   true,
    required: true,
    lowercase: true,
    trim: true
  },


  libs: [String],

  headJs:   String,
  headCss:  String,
  headHtml: String,

  content: {
    type:     String,
    trim: true,
    validate: [
      {
        // allow empty content on folders
        validator: function(value) {
          return this.isFolder ? true : Boolean(value);
        },
        msg:       'Content is required'
      }
    ]
  },

  parent: {
    type:  ObjectId,
    ref:   'Article',
    index: true
  },

  weight: {
    type:     Number,
    required: true
  },

  rendered: {
    type: {}
  },

  search: String,

  githubLink: {
    type:     String,
    required: true
  },

  isFolder: {
    type:     Boolean,
    required: true
  }

});

// all resources are here
schema.statics.resourceFsRoot = path.join(config.publicRoot, 'article');

schema.statics.getResourceFsRootBySlug = function(slug) {
  return path.join(schema.statics.resourceFsRoot, slug);
};

schema.statics.getResourceWebRootBySlug = function(slug) {
  return '/article/' + slug;
};

schema.statics.getUrlBySlug = function(slug) {
  return '/' + slug;
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

schema.methods.findParents = function*() {
  var parents = [];
  var article = this;
  while (true) {
    article = yield Article.findById(article.parent).select('slug parent title').exec();
    if (!article) break;
    parents.push(article);
  }

  return parents.reverse();
};


schema.methods.destroyTree = function* () {
  if (this.isFolder) {
    var children = yield Article.find({parent: this._id}).select('isFolder').exec();

    for (var i = 0; i < children.length; i++) {
      var child = children[i];
      yield child.destroyTree();
    }
  }

  yield this.destroy();
};

schema.statics.destroyTree = function* (condition) {
  var articles = yield Article.find(condition).select('isFolder').exec();

  for (var i = 0; i < articles.length; i++) {
    yield* articles[i].destroyTree();
  }
};

/**
 * Returns {children: [whole article tree]} with nested children
 * @returns {{children: Array}}
 */
schema.statics.findTree = function* (options) {
  const Article = this;
  options = options || {};

  var query = options.query || Article.find({}).sort({weight: 1}).select('parent slug title weight isFolder').lean();
  var articles = yield query.exec();

  // arrange by ids
  var articlesById = {};
  for (var i = 0; i < articles.length; i++) {
    var article = articles[i];
    article._id = article._id.toString();
    articlesById[article._id] = article;
  }

  var root = [];

  addChildren();

  addPrevNext();

  return {
    articles: articlesById,
    children: root,
    byId:     function(id) {
      if (!id) return undefined;
      return articlesById[id.toString()];
    },
    siblings: function(id) {
      id = id.toString();
      var parent = articlesById[id].parent;
      return parent ? articlesById[parent].children : root;
    }
  };

  // ---

  function addChildren() {

    for (var _id in articlesById) {
      var article = articlesById[_id];
      if (article.parent) {
        var parent = articlesById[article.parent];
        if (!parent.children) parent.children = [];
        parent.children.push(article);
      } else {
        root.push(article);
      }
    }

  }

  function addPrevNext() {

    var prev;
    var next;

    addPrev(root);
    addNext();

    function addPrev(children) {
      for (var i = 0; i < children.length; i++) {
        var child = children[i];
        if (prev) child.prev = prev;
        prev = child._id;
        if (child.children) {
          addPrev(child.children);
        }
      }
    }

    function addNext() {
      for (var _id in articlesById) {
        var article = articlesById[_id];
        if (article.prev) {
          articlesById[article.prev].next = _id;
        }
      }
    }
  }

};

schema.pre('remove', function(next) {
  Task.remove({parent: this._id}, next);
});

schema.pre('save', function(next) {
  if (this.rendered) {
    this.search = html2search(this.rendered.content);
  }
  next();
});


schema.plugin(mongooseTimestamp);

var Article = module.exports = mongoose.model('Article', schema);

