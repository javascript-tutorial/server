let host = process.env.MONGO_HOST || 'localhost';
let db = process.env.NODE_ENV == 'test' ? "js_test" : `js_${process.env.NODE_LANG}`;

module.exports = {
  uri: 'mongodb://' + host + "/" + db,
  options: {
    keepAlive: true,
    reconnectTries: 10,
    socketTimeoutMS: 10000,
    connectTimeoutMS: 10000,
    poolSize: 5,
    promiseLibrary: global.Promise
  }
};

