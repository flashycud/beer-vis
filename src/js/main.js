define([
  'd3',
  'jquery',
  'underscore',
  // './apps/dataHandler',
  // './apps/parallelCoordinates'
  './apps/mapVis'

],
function(d3, $, _, /*DataHandler, ParallelCoordinates,*/ MapVis ) {

  var cur_style_lvl = 1,
      cur_style = '',
      cur_state = '';


  var mapVis = new MapVis(d3.select('#map-vis'),{
    color_range: [d3.rgb(204,226,228),d3.rgb(0,139 ,149)]
  });
  mapVis.registerUpdate(update);

  var wordVis;

  var barVis;
  
  $('#style').change(function(e){
    mapVis.redrawMap($(this).val());
  });


  function update(){
    cur_state = mapVis.getSelectedState();

    wordVis.updateWordCloud(cur_style_lvl, cur_style, cur_state);
    barVis.updateBars(cur_style_lvl, cur_style, cur_state);
    mapVis.updateMap(cur_style);

  }
});