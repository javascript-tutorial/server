
module.exports = function(source) {
  this.cacheable && this.cacheable();

  return source.replace(/^(.*?:hover)/gim, '.working-hover $1');

};
