module.exports = {
  "uri":     "mongodb://localhost/" + (
    process.env.NODE_ENV == 'test' ? "js_test" : `js_${process.env.NODE_LANG}`
  ),
  "options": {
    "server": {
      "socketOptions": {
        "keepAlive": 1
      },
      "poolSize":      5
    }
  }
};

