const gulp = require('gulp');
const request = require('request-promise');
const config = require('config');
const args = require('yargs')
const log = require('log')();

async function cleanDomain(domain) {


  let params = {
    a:     "fpurge_ts",
    tkn:   config.cloudflare.apiKey,
    email: config.cloudflare.email,
    z:     domain,
    v:     1
  };

  return await request.post({
    url:    config.cloudflare.url,
    form: params,
    json:   true
  });

}

module.exports = function(options) {

  let domains = options.domains;
  return function() {


    return async function() {

      for (let i = 0; i < domains.length; i++) {
        let domain = domains[i];

        log.info("Cloudfare clean", domain);
        let result = await cleanDomain(domain);
        if (result.body.result != 'success') {
          log.error(result.body);
          //log.error(result.request);
          throw new Error("Could not clean cache");
        }
      }

    }();

  };

};

