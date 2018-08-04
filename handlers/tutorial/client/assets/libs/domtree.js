// ebook-converter removes CSS which styles SVG
// that's why I style here in JS

function drawHtmlTree(json, nodeTarget, w, h) {

  if (typeof nodeTarget == 'string') {
    nodeTarget = document.querySelectorAll(nodeTarget);
    nodeTarget = nodeTarget[nodeTarget.length - 1];
  }

  w = w || 960;
  h = h || 800;

  var i = 0,
    barHeight = 30,
    barWidth = 250,
    barMargin = 2.5,
    barRadius = 4,
    duration = 400,
    root;

  var tree, diagonal, vis;

  function update(source) {
    // Compute the flattened node list. TODO use d3.layout.hierarchy.
    var nodes = tree.nodes(root);
    // Compute the "layout".
    nodes.forEach(function(n, i) {
      n.x = i * barHeight;
    });

    // Update the nodes…
    var node = vis.selectAll("g.node")
      .data(nodes, function(d) {
        return d.id || (d.id = ++i);
      });

    var nodeEnter = node.enter().append("svg:g")
      .attr("class", "node")
      .attr("transform", function(d) {
        return "translate(" + (source.y0) + "," + (source.x0) + ")";
      })
      .style("opacity", 1e-6);

    // Enter any new nodes at the parent's previous position.
    nodeEnter.append("svg:rect")
      .attr("y", function () { return -barHeight / 2 + barMargin; })
      .attr("x", -5)
      .attr("rx",barRadius)
      .attr("ry",barRadius)
      .attr("height", barHeight-barMargin*2)
      .attr("width", barWidth)
      .style("fill", color)
      .style("cursor", "pointer")
      .on("click", click);


    nodeEnter.append("svg:text")
      .attr("dy", 4.5)
      .attr("dx", 3.5)
      .style('fill', 'black')
      .style("pointer-events", "none");


    nodeEnter.append("svg:text")
      .attr("dy", 4.5)
      .attr("dx", function(d) {
        return d.content ? 5.5 : 16.5;
      })
      .style('font', '14px Consolas, monospace')
      .style('fill', '#333')
      .style("pointer-events", "none")
      .text(function(d) {
        var text = d.name;
        if (d.content) {
          if (/^\s*$/.test(d.content)) {
            text += " " + d.content.replace(/\n/g, "↵").replace(/ /g, '␣');
          } else {
            text += " " + d.content;
          }
        }
        return text;
      });

    // Transition nodes to their new position.
    nodeEnter.transition()
      .duration(duration)
      .attr("transform", function(d, i) {
        return "translate(" + (d.y) + "," + (d.x) + ")";
      })
      .style("opacity", 1);

    node.transition()
      .duration(duration)
      .attr("transform", function(d) {
        return "translate(" + d.y + "," + (d.x) + ")";
      })
      .style("opacity", 1)
      .select("text")
      .text(function(d) {
        if (d.content) return "";
        if (d._children) {
          return "▸ ";
        } else {
          return "▾ ";
        }
      });

    // Transition exiting nodes to the parent's new position.
    node.exit().transition()
      .duration(duration)
      .attr("transform", function(d) {
        return "translate(" + source.y + "," + source.x + ")";
      })
      .style("opacity", 1e-6)
      .remove();

    // Update the links…
    var link = vis.selectAll("path.link")
      .data(tree.links(nodes), function(d) {
        return d.target.id;
      });

    // Enter any new links at the parent's previous position.
    link.enter().insert("svg:path", "g")
      .attr("class", "link")
      .style('fill', 'none')
      .style('stroke', '#BEC3C7')
      .style('stroke-width', '1px')
      .attr("d", function(d) {
        var o = {
          x: source.x0,
          y: source.y0
        };
        return diagonal({
          source: o,
          target: o
        });
      })
      .transition()
      .duration(duration)
      .attr("d", diagonal);

    // Transition links to their new position.
    link.transition()
      .duration(duration)
      .attr("d", diagonal);

    // Transition exiting nodes to the parent's new position.
    link.exit().transition()
      .duration(duration)
      .attr("d", function(d) {
        var o = {
          x: source.x,
          y: source.y
        };
        return diagonal({
          source: o,
          target: o
        });
      })
      .remove();

    // Stash the old positions for transition.
    nodes.forEach(function(d) {
      d.x0 = d.x;
      d.y0 = d.y;
    });
  }

  // Toggle children on click.

  function click(d) {
    if (d.children) {
      d._children = d.children;
      d.children = null;
    } else {
      d.children = d._children;
      d._children = null;
    }
    update(d);
  }

  function color(d) {
    return d.nodeType == 1 ? "#CEE0F4" :
      d.nodeType == 3 ? '#FFDE99' : '#CFCE95';
  }

  function drawTree(json) {

    tree = d3.layout.tree()
      .size([h, 100]);

    diagonal = function(d){
        var deltaX = 7;
        var deltaY = 0;
        var points = [
            "M", [d.source.y+deltaX, d.source.x+deltaY].join(","),
            "L", [d.source.y+deltaX, d.target.x+deltaY].join(","),
            "L", [d.target.y+deltaX, d.target.x+deltaY].join(","),
          ];
        return points.join("");
      };


    vis = d3.select(nodeTarget).append("svg:svg")
      .attr("width", w)
      .attr("height", h)
      .append("svg:g")
      .attr("transform", "translate(20,30)");

    json.x0 = 0;
    json.y0 = 0;
    update(root = json);
  }

  nodeTarget.innerHTML = "";

  drawTree(json);

}


function node2json(node) {
  var obj = {
        name: node.nodeName,
        nodeType: node.nodeType
  };

  if (node.nodeType != 1) {
        obj.content = node.data;
        return obj;
  }

  obj.children = [];
  for(var i=0; i<node.childNodes.length; i++) {
    obj.children.push( node2json(node.childNodes[i]) );
  }

  return obj;
}