'use strict';

const Article = require('../models/article');
const Task = require('../models/task');
const TutorialTree = require('../models/tutorialTree');
const ArticleRenderer = require('../renderer/articleRenderer');
const TaskRenderer = require('../renderer/taskRenderer');
const _ = require('lodash');
const makeAnchor = require('textUtil/makeAnchor');

const t = require('i18n');

t.requirePhrase('tutorial', 'map');

exports.get = async function(ctx) {

  const tutorialTree = TutorialTree.instance();

  const template = ctx.get('X-Requested-With') ? '_map' : 'map';

  console.log(tutorialTree.tree);

  ctx.body = ctx.render(template, {
    bySlug: tutorialTree.bySlug.bind(tutorialTree),
    roots: [
      tutorialTree.bySlug(tutorialTree.tree[0]),
      tutorialTree.bySlug(tutorialTree.tree[1]),
      {
        getUrl() {},
        title: t('config.additional_articles'),
        children: tutorialTree.tree.slice(2)
      }
    ]
  });

};


