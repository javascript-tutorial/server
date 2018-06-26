'use strict';

const TutorialView = require('../models/tutorialView');

exports.get = function*() {
  let view;

  for(let webpath in TutorialView.storage) {
    view = TutorialView.storage[webpath];
    if (view.plunkId == this.query.plunkId) {
      this.set('Content-Type', 'application/zip');
      this.body = view.getZip();
    }
  }

};