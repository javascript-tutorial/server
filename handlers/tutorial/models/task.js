'use strict';

const config = require('config');
const path = require('path');
const TutorialEntry = require('./tutorialEntry');

module.exports = class Task extends TutorialEntry {
  constructor(data) {
    super();

    'title,slug,githubLink,weight'.split(',').forEach(field => {
      if (!(field in data)) {
        throw new Error("No field in task: " + field);
      }
      this[field] = data[field];
    });

    this.slug = this.slug.toLowerCase().trim();
    this.title = this.title.trim();

    this.libs = data.libs || [];

    'importance,headJs,headCss,headHtml,content,solution,parent'.split(',').forEach(field => {
      if (field in data) {
        this[field] = data[field];
      }
    });

  }

  static getUrlBySlug(slug) {
    return '/task/' + slug;
  };

  static deserialize(data) {
    return new Task(data);
  }

};