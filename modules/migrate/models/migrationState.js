const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
  currentMigration: Number
});

var MigrationState = module.exports = mongoose.model('MigrationState', schema);
