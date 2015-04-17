define([
  'd3',
  'jquery',
  'underscore',
  './apps/mapVis',
  './apps/treeVis',
  './apps/detailVis'
],
function(d3, $, _, MapVis, TreeVis, DetailVis) {

  var cur_style_lvl = 1,
      cur_style = '',
      cur_state = '';


  var mapVis = new MapVis(d3.select('#map-vis'),{
    color_range: [d3.rgb(204,226,228),d3.rgb(0,139 ,149)]
  });
  mapVis.registerUpdate(update);
  TreeVis(update);
  
  var updateDetailVis = DetailVis;

  var wordVis;

  var barVis;
  
  $('#style').change(function(e){
    mapVis.redrawMap($(this).val());
    update();
  });

  function update(){
    cur_state = mapVis.getSelectedState();

    // wordVis.updateWordCloud(cur_style_lvl, cur_style, cur_state);
    // barVis.updateBars(cur_style_lvl, cur_style, cur_state);
    mapVis.updateMap(cur_style);
    updateDetailVis(cur_style_lvl, cur_style, cur_state);

  }

});