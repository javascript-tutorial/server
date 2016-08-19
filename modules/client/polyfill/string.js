if (!String.prototype.startsWith) {
  String.prototype.startsWith = function(string) {
    var index = arguments.length < 2 ? 0 : arguments[1];

    return this.slice(index).indexOf(string) === 0;
  };
}

if (!String.prototype.endsWith) {
  String.prototype.endsWith = function(string) {
    var index = arguments.length < 2 ? this.length : arguments[1];
    var foundIndex = this.lastIndexOf(string);
    return foundIndex !== -1 && foundIndex === index - string.length;
  };
}

if (!String.prototype.includes) {
  String.prototype.includes = function(string, index) {
    if (typeof string === 'object' && string instanceof RegExp) throw new TypeError("First argument to String.prototype.includes must not be a regular expression");
    return this.indexOf(string, index) !== -1;
  };
}
