const mongoose = require('lib/mongoose');

exports.boot = function*() {

  if (process.env.NODE_ENV == 'production') {
    yield function(callback) {
      mongoose.waitConnect(callback);
    };
  }

  /* in ebook no elasticsearch, so I don't boot it here
   var elastic = elasticClient();
   yield elastic.ping({
   requestTimeout: 1000
   });
   */
};


exports.close = function*() {
  yield function(callback) {
    mongoose.disconnect(callback);
  };
};
