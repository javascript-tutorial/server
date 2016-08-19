module.exports = function(request) {
  if (!request || !request.method) {
    return request;
  }
  return {
    method: request.method,
    url:    request.originalUrl
  };
};
