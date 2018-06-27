'use strict';

const TutorialViewStorage = require('../models/tutorialViewStorage');

exports.get = async function(ctx) {
  let view;

  let storage = TutorialViewStorage.instance();
  for(let webpath in storage.getAll()) {
    view = storage.get(webpath);
    if (view.plunkId == ctx.query.plunkId) {
      ctx.set('Content-Type', 'application/zip');
      ctx.body = view.getZip();
    }
  }

};