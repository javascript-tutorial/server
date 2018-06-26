'use strict';

const Article = require('../models/article');
const Task = require('../models/task');
const TutorialTree = require('../models/tutorialTree');
const ArticleRenderer = require('../renderer/articleRenderer');
const TaskRenderer = require('../renderer/taskRenderer');
const _ = require('lodash');
const makeAnchor = require('textUtil/makeAnchor');

const localStorage = require('localStorage');

const t = require('i18n');

const LANG = require('config').lang;

t.requirePhrase('tutorial.map', require('../locales/map/' + LANG + '.yml'));

exports.get = function* get() {

  const tutorialTree = TutorialTree.instance();

  var template = this.get('X-Requested-With') ? '_map' : 'map';

  this.body = this.render(template, {
    bySlug: tutorialTree.bySlug.bind(tutorialTree),
    roots: [
      treeRendered[0],
      treeRendered[1],
      {
        title: t('site.additional_articles'),
        children: treeRendered.slice(2)
      }
    ]
  });

};


