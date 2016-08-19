var notification = require('client/notification');
var getCsrfCookie = require('client/getCsrfCookie');
// Wrapper about XHR
// # Global Events
// triggers document.loadstart/loadend on communication start/end
//    --> unless options.noGlobalEvents is set
//
// # Events
// triggers fail/success on load end:
//    --> by default status=200 is ok, the others are failures
//    --> options.normalStatuses = [201,409] allow given statuses
//    --> fail event has .reason field
//    --> success event has .result field
//
// # JSON
//    --> send(object) calls JSON.stringify
//    --> adds Accept: json (we want json) by default, unless options.raw
// if options.json or server returned json content type
//    --> autoparse json
//    --> fail if error
//
// # CSRF
//    --> requests sends header X-XSRF-TOKEN from cookie

function xhr(options) {

  var request = new XMLHttpRequest();

  var method = options.method || 'GET';

  var body = options.body;
  var url = options.url;

  request.open(method, url, options.sync ? false : true);

  request.method = method;

  // token/header names same as angular $http for easier interop
  var csrfCookie = getCsrfCookie();
  if (csrfCookie && !options.skipCsrf) {
    request.setRequestHeader("X-XSRF-TOKEN", csrfCookie);
  }

  if ({}.toString.call(body) == '[object Object]') {
    // must be OPENed to setRequestHeader
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    body = JSON.stringify(body);
  }

  if (!options.noDocumentEvents) {
    request.addEventListener('loadstart', event => {
      request.timeStart = Date.now();
      var e = wrapEvent('xhrstart', event);
      document.dispatchEvent(e);
    });
    request.addEventListener('loadend', event => {
      var e = wrapEvent('xhrend', event);
      document.dispatchEvent(e);
    });
    request.addEventListener('success', event => {
      var e = wrapEvent('xhrsuccess', event);
      e.result = event.result;
      document.dispatchEvent(e);
    });
    request.addEventListener('fail', event => {
      var e = wrapEvent('xhrfail', event);
      e.reason = event.reason;
      document.dispatchEvent(e);
    });
  }

  if (!options.raw) { // means we want json
    request.setRequestHeader("Accept", "application/json");
  }

  request.setRequestHeader('X-Requested-With', "XMLHttpRequest");

  var normalStatuses = options.normalStatuses || [200];

  function wrapEvent(name, e) {
    var event = new CustomEvent(name);
    event.originalEvent = e;
    return event;
  }

  function fail(reason, originalEvent) {
    var e = wrapEvent("fail", originalEvent);
    e.reason = reason;
    request.dispatchEvent(e);
  }

  function success(result, originalEvent) {
    var e = wrapEvent("success", originalEvent);
    e.result = result;
    request.dispatchEvent(e);
  }

  request.addEventListener("error", e => {
    fail("Ошибка связи с сервером.", e);
  });

  request.addEventListener("timeout", e => {
    fail("Превышено максимально допустимое время ожидания ответа от сервера.", e);
  });

  request.addEventListener("abort", e => {
    fail("Запрос был прерван.", e);
  });

  request.addEventListener("load", e => {
    if (!request.status) { // does that ever happen?
      fail("Не получен ответ от сервера.", e);
      return;
    }

    if (normalStatuses.indexOf(request.status) == -1) {
      fail("Ошибка на стороне сервера (код " + request.status + "), попытайтесь позднее.", e);
      return;
    }

    var result = request.responseText;
    var contentType = request.getResponseHeader("Content-Type");
    if (contentType.match(/^application\/json/) || options.json) { // autoparse json if WANT or RECEIVED json
      try {
        result = JSON.parse(result);
      } catch (e) {
        fail("Некорректный формат ответа от сервера.", e);
        return;
      }
    }

    success(result, e);
  });

  // defer to let other handlers be assigned
  setTimeout(function() {
    request.send(body);
  }, 0);

  return request;

}


document.addEventListener('xhrfail', function(event) {
  new notification.Error(event.reason);
});


module.exports = xhr;
