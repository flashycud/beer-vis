define([
  'd3',
  'jquery',
  'underscore',
  // './apps/dataHandler',
  // './apps/parallelCoordinates'
  './apps/mapVis'

],
function(d3, $, _, /*DataHandler, ParallelCoordinates,*/ MapVis ) {

  var mapVis = new MapVis(d3.select('#map-vis'));
  
  $('#style').change(function(e){
    mapVis.redrawMap($(this).val());
  });


  function update(){
    var state = mapVis.getSelectedState(),
        style,
        style_level;

  }
});