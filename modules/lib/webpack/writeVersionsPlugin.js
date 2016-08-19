var fs = require('fs');

function WriteVersionsPlugin(file) {
  this.file = file;
}

WriteVersionsPlugin.prototype.writeStats = function(compiler, stats) {
  stats = stats.toJson();
  var assetsByChunkName = stats.assetsByChunkName;

  for (var name in assetsByChunkName) {
    if (assetsByChunkName[name] instanceof Array) {
      assetsByChunkName[name] = assetsByChunkName[name].map(function(path) {
        return compiler.options.output.publicPath + path;
      });
    } else {
      assetsByChunkName[name] = compiler.options.output.publicPath + assetsByChunkName[name];
    }
  }

  //console.log(assetsByChunkName);
  fs.writeFileSync(this.file, JSON.stringify(assetsByChunkName));
};

WriteVersionsPlugin.prototype.apply = function(compiler) {
  compiler.plugin("done", this.writeStats.bind(this, compiler));
};

module.exports = WriteVersionsPlugin;