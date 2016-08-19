'use strict';

exports.render = function(elem) {
  if (!window.grecaptcha) {
    window.recaptchaCallback = onload;

    let script = document.createElement('script');
    script.src = "https://www.google.com/recaptcha/api.js?onload=recaptchaCallback&render=explicit";
    document.head.appendChild(script);
  } else {
    onload();
  }

  function onload() {
    grecaptcha.render(elem, {
      sitekey: window.RECAPTCHA_ID
    });
  }

};
