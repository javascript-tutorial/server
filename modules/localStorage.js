module.exports = class LocalStorage {
  constructor() {
    this.storage = Object.create(null);
  }

  set(key, value) {
    this.storage[key] = value;
  }

  get(key) {
    return this.storage[key];
  }

  has(key) {
    return (key in this.storage);
  }


  static instance() {
    if (!this._instance) {
      this._instance = new LocalStorage();
    }
    return this._instance;
  }

  async getOrGenerate(key, func, skipCache) {
    if (skipCache) return await func();

    if (!this.has(key)) {
      this.set(key, await func());
    }
    return this.get(key);
  }
};