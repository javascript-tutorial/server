if (process.env.NODE_LANG !== 'en') {
  require('moment/locale/' + process.env.NODE_LANG);
}

module.exports = require('moment');
