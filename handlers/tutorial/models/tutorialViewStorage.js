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

  static instance() {
    if (!this._instance) {
      this._instance = new TutorialViewStorage();
    }
    return this._instance;
  }

};