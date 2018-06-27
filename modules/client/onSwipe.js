function onSwipe(elem, options) {

  options = options || {};

  let startX,
      startY,
      dist,
      onRight = options.onRight || function() {},
      onLeft = options.onLeft || function(){},
      tolerance = options.tolerance || 50, // maximum vertical distance
      threshold = options.threshold || 150, //required min distance traveled to be considered swipe
      allowedTime = options.allowedTime || 500, // maximum time allowed to travel that distance
      elapsedTime,
      startTime;

  elem.addEventListener('touchstart', function(e) {
    let touchobj = e.changedTouches[0];
    dist = 0;
    startX = touchobj.pageX;
    startY = touchobj.pageY;
    //console.log("start", startX, startY);
    startTime = Date.now(); // record time when finger first makes contact with surface
  });

  elem.addEventListener('touchend', function(e) {
    let touchobj = e.changedTouches[0];
    dist = touchobj.pageX - startX; // get total dist traveled by finger while in contact with surface
    elapsedTime = Date.now() - startTime; // get time elapsed

    //console.log("end", touchobj.pageX, touchobj.pageY);

    // too much up/down
    if (Math.abs(touchobj.pageY - startY) > tolerance) return;

    //console.log("time", elapsedTime, allowedTime);

    // too slow
    if (elapsedTime > allowedTime) return;

    let insideScrollable = false;
    let elem = e.target;
    while(elem != document.body) {
      if (elem.scrollWidth > elem.clientWidth) {
        insideScrollable = true;
        break;
      }
      elem = elem.parentElement;
    }

    if (insideScrollable) return;

    //console.log("threshold", dist, threshold);

    if (dist > threshold) {
      //console.log("right");
      onRight(e);
    }

    if (dist < -threshold) {
      //console.log("left");
      onLeft(e);
    }
  });

}

module.exports = onSwipe;
