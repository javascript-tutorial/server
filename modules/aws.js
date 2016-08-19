var AWS = require('aws-sdk');
var config = require('config');

// logger: process.stdout to debug

AWS.config.update(config.aws);

module.exports = AWS;
