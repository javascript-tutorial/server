'use strict';

module.exports = function ucWordStart(cityOrCountry) {
  if (!cityOrCountry) return cityOrCountry;

  return cityOrCountry.trim().toLowerCase().replace(/(^| |-)./g, function(match) {
    return match.toUpperCase();
  });
};
