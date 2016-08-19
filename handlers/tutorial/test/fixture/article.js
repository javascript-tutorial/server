'use strict';

const mongoose = require('mongoose');

var ids = [];
for (var i = 0; i < 10; i++) ids[i] = new mongoose.Types.ObjectId();

exports.Article = [
  {
    _id:        ids[0],
    title:      "Article 1",
    slug:       "article-1",
    content:    "Content 1",
    modified:   new Date(2014, 0, 1),
    githubLink: 'http://not.exists.com',
    isFolder:   true,
    weight:     0
  },
  {
    _id:        ids[1],
    title:      "Article 2",
    slug:       "article-2",
    content:    "Content 2",
    modified:   new Date(2014, 0, 2),
    githubLink: 'http://not.exists.com',
    isFolder:   true,
    weight:     1
  },
  {
    _id:        ids[2],
    title:      "Article 1.1",
    slug:       "article-1.1",
    content:    "Content 1.1",
    modified:   new Date(2014, 0, 2),
    isFolder:   false,
    weight:     0,
    githubLink: 'http://not.exists.com',
    parent:     ids[0]
  },
  {
    _id:        ids[3],
    title:      "Article 1.2",
    slug:       "article-1.2",
    content:    "Content 1.2",
    modified:   new Date(2014, 0, 3),
    isFolder:   false,
    weight:     1,
    githubLink: 'http://not.exists.com',
    parent:     ids[0]
  },
  {
    _id:        ids[4],
    title:      "Article 2.1",
    slug:       "article-2.1",
    content:    "Content 2.1",
    modified:   new Date(2014, 0, 4),
    isFolder:   false,
    githubLink: 'http://not.exists.com',
    weight:     0,
    parent:     ids[1]
  },
  {
    _id:        ids[5],
    title:      "Article 2.2",
    slug:       "article-2.2",
    content:    "Content 2.2",
    modified:   new Date(2014, 0, 5),
    isFolder:   false,
    githubLink: 'http://not.exists.com',
    weight:     1,
    parent:     ids[1]
  }
];
