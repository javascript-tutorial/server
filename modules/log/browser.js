
// browserify-version
// supports standard methods, but no settings
module.exports = function() {

  var logger = {
    info: function() {
      this.isDebug && console.info.apply(console, arguments);
    },
    debug: function() {
      this.isDebug && console.debug.apply(console, arguments);
    },
    error: function() {
      this.isDebug && console.error.apply(console, arguments);
    }
  };

  return logger;


};
