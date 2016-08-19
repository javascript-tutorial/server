
function deTab(text) {
  // attacklab: Detab's completely rewritten for speed.
  // In perl we could fix it by anchoring the regexp with \G.
  // In javascript we're less fortunate.

  // expand first n-1 tabs
  text = text.replace(/\t(?=\t)/g, "  "); // attacklab: g_tab_width

  // replace the nth with two sentinels
  text = text.replace(/\t/g, "~A~B");

  // use the sentinel to anchor our regex so it doesn't explode
  text = text.replace(/~B(.+?)~A/g,
    function(wholeMatch, m1) {
      var leadingText = m1;
      var numSpaces = 2 - leadingText.length % 2;  // attacklab: g_tab_width

      // there *must* be a better way to do this:
      for (var i = 0; i < numSpaces; i++) leadingText += " ";

      return leadingText;
    }
  );

  // clean up sentinels
  text = text.replace(/~A/g, "  ");  // attacklab: g_tab_width
  text = text.replace(/~B/g, "");

  return text;
}

module.exports = function(text) {
  text = deTab(text);
  text += "\n";

  var r = {block: [], inline: []};
  var last = null;
  var newText = [];

  text.split("\n").forEach(function(line) {
    if (/^\s*\*!\*\s*$/.test(line)) { // only *!*
      if (last) {
        newText.push(line);
      } else {
        last = newText.length;
      }
    } else if (/^\s*\*\/!\*\s*$/.test(line)) { // only */!*
      if (last !== null) {
        r.block.push(last + '-' + (newText.length-1));
        last = null;
      } else {
        newText.push(line);
      }
    } else if (/\s*\*!\*\s*$/.test(line)) { // ends with *!*
      r.block.push(newText.length + '-' + newText.length);
      line = line.replace(/\s*\*!\*\s*$/g, '');
      newText.push(line);
    } else {
      newText.push("");
      var offset = 0;
      while(true) {
        var fromPos = line.indexOf('*!*');
        var toPos = line.indexOf('*/!*');
        if (fromPos != -1 && toPos != -1) {
          r.inline.push( (newText.length-1) + ':' + (offset+fromPos) + '-' + (offset+toPos-3) );
          newText[newText.length-1] += line.slice(0, toPos+4).replace(/\*\/?!\*/g, '');
          offset += toPos - 3;
          line = line.slice(toPos+4);
        } else {
          newText[newText.length-1] += line;
          break;
        }
      }
    }
  });

  if (last) {
    r.block.push( last + '-' + (newText.length-1) );
  }

  return {
    block: r.block.join(','),
    inline: r.inline.join(','),
    text: newText.join("\n").replace(/\s+$/, '')
  };

};
