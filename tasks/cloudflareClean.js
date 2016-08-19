const gulp = require('gulp');
const request = require('co-request');
const config = require('config');
const co = require('co');
const args = require('yargs')
const log = require('log')();

function* cleanDomain(domain) {


  var params = {
    a:     "fpurge_ts",
    tkn:   config.cloudflare.apiKey,
    email: config.cloudflare.email,
    z:     domain,
    v:     1
  };

  return yield request.post({
    url:    config.cloudflare.url,
    form: params,
    json:   true
  });

}

module.exports = function(options) {

  var domains = options.domains;
  return function() {



    return co(function*() {

      for (var i = 0; i < domains.length; i++) {
        var domain = domains[i];

        log.info("Cloudfare clean", domain);
        var result = yield cleanDomain(domain);
        if (result.body.result != 'success') {
          log.error(result.body);
          //log.error(result.request);
          throw new Error("Could not clean cache");
        }
      }

    });

  };

};

