/**
 * For new notification types extend Notification
 */

var delegate = require('client/delegate');

/**
 * Calculates translateY positions when notifications are added/removed
 */
class NotificationManager {

  constructor(options = {}) {
    this.notifications = [];
    this.verticalSpace = options.verticalSpace || 8;
  }

  register(notification) {
    this.notifications.unshift(notification);
    setTimeout(() => this.recalculate(), 20);
  }

  unregister(notification) {
    var idx = this.notifications.indexOf(notification);
    this.notifications.splice(idx, 1);
    this.recalculate();
  }

  recalculate() {
    var top = this.verticalSpace;
    this.notifications.forEach(notification => {
      notification.top = top;
      top += notification.height + this.verticalSpace;
    });
  }

}

var manager;

exports.init = function(options) {
  manager = new NotificationManager(options);
};


class Notification {

  constructor(html, type, timeout) {
    var elemHtml = `<div class="notification notification_popup notification_${type}">
    <div class="notification__content">${html}</div>
    <button title="Закрыть" class="notification__close"></button></div>`;

    document.body.insertAdjacentHTML("beforeEnd", elemHtml);

    this.elem = document.body.lastElementChild;

    switch(timeout) {
    case undefined:
      this.timeout = this.TIMEOUT_DEFAULT;
      break;
    case 'slow':
      this.timeout = this.TIMEOUT_SLOW;
      break;
    case 'fast':
      this.timeout = this.TIMEOUT_FAST;
      break;
    default:
      this.timeout = timeout;
    }


    manager.register(this);
    this.setupCloseHandler();
    this.setupCloseTimeout();
  }

  get TIMEOUT_DEFAULT() {
    return 2500;
  }

  get TIMEOUT_SLOW() {
    return 5000;
  }

  get TIMEOUT_FAST() {
    return 1500;
  }


  close() {
    if (!this.elem.parentNode) return; // already closed (by user click?)
    this.elem.remove();
    manager.unregister(this);
  }

  setupCloseHandler() {
    this.delegate('.notification__close', 'click', () => this.close());
  }

  setupCloseTimeout() {
    if (this.timeout) {
      setTimeout(() => this.close(), this.timeout);
    }
  }

  get height() {
    return this.elem.offsetHeight;
  }

  set top(value) {
    this.elem.style.transform = 'translateY(' + value + 'px)';
  }

}

delegate.delegateMixin(Notification.prototype);


class Info extends Notification {

  constructor(html, timeout) {
    super(html, 'info', timeout);
  }

}

exports.Info = Info;

class Warning extends Notification {

  constructor(html, timeout) {
    super(html, 'warning', timeout);
  }

}

exports.Warning = Warning;

class Success extends Notification {

  constructor(html, timeout) {
    super(html, 'success', timeout);
  }

}

exports.Success = Success;

export class Error extends Notification {

  constructor(html, timeout) {
    super(html, 'error', timeout);
  }


  get TIMEOUT_DEFAULT() {
    return 5000;
  }


}

exports.Error = Error;

/*
export class Test extends Notification {

  constructor(html) {
    super(html, 'error');
  }


  get TIMEOUT_DEFAULT() {
    return null;
  }


}

exports.Test = Test;
*/