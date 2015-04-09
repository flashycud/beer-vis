define([
  'd3',
  'topojson',
  'underscore',
  'jquery'
], function(d3, topojson, _, $) {


  var _options = {
    width: 960,
    height: 500,

    color_range: [d3.rgb(29,145,145), d3.rgb(196,196,196)]

  }
  
  function MapVis(svg, options) {
    options = _.extend(_options, options)
    svg = svg || d3.select('body').append('svg')
        .attr({
          width:options.width, 
          height:options.height
        });

    var path = d3.geo.path();

    var states;

    d3.json("js/json/us.json", function(error, topology) {
    // d3.json("us.json", function(error, topology) {

      states = svg.selectAll("path")
          .data(topojson.feature(topology, topology.objects.states).features)
        .enter().append("path")
          .attr("d", path)
          .attr("class", "state-boundary");
      console.log(topojson.feature(topology, topology.objects.states))
    });

    var color = setColorScale(options.color_range)
  }

  function setColorScale(color_range) {
    return d3.scale.linear().range(color_range);
  }

  return MapVis;
});