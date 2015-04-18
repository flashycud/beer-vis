define([
  'd3',
  'd3tip'
],
function (d3, d3tip){

var style;
var stylelevel;

function TreeVis(update_function) {

  

  var w = 600,
      h = 200,
      x = d3.scale.linear().range([0, w]),
      y = d3.scale.linear().range([0, h]);

  var vis = d3.select("#treeVis").append("div")
      .attr("class", "chart")
      .style("width", w + "px")
      .style("height", h + "px")
    .append("svg:svg")
      .attr("width", w)
      .attr("height", h);

  var partition = d3.layout.partition()
      .value(function(d) { return d.size; });

  var description;
  var tip = d3tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function(d) {
      if (d.name == 'Ale') {
        description='Ale is a type of beer brewed from malted barley<br> using a warm fermentation with a strain of brewers yeast.<br>Compared to lager yeasts, ale yeast ferments more quickly,<br> and often produces a sweeter, fuller-bodied and fruitier taste';}
      else if (d.name == 'Lager') {description='Lager is a type of beer that is fermented <br> and conditioned at low temperatures. <br>Pale lager is the most widely consumed and <br> commercially available style of beer in the world';}
      else if (d.name == 'Hybrid') {description='There are a few beer styles that are brewed <br> with methods common to lager brewing but fermented <br> with ale yeast and vice versa. <br>These are the styles that are sometimes <br>referred to as hybrid styles';}
      else {description = "";}
      return "<strong>"+ d.name  +"</strong> <br><span style='color:red'><strong>" +(d.value)+ "</strong></span> beers<br>"+description;
    })
   

  d3.json("js/json/style_w_count1.json", function(root) {

    var g = vis.selectAll("g")
        .data(partition.nodes(root))
      .enter().append("svg:g")
        .attr("transform", function(d) { return "translate(" + x(d.y) + "," + y(d.x) + ")"; })
        .on("click", click)
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide);
         
    g.call(tip);
    
    var kx = w / root.dx,
        ky = h / 1;

    var level = "";
    
    g.append("svg:rect")
        .attr("width", root.dy * kx)
        .attr("height", function(d) { return d.dx * ky; })
        .attr("class", function(d, i) { 

          if (d.name == 'Ale') {level='1'; description='Ale is a type of beer brewed from malted barley using a warm fermentation with a strain of brewers yeast'}
          if (d.name == 'Lager') {level='2';}
          if (d.name == 'Hybrid') {level='3';}
          
          return d.children ? "parent"+level : "child"+level; })
        ;

    g.append("svg:text")
        .attr("transform", transform)
        .attr("dy", ".35em")
        .style("opacity", function(d) { return d.dx * ky > 12 ? 1 : 0; })
        .text(function(d) { return d.name; });

     d3.selectAll("g")
      .on('dblclick', function(d) {

        style = d.name;
<<<<<<< HEAD
        stylelvl = d.depth;
=======
        stylelevel = d.depth;
>>>>>>> 5bd50bddeb556bb035cd20fb103feba017e975bf

        update_function();
    });

    function click(d) {
      if (!d.children) return;

      kx = (d.y ? w - 40 : w) / (1 - d.y);
      ky = h / d.dx;
      x.domain([d.y, 1]).range([d.y ? 40 : 0, w]);
      y.domain([d.x, d.x + d.dx]);

      var t = g.transition()
          .duration(d3.event.altKey ? 7500 : 750)
          .attr("transform", function(d) { return "translate(" + x(d.y) + "," + y(d.x) + ")"; });

      t.select("rect")
          .attr("width", d.dy * kx)
          .attr("height", function(d) { return d.dx * ky; });

      t.select("text")
          .attr("transform", transform)
          .style("opacity", function(d) { return d.dx * ky > 12 ? 1 : 0; });

      d3.event.stopPropagation();

      
    }

    function transform(d) {
      return "translate(8," + d.dx * ky / 2 + ")";
    }
  });
}

return {update: TreeVis, getStyle: function(){return style;}, getStyleLvl: function() { return stylelevel;}};
});
// TreeVis(function(){console.log()});