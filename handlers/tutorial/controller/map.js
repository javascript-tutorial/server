'use strict';

const Article = require('../models/article');
const Task = require('../models/task');
const TutorialTree = require('../models/tutorialTree');
const ArticleRenderer = require('../renderer/articleRenderer');
const TaskRenderer = require('../renderer/taskRenderer');
const _ = require('lodash');
const makeAnchor = require('textUtil/makeAnchor');

const t = require('i18n');

const LANG = require('config').lang;

t.requirePhrase('tutorial.map', require('../locales/map/' + LANG + '.yml'));

exports.get = function* get() {

  const tutorialTree = TutorialTree.instance();

  const template = this.get('X-Requested-With') ? '_map' : 'map';

  console.log(tutorialTree.tree);
  this.body = this.render(template, {
    bySlug: tutorialTree.bySlug.bind(tutorialTree),
    roots: [
      tutorialTree.tree[0],
      tutorialTree.tree[1],
      {
        title: t('site.additional_articles'),
        children: tutorialTree.tree.slice(2)
      }
    ]
  });

};


