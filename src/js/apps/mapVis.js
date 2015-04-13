define([
  'd3',
  'topojson',
  'queue',
  'underscore',
  'jquery',

  './template'
], function(d3, topojson, queue, _, $, template) {


  var _options = {
    width: 960,
    height: 600,

    color_range: [d3.rgb(240,240,240),d3.rgb(29,145,145)],

    scroll_x: 200,
    scroll_y: 520,
    scroll_width: 600,
    scroll_height: 25

  }

  var beer_icon = {
    path_attr: {
      d: "M7.947-3.325H7.036c-0.188,0-0.37,0.019-0.548,0.052V-5.33c0-0.112-0.013-0.221-0.033-0.327 C7.054-6.1,7.446-6.805,7.446-7.605c0-1.49-1.372-2.685-2.883-2.386c-0.5-0.526-1.213-0.823-1.946-0.786 c-0.468-0.678-1.247-1.098-2.078-1.098c-0.675,0-1.313,0.268-1.783,0.734c-0.125-0.051-0.253-0.092-0.383-0.122l-0.164-0.032 c-0.126-0.02-0.252-0.031-0.381-0.033c-0.189-0.015-0.371-0.014-0.55,0.001h-0.049v0.004c-1.074,0.108-1.979,0.744-2.334,1.631 C-6.16-9.492-6.96-8.563-6.96-7.453c0,0.775,0.39,1.458,0.982,1.87C-5.99-5.5-6.003-5.417-6.003-5.33V6.979 c0,0.905,0.736,1.642,1.641,1.642h9.208c0.905,0,1.642-0.736,1.642-1.642V4.465c0.178,0.033,0.36,0.053,0.548,0.053h0.911 c1.659,0,3.009-1.351,3.009-3.01v-1.822C10.956-1.974,9.606-3.325,7.947-3.325z M5.393,6.979c0,0.302-0.244,0.547-0.547,0.547 h-9.208c-0.302,0-0.547-0.245-0.547-0.547V-5.33c0-0.302,0.245-0.547,0.547-0.547h9.208c0.303,0,0.547,0.245,0.547,0.547 C5.393-5.33,5.393,6.979,5.393,6.979z M5.88-6.595L5.88-6.595C5.598-6.827,5.24-6.972,4.846-6.972h-9.208 c-0.417,0-0.793,0.161-1.083,0.417c-0.256-0.217-0.421-0.537-0.421-0.898c0-0.651,0.529-1.182,1.181-1.184l0.448-0.002 l0.087-0.439c0.102-0.514,0.635-1.057,1.452-1.152h0.603c0.245,0.017,0.481,0.097,0.689,0.234l0.452,0.299l0.303-0.449 c0.268-0.397,0.713-0.635,1.191-0.635c0.556,0,1.05,0.315,1.292,0.823l0.184,0.387l0.42-0.086C3.007-9.772,3.59-9.533,3.914-9.06 l0.239,0.352l0.4-0.147c0.161-0.059,0.312-0.088,0.461-0.088c0.737,0,1.338,0.6,1.338,1.338C6.352-7.2,6.166-6.84,5.88-6.595z  M9.315,1.508c0,0.754-0.613,1.368-1.368,1.368H7.036c-0.195,0-0.38-0.042-0.548-0.116v-4.326C6.656-1.64,6.841-1.682,7.036-1.682 h0.911c0.754,0,1.368,0.613,1.368,1.368V1.508z"
    },
    rect_attr: {
      x:-4.362, y:-3.872, width:9.21, height:10.851
    }
  }

  
  function MapVis(canvas, options) {
    var _this = this;
    this.options = _.extend(_options, options)
    this.canvas = canvas || d3.select('body');
    this.svg = this.canvas.append('svg')
        .attr({
          class: "map",
          width:this.options.width, 
          height:this.options.height
        });
    this.svg_overlay = this.canvas.append('svg')
        .attr({
          class: "map overlay",
          width:this.options.width, 
          height:this.options.height
        });

    this.path = d3.geo.path();
    this.color = d3.scale.linear().range(this.options.color_range);  
    this.scale = d3.scale.linear().range([0.5, 5]);
    this.scrollScale = d3.scale.linear().range([0, this.options.scroll_width]);

    this.gradient = this.svg.append("svg:defs")
        .append("svg:linearGradient")
        .attr("id", "rating-gradient")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "0%");

    this.gradient.append("svg:stop")
        .attr("offset", "0%")
        .attr("stop-color", this.options.color_range[0])
        .attr("stop-opacity", 1);

    this.gradient.append("svg:stop")
        .attr("offset", "100%")
        .attr("stop-color", this.options.color_range[1])
        .attr("stop-opacity", 1);
    
    queue()
        .defer(d3.json, "js/json/us.json")
        .defer(d3.json, "js/json/state_brew.json")
        .await(function() { 
          _this.drawMap.apply(_this, arguments); 
        });
    

  }

  MapVis.prototype.drawMap = function(err, us, sb) {
    var _this = this;
    this._sb = sb;
    this.sb = sb.slice(0);
    x = this.s = {};
    var max = d3.max(_this.sb, function(d){ return d.ravg}),
        min = d3.min(_this.sb, function(d){ return d.ravg}),
        max_beer = d3.max(_this.sb, function(d) { return d.beer_count}),
        min_beer = d3.min(_this.sb, function(d) { return d.beer_count}),
        us_topo = topojson.feature(us, us.objects.states).features;
    this.color.domain([min,max]);
    this.scale.domain([min_beer,max_beer]);
    this.scrollScale.domain([0,5]);

    var states_group, states, states_overlay, beers_group, beers, beer, popup, scroll_group, scroll, main_axis, curr_axis,main_axis_group,curr_axis_group;


    states_group = this.svg.append('svg:g');
    this.states = states = states_group.selectAll("path")
        .data(us_topo);
    states.enter().append("path")
        .attr("d", this.path)
        .attr("class", function(d, i) { return "state-boundary state-boundary-"+i})
        .style("fill", function(d, i){
          return _this.color(_this.sb[i].ravg);
        })
      .append("title").text(function(d){return d.id});

    beers_group = this.svg.append('svg:g');
    this.beers = beers = beers_group.selectAll('.beer-icon')
        .data(us_topo);
    beer = beers.enter().append("g")
        .attr("class", "beer-icon")
    beer.append("path")
        .attr(beer_icon.path_attr)
        .attr("transform", function(d, i){ return transformBeer.call(_this, d, i, _this.sb); });
    beer.append("rect")
        .attr(beer_icon.rect_attr)
        .attr("transform", function(d, i){ return transformBeer.call(_this, d, i ,_this.sb); });

    popup = this.canvas.append("div").attr("class", "map-popup-holder");

    states_overlay = this.svg_overlay.selectAll("path")
        .data(us_topo)
    states_overlay.enter().append("path")
        .attr("d", this.path)
        .attr("class", "state-boundary overlay")
        .on('mouseover', function(d, i){
          states_group.select(".state-boundary-"+i).style("fill","#E2BF5A");
          var centroid = _this.path.centroid(d),

          //Data input
              _data = {
                title: _this.sb[i].name,
                ravg: Math.round(_this.sb[i].ravg*100)/100,
                beer_count: _this.sb[i].beer_count,
                beers: _this.sb[i].beers
              }


          template.activateMapPopup(popup, centroid[0], centroid[1], _data);
        })
        .on('mouseout', function(d,i) {
          states_group.select(".state-boundary-"+i).style("fill",function(){
            return _this.color(_this.sb[i].ravg);
          });
          template.deactivateMapPopup();
        });

    scroll_group = this.svg_overlay.append('svg:g')
        .attr("transform", "translate("+this.options.scroll_x+","+this.options.scroll_y+")");
    scroll_group.append('svg:rect')
        .attr("width", this.options.scroll_width)
        .attr("height", this.options.scroll_height)
        .attr("class", "scroll-background");
    scroll = scroll_group.append('svg:rect')
        .attr("transform", "translate("+this.scrollScale(min)+",0)")
        .attr("width", this.scrollScale(max-min))
        .attr("height", this.options.scroll_height)
        .attr("class", "scroll")
        .style("fill", "url('#rating-gradient')");
    main_axis = d3.svg.axis()
        .scale(this.scrollScale)
        .orient("bottom")
        .tickSize(this.options.scroll_height)
        .tickValues([0,1,2,3,4,5]);
    curr_axis = d3.svg.axis()
        .scale(this.scrollScale)
        .orient("bottom")
        .tickSize(this.options.scroll_height)
        .tickValues([min,max]);
    main_axis_group = scroll_group.append("svg:g").attr("class","main-axis");
    curr_axis_group = scroll_group.append("svg:g").attr("class","curr-axis");
    main_axis_group.call(main_axis);
    curr_axis_group.call(curr_axis);

    for(var i=0; i<sb.length; i++) {
      queue()
        .defer(d3.json, 'js/json/states/'+sb[i].name+'/brew_style.json')
        .await(function(err, bb){
          if(!err) {
            _this.s[bb.name] = bb;

          } else {
            console.log(err);
          }
        });
    }

  }

  MapVis.prototype.redrawMap = function() {

  }

  function transformBeer(d, i, sb) {
    var centroid = this.path.centroid(d),
        scale = this.scale(sb[i].beer_count);

    return "translate(" + centroid[0] + "," + centroid[1] + ") scale(" + scale + ")";
  }


  return MapVis;
});