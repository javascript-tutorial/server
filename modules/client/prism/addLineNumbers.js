
function addLineNumbers(pre) {

  let linesNum = (1 + pre.innerHTML.split('\n').length);
  let lineNumbersWrapper;

  let lines = new Array(linesNum);
  lines = lines.join('<span></span>');

  lineNumbersWrapper = document.createElement('span');
  lineNumbersWrapper.className = 'line-numbers-rows';
  lineNumbersWrapper.innerHTML = lines;

  if (pre.hasAttribute('data-start')) {
    pre.style.counterReset = 'linenumber ' + Number(pre.dataset.start) - 1;
  }

  pre.appendChild(lineNumbersWrapper);
}


module.exports = addLineNumbers;
