'use strict';

var throttle = require('lib/throttle');
var delegate = require('client/delegate');

function TutorialMap(elem) {
  this.elem = elem;

  this.showTasksCheckbox = elem.querySelector('[data-tutorial-map-show-tasks]');
  this.showTasksCheckbox.checked = +localStorage.showTasksCheckbox;

  this.updateShowTasks();

  this.showTasksCheckbox.onchange = this.updateShowTasks.bind(this);

  this.filterInput = this.elem.querySelector('[data-tutorial-map-filter]');
  this.textInputBlock = this.elem.querySelector('.tutorial-map__filter .text-input');

  this.layoutSwitch = this.elem.querySelector('[data-tutorial-map-layout-switch]');
  var isMapSingleColumn = +localStorage.isMapSingleColumn;
  this.layoutSwitch.querySelector('[value="0"]').checked = !isMapSingleColumn;
  this.layoutSwitch.querySelector('[value="1"]').checked = isMapSingleColumn;
  this.updateLayout();
  this.layoutSwitch.onchange = this.onLayoutSwitchChange.bind(this);

  this.filterInput.oninput = this.onFilterInput.bind(this);
  this.filterInput.onkeydown = this.onFilterKeydown.bind(this);

  this.elem.querySelector('.close-button').onclick = () => {
    this.filterInput.value = '';
    this.showClearButton(false);
    this.filter('');
  };

  this.chaptersCollapsed = JSON.parse(localStorage.tutorialMapChapters || "{}");
  this.showChaptersCollapsed();

  this.delegate('.tutorial-map__item > .tutorial-map__link', 'click', function(event) {
    event.preventDefault();
    var href = event.delegateTarget.getAttribute('href');
    if (this.chaptersCollapsed[href]) {
      delete this.chaptersCollapsed[href];
    } else {
      this.chaptersCollapsed[href] = 1;
    }
    localStorage.tutorialMapChapters = JSON.stringify(this.chaptersCollapsed);
    this.showChaptersCollapsed();
  });

  var activeLink = this.elem.querySelector('[href="' + location.pathname + '"]');
  if (activeLink) {
    activeLink.classList.add('tutorial-map__link_active');
  }

  this.filterInput.focus();

}


TutorialMap.prototype.showChaptersCollapsed = function() {
  var links = this.elem.querySelectorAll('.tutorial-map__item > .tutorial-map__link');
  for (var i = 0; i < links.length; i++) {
    var link = links[i];

    if (this.chaptersCollapsed[link.getAttribute('href')]) {
      link.parentNode.classList.add('tutorial-map__item_collapsed');
    } else {
      link.parentNode.classList.remove('tutorial-map__item_collapsed');
    }
  }
};

TutorialMap.prototype.onLayoutSwitchChange = function(event) {
  this.updateLayout();
};


TutorialMap.prototype.updateLayout = function() {
  var isMapSingleColumn = +this.elem.querySelector('[name="map-layout"]:checked').value;
  if (isMapSingleColumn) {
    this.elem.classList.add('tutorial-map_singlecol');
  } else {
    this.elem.classList.remove('tutorial-map_singlecol');
  }

  localStorage.isMapSingleColumn = isMapSingleColumn ? "1" : "0";
};

TutorialMap.prototype.updateShowTasks = function() {
  if (this.showTasksCheckbox.checked) {
    this.elem.classList.add('tutorial-map_show-tasks');
  } else {
    this.elem.classList.remove('tutorial-map_show-tasks');
  }

  localStorage.showTasksCheckbox = this.showTasksCheckbox.checked ? "1" : "0";
};

TutorialMap.prototype.onFilterInput = function(event) {
  this.showClearButton(event.target.value);
  this.throttleFilter(event.target.value);
};

TutorialMap.prototype.onFilterKeydown = function(event) {
  if (event.keyCode == 27) { // escape
    this.filterInput.value = '';
    this.showClearButton(false);
    this.filter('');
  }
};

TutorialMap.prototype.showClearButton = function(show) {
  if (show) {
    this.textInputBlock.classList.add('text-input_clear-button');
  } else {
    this.textInputBlock.classList.remove('text-input_clear-button');
  }
};

// focus on the map itself, to allow immediate scrolling with arrow up/down keys
TutorialMap.prototype.focus = function() {
  this.elem.tabIndex = -1;
  this.elem.focus();
};

TutorialMap.prototype.filter = function(value) {
  value = value.toLowerCase();
  var showingTasks = this.showTasksCheckbox.checked;

  var links = this.elem.querySelectorAll('.tutorial-map-link');

  var topItems = this.elem.querySelectorAll('.tutorial-map__item');

  function checkLiMatch(li) {
    return isSubSequence(li.querySelector('a').innerHTML.toLowerCase(), value.replace(/\s/g, ''));
  }

  // an item is shown if any of its children is shown OR it's link matches the filter
  for (var i = 0; i < topItems.length; i++) {
    var li = topItems[i];
    var subItems = li.querySelectorAll('.tutorial-map__sub-item');

    var childMatch = Array.prototype.reduce.call(subItems, function(prevValue, subItem) {

      var childMatch = false;

      if (showingTasks) {
        var subItems = subItem.querySelectorAll('.tutorial-map__sub-sub-item');
        childMatch = Array.prototype.reduce.call(subItems, function(prevValue, subItem) {
          var match = checkLiMatch(subItem);
          subItem.hidden = !match;
          return prevValue || match;
        }, false);
      }

      var match = childMatch || checkLiMatch(subItem);
      //console.log(subItem, match);
      subItem.hidden = !match;

      return prevValue || match;
    }, false);

    li.hidden = !(childMatch || checkLiMatch(li));

  }

};


TutorialMap.prototype.throttleFilter = throttle(TutorialMap.prototype.filter, 200);
delegate.delegateMixin(TutorialMap.prototype);


function isSubSequence(str1, str2) {
  var i = 0;
  var j = 0;
  while (i < str1.length && j < str2.length) {
    if (str1[i] == str2[j]) {
      i++;
      j++;
    } else {
      i++;
    }
  }
  return j == str2.length;
}


module.exports = TutorialMap;
