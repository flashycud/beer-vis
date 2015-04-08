define([
  'd3',
  'topojson',
  'underscore',
  'jquery'
], function(d3, topojson, _, $) {


  var _options = {
    width: 960,
    height: 500

  }
  
  function MapVis(svg, options) {
    options = _.extend(_options, options)
    svg = svg || d3.select('body').append('svg')
        .attr({
          width:options.width, 
          height:options.height
        });

    var path = d3.geo.path();

    d3.json("js/json/us.json", function(error, topology) {
      svg.append("path")
          .datum(topojson.feature(topology, topology.objects.land))
          .attr("d", path)
          .attr("class", "land-boundary");

      // svg.append("path")
      //     .datum(topojson.mesh(topology, topology.objects.counties, function(a, b) { return a !== b && (a.id / 1000 | 0) === (b.id / 1000 | 0); }))
      //     .attr("d", path)
      //     .attr("class", "county-boundary");

      svg.append("path")
          .datum(topojson.mesh(topology, topology.objects.states, function(a, b) { return a !== b; }))
          .attr("d", path)
          .attr("class", "state-boundary");
    });
  }

  return MapVis;
});