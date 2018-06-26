'use strict';

const config = require('config');
const path = require('path');
const TutorialTree = require('./tutorialTree');
const assert = require('assert');

module.exports = class TutorialEntry {
  constructor() {
  }

  static getUrlBySlug(slug) {
    return '/' + slug;
  };

  getUrl() {
    return this.constructor.getUrlBySlug(this.slug);
  }

  static getResourceFsRootBySlug(slug) {
    return path.join(config.publicRoot, this.name.toLowerCase(), slug);
  };

  getResourceFsRoot() {
    return this.constructor.getResourceFsRootBySlug(this.slug);
  };

  static getResourceWebRootBySlug(slug) {
    return '/' + this.constructor.name.toLowerCase() + '/' + slug;
  };

  getResourceWebRoot() {
    return this.constructor.getResourceWebRootBySlug(this.slug);
  };


};
