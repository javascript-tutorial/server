

function capitalizeKeys(obj) {
  if (Array.isArray(obj)) {
    return obj.map(capitalizeKeys);
  }

  var output = {};

  for (var key in obj) {
    var keyCapitalized = key.replace(/_(\w)/g, function(match, letter) {
      return letter.toUpperCase();
    });
    if (Object.prototype.toString.apply(obj[key]) === '[object Object]') {
      output[keyCapitalized] = capitalizeKeys(obj[key]);
    } else {
      output[keyCapitalized] = obj[key];
    }
  }
  return output;
}

module.exports = capitalizeKeys;
