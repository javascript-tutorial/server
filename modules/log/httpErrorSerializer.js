module.exports = function(httpError) {
  if (!httpError.status) {
    return httpError;
  }

  return {
    status: httpError.status,
    message: httpError.message
  };
};
