/**
 * This file must be required at least ONCE.
 * After it's done, one can use require('mongoose')
 *
 * In web-app: this is done at init phase
 * In tests: in mocha.opts
 * In gulpfile: in beginning
 */

var mongoose = require('mongoose');
mongoose.Promise = Promise;

var path = require('path');
var fs = require('fs');
var log = require('log')();
var autoIncrement = require('mongoose-auto-increment');
var ValidationError = require('mongoose/lib/error').ValidationError;
var ValidatorError = require('mongoose/lib/error').ValidatorError;

var config = require('config');
var _ = require('lodash');


if (process.env.MONGOOSE_DEBUG) {
  mongoose.set('debug', true);
  log.debug(config.mongoose.uri, config.mongoose.options);
}


mongoose.connect(config.mongoose.uri, config.mongoose.options);

if (process.env.MONGOOSE_DEBUG) {
  mongoose.connection.emit = function(event) {
    console.log("Mongoose connection: ", event);
    return require('events').EventEmitter.prototype.emit.apply(this, arguments);
  };
}

autoIncrement.initialize(mongoose.connection);

// bind context now for thunkify without bind
_.bindAll(mongoose.connection);
_.bindAll(mongoose.connection.db);

// plugin from https://github.com/LearnBoost/mongoose/issues/1859
// yield.. .persist() or .destroy() for generators instead of save/remove
// mongoose 3.10 will not need that (!)
mongoose.plugin(function(schema) {

  schema.methods.persist = function(body) {
    var model = this;

    return function(callback) {
      if (body) model.set(body);
      model.save(function(err, changed) {

        if (!err || err.code != 11000) {
          return callback(err, changed);
        }

        log.trace("uniqueness error", err);
        log.trace("will look for indexName in message", err.message);


        var indexName = err.message.match(/\$(\w+)/);
        indexName = indexName[1];

        model.collection.getIndexes(function(err2, indexes) {
          if (err2) return callback(err);

          // e.g. indexes = {idxName:  [ [displayName, 1], [email, 1] ] }

          // e.g indexInfo = [ [displayName, 1], [email, 1] ]
          var indexInfo = indexes[indexName];

          // convert to indexFields = { displayName: 1, email: 1 }
          var indexFields = {};
          indexInfo.forEach(function toObject(item) {
            indexFields[item[0]] = item[1];
          });

          var schemaIndexes = schema.indexes();

          //console.log("idxes:", schemaIndexes, "idxf", indexFields, schemaIndexes.find);
          var schemaIndex = null;

          for (var i = 0; i < schemaIndexes.length; i++) {
            if (_.isEqual(schemaIndexes[i][0], indexFields)) {
              schemaIndex = schemaIndexes[i];
              break;
            }
          }

          log.trace("Schema index which failed:", schemaIndex);

          var errorMessage;
          if (!schemaIndex) {
            // index exists in DB, but not in schema
            // strange
            // that's usually the case for _id_
            if (indexName == '_id_') {
              errorMessage = 'Id is not unique';
            } else {
              // non-standard index in DB, but not in schema? fix it!
              return callback(new Error("index " + indexName + " in DB, but not in schema"));
            }
          } else {
            // schema index object, e.g
            // { unique: 1, sparse: 1 ... }
            var schemaIndexInfo = schemaIndex[1];

            errorMessage = schemaIndexInfo.errorMessage || ("Index error: " + indexName);
          }

          var valError = new ValidationError(err);

          var field = indexInfo[0][0]; // if many fields in uniq index - we take the 1st one for error

          log.trace("Generating error for field", field, ':', errorMessage);

          // example:
          // err = { path="email", message="Email is not unique", type="notunique", value=model.email }
          valError.errors[field] = new ValidatorError({
            path: field,
            message: errorMessage,
            type: 'notunique',
            value: model[field]
          });

          valError.code = err.code; // if (err.code == 11000) in the outer code will still work

          // console.log(valError.errors, model.toObject());
          return callback(valError);
        });

      });
    };
  };
  schema.methods.destroy = function() {
    var model = this;

    return function(callback) {
      model.remove(callback);
    };
  };

  schema.statics.destroy = function(query) {
    return function(callback) {
      this.remove(query, callback);
    }.bind(this);
  };
});

mongoose.waitConnect = function(callback) {
  if (mongoose.connection.readyState == 1) {
    setImmediate(callback);
  } else {
    // we wait either for an error
    // OR
    // for a successful connection
    //console.log("MONGOOSE", mongoose, "CONNECTION", mongoose.connection, "ON", mongoose.connection.on);
    mongoose.connection.on("connected", onConnected);
    mongoose.connection.on("error", onError);
  }

  function onConnected() {
    log.debug("Mongoose has just connected");
    cleanUp();
    callback();
  }

  function onError(err) {
    log.debug('Failed to connect to DB', err);
    cleanUp();
    callback(err);
  }

  function cleanUp() {
    mongoose.connection.removeListener("connected", onConnected);
    mongoose.connection.removeListener("error", onError);
  }

};

module.exports = mongoose;
