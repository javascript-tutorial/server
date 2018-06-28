const TutorialView = require('./tutorialView');

module.exports = class TutorialViewStorage {
  constructor() {
    this.storage = Object.create(null);
  }

  set(key, value) {
    this.storage[key] = value;
  }

  get(key) {
    return this.storage[key];
  }

  getAll() {
    return this.storage;
  }

  has(key) {
    return (key in this.storage);
  }

  clear() {
    for (let key in this.storage) {
      delete this.storage[key];
    }
  }

  static instance() {
    if (!this._instance) {
      this._instance = new TutorialViewStorage();
    }
    return this._instance;
  }

  serialize() {
    return {
      storage: this.storage
    };
  }

  load({storage}) {
    for(let key in this.storage) {
      delete this.storage[key];
    }

    for(let key in storage) {
      this.storage[key] = new TutorialView(storage[key]);
    }
  }

};