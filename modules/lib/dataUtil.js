
var mongoose = require('mongoose');
var log = require('log')();
var co = require('co');
var thunk = require('thunkify');
var assert = require('assert');
var db;

function *createEmptyDb() {

  function *open() {

    if (mongoose.connection.readyState == 1) { // connected
      return mongoose.connection.db;
    }

    yield function(callback) {
      mongoose.connection.on('open', callback);
    };

    return mongoose.connection.db;
  }

  function *clearDatabase() {

    var collections = yield new Promise(function(resolve, reject) {
      db.listCollections().toArray(function(err, items) {
        if (err) return reject(err);
        resolve(items);
      });
    });

    var collectionNames = collections
      .map(function(collection) {
        //console.log(collection.name);
        //var collectionName = collection.name.slice(db.databaseName.length + 1);
        if (collection.name.indexOf('system.') === 0) {
          return null;
        }
        return collection.name;
      })
      .filter(Boolean);

    yield collectionNames.map(function(name) {
      log.debug("drop ", name);
      return function(callback) {
        db.dropCollection(name, callback);
      };
    });

  }

  // wait till indexes are complete, especially unique
  // required to throw errors
  function *ensureIndexes() {

    yield mongoose.modelNames().map(function(modelName) {
      var model = mongoose.models[modelName];
      return thunk(model.ensureIndexes.bind(model))();
    });

  }

  // ensure that capped collections are actually capped
  function *ensureCapped() {

    yield mongoose.modelNames().map(function(modelName) {
      var model = mongoose.models[modelName];
      var schema = model.schema;
      if (!schema.options.capped) return;

      return thunk(db.command)({convertToCapped: model.collection.name, size: schema.options.capped});
    });
  }

  log.debug("co");

  db = yield open();
  log.debug("open");

  yield clearDatabase();
  log.debug("clear");

  yield ensureIndexes();
  log.debug('indexes');

  yield ensureCapped();
  log.debug('capped');

}

// tried using pow-mongoose-fixtures,
// but it fails with capped collections, it calls remove() on them => everything dies
// so rolling my own tiny-loader
function *loadModels(data, options) {
  options = options || {};
  var modelsData = (typeof data == 'string') ? require(data) : data;

  var modelNames = Object.keys(modelsData);

  for(var modelName in modelsData) {
    var Model = mongoose.models[modelName];
    assert(Model);
    if (options.reset) {
      yield Model.destroy({});
    }
    yield* loadModel(Model, modelsData[modelName]);
  }
}

// load data into the DB, replace if _id is the same
function *loadModel(Model, data) {

  for (var i = 0; i < data.length; i++) {
    if (data[i]._id) {
      yield Model.destroy({_id: data[i]._id});
    }
    var model = new Model(data[i]);

    log.debug("persist", data[i]);
    try {
      yield model.persist();
    } catch (e) {
      if (e.name == 'ValidationError') {
        log.error("loadModel persist validation error", e, e.errors, model.toObject());
      }
      throw e;
    }
  }

  log.debug("loadModel is done");
}

exports.loadModels = loadModels;
exports.createEmptyDb = createEmptyDb;

/*
 Usage:
 co(loadModels('sampleDb'))(function(err) {
 if (err) throw err;
 mongoose.connection.close();
 });*/
