'use strict';

const assert = require('assert');

module.exports = class TutorialTree {

  constructor() {
    this.tree = [];
    this.bySlugMap = Object.create(null);
  }

  bySlug(slug) {
    return this.bySlugMap[slug];
  }

  getSiblings(slug) {
    let entry = this.bySlug(slug);
    return entry.parent ? this.bySlug(entry.parent).children : this.tree;
  }

  getPrev(slug) {
    let entry = this.bySlug(slug);
    let parentChildren = entry.parent ? this.bySlug(entry.parent).children : this.tree;
    let idx = parentChildren.indexOf(slug);
    assert(idx >= 0);

    return idx == 0 ? null : parentChildren[idx - 1];
  }

  getNext(slug) {
    let entry = this.bySlug(slug);
    let parentChildren = entry.parent ? this.bySlug(entry.parent).children : this.tree;
    let idx = parentChildren.indexOf(slug);
    assert(idx >= 0);

    return idx == (parentChildren.length-1) ? null : parentChildren[idx + 1];
  }

  addToSlugMap(entry) {
    this.bySlugMap[entry.slug] = entry;
  }

  deleteFromSlugMap(slug) {
    delete this.bySlugMap[slug];
  }

  destroyTree(slug) {
    let entry = this.bySlug(slug);

    if (!entry) return;

    if (entry.children) {
      for (let childSlug of entry.children) {
        this.destroyTree(childSlug);
      }
    }

    this.deleteFromSlugMap(slug);

    let parentChildren = entry.parent ? this.bySlug(entry.parent).children : this.tree;
    let idx = parentChildren.indexOf(slug);

    assert(id >= 0);

    parentChildren.splice(idx, 1);
  }

  add(entry) {
    this.addToSlugMap(entry);
    let parentChildren = entry.parent ? this.bySlug(entry.parent).children : this.tree;
    let i = 0;
    while (i < parentChildren.length) {
      if (parentChildren[i].weight >= entry.weight) {
        break;
      }
      i++;
    }
    if (i === parentChildren.length) {
      parentChildren.push(entry.slug);
    } else {
      parentChildren.splice(i, 0, entry.slug);
    }
  }


  destroyAll() {
    for (let key in this.bySlugMap) {
      delete this.bySlugMap[key];
    }
    this.tree.length = 0;
  }

  static instance() {
    if (!this._instance) {
      this._instance = new TutorialTree();
    }
    return this._instance;
  }

};
