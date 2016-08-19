'use strict';

module.exports = function(schema, options) {
  options || (options = {});

  // Options
  let fields = {};
  let createdPath = options.createdPath || 'created';
  let modifiedPath = options.modifiedPath || 'modified';

  // Add paths to schema if not present
  if (!schema.paths[modifiedPath]) {
    fields[modifiedPath] = {
      type:  Date,
      index: true
    };
  }
  if (!schema.paths[createdPath]) {
    fields[createdPath] = {
      type:    Date,
      default: Date.now,
      index:   true
    };
  }
  schema.add(fields);

  // Update the modified timestamp on save
  schema.pre('save', function(next) {
    this[modifiedPath] = new Date();
    next();
  });
};
