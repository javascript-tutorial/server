let csvPath = require('path').resolve(__dirname, 'memory.csv');
let out = require('fs').createWriteStream(csvPath);

setInterval(function() {
  let time = Date.now();
  let memo = process.memoryUsage();
  out.write(
    time + ',' +
    memo.rss + ', ' +
    memo.heapTotal + ', ' +
    memo.heapUsed + '\n'
  );
}, 200);
