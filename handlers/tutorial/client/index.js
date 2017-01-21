'use strict';

var delegate = require('client/delegate');
var prism = require('client/prism');
var xhr = require('client/xhr');
var TutorialMapModal = require('./tutorialMapModal');
var TutorialMap = require('./tutorialMap');

function init() {


  initTaskButtons();
  initFolderList();

  initSidebarHighlight();

  initNewsletterForm();

  delegate(document, '[data-action="tutorial-map"]', 'click', function(event) {
    if (event.which != 1) return; // only left-click, FF needs this
    event.preventDefault();
    showTutorialMapModal();
  });

  prism.init();

  var tutorialMapElem = document.querySelector('.tutorial-map');
  if (tutorialMapElem) {
    new TutorialMap(tutorialMapElem);
  } else if (/[&?]map\b/.test(location.href)) {
    showTutorialMapModal();
  }

}


function initNewsletterForm() {

  var form = document.querySelector('[data-newsletter-subscribe-form]');
  if (!form) return;

  form.onsubmit = function(event) {
    event.preventDefault();
    newsletter.submitSubscribeForm(form);
  };

}


function showTutorialMapModal() {

  if (!/[&?]map\b/.test(location.href)) {
    window.history.replaceState(null, null, ~location.href.indexOf('?') ? (location.href + '&map') : (location.href + '?map'));
  }
  var modal = new TutorialMapModal();
  modal.elem.addEventListener('tutorial-map-remove', function() {
    window.history.replaceState(null, null, location.href.replace(/[&?]map\b/, ''));
  });

}

function initSidebarHighlight() {

  function highlight() {

    var current = document.getElementsByClassName('sidebar__navigation-link_active');
    if (current[0]) current[0].classList.remove('sidebar__navigation-link_active');

    //debugger;
    var h2s = document.getElementsByTagName('h2');
    for (var i = 0; i < h2s.length; i++) {
      var h2 = h2s[i];
      // first in-page header
      // >1, because when visiting http://javascript.in/native-prototypes#native-prototype-change,
      // top may be 0.375 or kind of...
      if (h2.getBoundingClientRect().top > 1) break;
    }
    i--; // we need the one before it (currently reading)

    if (i >= 0) {
      var href = h2s[i].firstElementChild && h2s[i].firstElementChild.getAttribute('href');
      var li = document.querySelector('.sidebar__navigation-link a[href="' + href + '"]');
      if (href && li) {
        li.classList.add('sidebar__navigation-link_active');
      }
    }

  }

  document.addEventListener('DOMContentLoaded', function() {
    highlight();

    window.addEventListener('scroll', highlight);
  });


}


function initTaskButtons() {
  // solution button
  delegate(document, '.task__solution', 'click', function(event) {
    event.target.closest('.task').classList.toggle('task__answer_open');
  });

  // close solution button
  delegate(document, '.task__answer-close', 'click', function(event) {
    event.target.closest('.task').classList.toggle('task__answer_open');
  });

  // every step button (if any steps)
  delegate(document, '.task__step-show', 'click', function(event) {
    event.target.closest('.task__step').classList.toggle('task__step_open');
  });
}

function initFolderList() {
  delegate(document, '.lessons-list__lesson_level_1 > .lessons-list__link', 'click', function(event) {
    var link = event.delegateTarget;
    var openFolder = link.closest('.lessons-list').querySelector('.lessons-list__lesson_open');
    // close the previous open folder (thus making an accordion)
    if (openFolder && openFolder != link.parentNode) {
      openFolder.classList.remove('lessons-list__lesson_open');
    }
    link.parentNode.classList.toggle('lessons-list__lesson_open');
    event.preventDefault();
  });
}

window.runDemo = function(button) {

  var demoElem;
  var parent = button;

  /* jshint -W084 */
  while (parent = parent.parentElement) {
    demoElem = parent.querySelector('[data-demo]');
    if (demoElem) break;
  }

  if (!demoElem) {
    alert("Error, no demo element");
  } else {
    /* jshint -W061 */
    eval(demoElem.textContent);
  }

};

init();
