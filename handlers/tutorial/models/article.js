'use strict';

const config = require('config');
const path = require('path');
const TutorialEntry = require('./tutorialEntry');
const assert = require('assert');

module.exports = class Article extends TutorialEntry {
  constructor(data) {
    super();

    'title,slug,githubLink,isFolder,weight'.split(',').forEach(field => {
      if (!(field in data)) {
        throw new Error("No field in article " + field);
      }
      this[field] = data[field];
    });

    if ('content' in data) { // can be empty string
      this.content = data.content;
    }

    this.slug = this.slug.toLowerCase().trim();
    this.title = this.title.trim();
    if (!this.isFolder && !this.content) {
      throw new Error('Article content is required');
    }

    this.libs = data.libs || [];
    this.children = data.children || [];
    this.isFolder = data.isFolder || false;

    'headJs,headCss,headHtml,parent'.split(',').forEach(field => {
      if (field in data) {
        this[field] = data[field];
      }
    });
  }

  static deserialize(data) {
    return new Article(data);
  }

};
