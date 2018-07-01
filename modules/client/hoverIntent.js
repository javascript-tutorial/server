
let lastPageX = Infinity, lastPageY = Infinity, lastTime = Date.now();

let elementOver;

let elementHoverOver;

let speedTolerance = 0.2;

let handlers = {};

function hoverIntent(selector, over, out) {
  handlers[selector] = {over: over, out: out};
}


document.addEventListener('mousemove', mousemove);
document.addEventListener('mouseout', mouseout);

function mousemove(event) {
  if (elementHoverOver) return;

  let distance = Math.sqrt(Math.pow(event.pageX - lastPageX, 2) + Math.pow(event.pageY - lastPageY, 2));
  let speed = distance / (Date.now() - lastTime);

  // slow down => call over(), get the element of interest,
  // then out() when leaving it
  if (speed < speedTolerance) {
    //console.log("speed", speed);
    let elem = document.elementFromPoint(event.clientX, event.clientY);
    if (!elem) return; // the coords are out of window (happens)
    if (elem != elementOver) {
      for (let selector in handlers) {
        let closest = elem.closest(selector);
        if (closest) {
          //console.log("over ", closest);
          elementHoverOver = { elem: closest, out: handlers[selector].out};
          handlers[selector].over(event);
        }
      }
      elementOver = elem;
    }
  }

  lastPageX = event.pageX;
  lastPageY = event.pageY;
  lastTime = Date.now();

}

function mouseout(event) {
  if (!elementHoverOver) return;

  let parent = event.relatedTarget;
  while(parent) {
    if (parent == elementHoverOver.elem) {
      //console.log("mouseout false", event.target, elementHoverOver.elem);
      // still under elementHoverOver
      return;
    }
    parent = parent.parentElement;
  }


  let out = elementHoverOver.out;
  elementHoverOver = null;
  out(event);

}

module.exports = hoverIntent;