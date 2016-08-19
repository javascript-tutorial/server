module.exports = function(res) {
  if (!res || !res.statusCode)
    return res;
  return {
    statusCode: res.statusCode,
    header:     res._header
  };
};

