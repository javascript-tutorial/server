let AWS = require('aws-sdk');
let config = require('config');

// logger: process.stdout to debug

AWS.config.update(config.aws);

module.exports = AWS;
