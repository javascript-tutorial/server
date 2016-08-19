var csvPath = require('path').resolve(__dirname, 'memory.csv');
var out = require('fs').createWriteStream(csvPath);

setInterval(function() {
  var time = Date.now();
  var memo = process.memoryUsage();
  out.write(
    time + ',' +
    memo.rss + ', ' +
    memo.heapTotal + ', ' +
    memo.heapUsed + '\n'
  );
}, 200);
