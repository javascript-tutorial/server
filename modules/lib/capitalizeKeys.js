

function capitalizeKeys(obj) {
  if (Array.isArray(obj)) {
    return obj.map(capitalizeKeys);
  }

  let output = {};

  for (let key in obj) {
    let keyCapitalized = key.replace(/_(\w)/g, function(match, letter) {
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
