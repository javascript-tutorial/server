/**
 * DISCLAIMER: Had to implement custom input reading,
 *
 * because both node-read and node-prompt had bugs on Windows-8.1
 * E.g. every input letter was double-printed
 * (and I really need starred * input for passwords)
 *
 */
var readline = require('readline');


/**
 * @param options object { message: what to ask?, hidden: true for passwords }
 * @param callback function Calls callback(null, result), no errors no matter what
 */
function readLine(options, callback) {

  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  setup();
  rl.question(options.message, function(result) {
    tearDown();
    callback(null, result);
  });

  function onReadable() {
    if (!options.hidden) return;
    hideInput();
  }

  function hideInput() {
    if (!rl.line) return; // happens on \n when the input is finished
    process.stdout.write("\033[2K\033[200D" + options.message + new Array(rl.line.length+1).join("*"));
  }


  function setup() {
    process.stdin.on("readable", onReadable);
  }

  function tearDown() {
    process.stdin.removeListener("readable", onReadable);
    rl.close();
  }

}

module.exports = readLine;
