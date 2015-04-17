define([
  'd3',
  'topojson',
  'queue',
  'underscore',
  'jquery',

  './template'
], function(d3, topojson, queue, _, $, template) {


  var _options = {
    width: 700,
    height: 600,

    color_range: [d3.rgb(240,240,240),d3.rgb(29,145,145)],

    scroll_x: 130,
    scroll_y: 420,
    scroll_width: 400,
    scroll_height: 20,

    transition_duration: 500,

    min_revs: 100

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

    var projection = d3.geo.albersUsa()
      .scale(880)
      .translate([350,200]);

    this.path = d3.geo.path().projection(projection);
    this.color = d3.scale.linear().range(this.options.color_range);  
    this.scale = d3.scale.linear().range([0.5, 5]);
    this.scrollScale = d3.scale.linear().domain([0,5]).range([0, this.options.scroll_width]);

    this.drag = d3.behavior.drag()
      .origin(function(d) { return d; })
      .on("dragstart", function(d) { dragstarted.call(this,d, _this); })
      .on("drag", function(d) { dragged.call(this,d, _this); })
      .on("dragend", function(d) { dragended.call(this,d, _this); });

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
        .defer(d3.json, "js/json/styles.json")
        .await(function() { 
          drawMapVis.apply(_this, arguments); 
          _this.updateFunction();
        });
    

  }

  function setMinMax() {
    this.max_beer = d3.max(this.sb, function(d) { return d.beer_count});
    this.min_beer = d3.min(this.sb, function(d) { return d.beer_count});

    if(this.max_beer <10) this.max_beer =10;

    this.color.domain([this.min_rating,this.max_rating]);
    this.scale.domain([this.min_beer,this.max_beer]);
  }

  function drawMapVis(err, us, sb, sl) {
    var _this = this, us_topo;

    //init data
    this._us = us;
    this._sb = sb;
    this._sl = sl;
    this.sb = sb.slice(0);
    this.s = {};
    this.style = undefined;
    this.selectedState = '';


    this.max_rating = d3.max(this.sb, function(d){ return d.ravg});
    this.min_rating = d3.min(this.sb, function(d){ return d.ravg});
    setMinMax.call(this);


    
    this.us_topo = us_topo = topojson.feature(us, us.objects.states).features;

    

    var states_group, states, states_overlay, beers_group, beers, beer, popup, scroll_group, scroll_group_overlay, scroll, main_axis, curr_axis,main_axis_group,curr_axis_group;

    // Map
    states_group = this.svg.append('svg:g');
    states = states_group.selectAll("path.state-boundary")
        .data(us_topo);
    states.enter().append("path")
        .attr("d", this.path)
        .attr("class", function(d, i) { return "state-boundary state-boundary-"+i})
        .style("fill", function(d, i){
          return _this.color(_this.sb[i].ravg);
        })
      .append("title").text(function(d){return d.id})

    // Beer icons
    beers_group = this.svg.append('svg:g');
    beers = beers_group.selectAll('.beer-icon')
        .data(us_topo);
    beer = beers.enter().append("g")
        .attr("class", "beer-icon")
        .attr("transform", function(d, i){ return transformBeer.call(_this, d, i, _this.sb); });
    beer.append("path")
        .attr(beer_icon.path_attr)
    beer.append("rect")
        .attr(beer_icon.rect_attr)

    // Hovering Popup
    popup = this.canvas.append("div").attr("class", "map-popup-holder");

    // Overlay
    states_overlay = this.svg_overlay.selectAll("path")
        .data(us_topo)
    states_overlay.enter().append("path")
        .attr("d", this.path)
        .attr("class", "state-boundary overlay")
        .on('mouseover', function(d, i){
          if(_this.sb[i].beer_count>0 && _this.selectedState == ''){
            states_group.select(".state-boundary-"+i).style("fill","#E2BF5A");
            var centroid = _this.path.centroid(d),
                _data = {
                  i: i,
                  title: _this.sb[i].name,
                  ravg: Math.round(_this.sb[i].ravg*100)/100,
                  style: _this.style,
                  beer_count: _this.sb[i].beer_count,
                  beers: _this.sb[i].beers
                }
            template.activateMapPopup(popup, centroid[0], centroid[1], _data);
          }
        })
        .on('mouseout', function(d,i) {
          if(_this.sb[i].beer_count>0 && _this.selectedState == ''){

            states_group.select(".state-boundary-"+i).style("fill",function(){
              return _this.color(_this.sb[i].ravg);
            });
          template.deactivateMapPopup();
          }
        })
        .on('click', function(d, i) {
          if(_this.updateFunction){
            if(_this.selectedState != '') {
              _this.selectedState = '';

              deselect.call(_this, i);
              template.deactivateMapPopup();

            } else if(_this.sb[i].beer_count>0 && _this.selectedState == '') {
              _this.selectedState = _this.sb[i].name;
              _this.updateFunction();
              select.call(_this, i);
              var centroid = _this.path.centroid(d),
                _data = {
                  i:i,
                  title: _this.sb[i].name,
                  ravg: Math.round(_this.sb[i].ravg*100)/100,
                  style: _this.style,
                  beer_count: _this.sb[i].beer_count,
                  beers: _this.sb[i].beers
                }
              template.activateMapPopup(popup, centroid[0], centroid[1], _data);
            }
          }
        });

    // Scroll 
    scroll_group = this.svg.append('svg:g')
        .attr("transform", "translate("+this.options.scroll_x+","+this.options.scroll_y+")");
    scroll_group_overlay = this.svg_overlay.append('svg:g')
        .attr("class", "control")
        .attr("transform", "translate("+(this.options.scroll_x-5)+","+(this.options.scroll_y-10)+")");
    

    scroll_group.append('svg:rect')
        .attr("width", this.options.scroll_width)
        .attr("height", this.options.scroll_height)
        .attr("class", "scroll-background");
    scroll = scroll_group.append('svg:rect')
        .attr("transform", "translate("+this.scrollScale(this.min_rating)+",0)")
        .attr("width", this.scrollScale(this.max_rating-this.min_rating))
        .attr("height", this.options.scroll_height)
        .attr("class", "scroll")
        .style("fill", "url('#rating-gradient')");
    main_axis = d3.svg.axis()
        .scale(this.scrollScale)
        .orient("bottom")
        .tickSize(this.options.scroll_height)
        .tickValues([0,1,2,3,4,5]);
    curr_axis = d3.svg.axis()
        .scale(this.currScrollScale)
        .orient("bottom")
        .tickSize(this.options.scroll_height)
        .tickValues([this.min_rating,this.max_rating]);
    main_axis_group = scroll_group.append("svg:g").attr("class","main-axis");
    curr_axis_group = scroll_group.append("svg:g").attr("class","curr-axis");
    main_axis_group.call(main_axis);
    curr_axis = curr_axis_group.append("g");
    curr_axis.append("line")
        .attr("class", "first")
        .attr("y2", this.options.scroll_height)
        .attr("transform", "translate(" + this.scrollScale(this.min_rating) + ",0)");
    curr_axis.append("polygon")
        .attr("class", "first")
        .attr("points", "-5.774,-10 0,0 5.774,-10")
        .attr("transform", "translate(" + this.scrollScale(this.min_rating) + ",0)");
    curr_axis.append("text")
        .attr("class", "first")
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "hanging")
        .attr("y", this.options.scroll_height + 2)
        .text(Math.round(_this.min_rating*100)/100)
        .attr("transform", "translate(" + this.scrollScale(this.min_rating) + ",0)");
    
    curr_axis.append("line")
        .attr("class", "second")
        .attr("y2", this.options.scroll_height)
        .attr("transform", "translate(" + this.scrollScale(this.max_rating) + ",0)");    
    curr_axis.append("polygon")
        .attr("class", "second")
        .attr("points", "-5.774,-10 0,0 5.774,-10")
        .attr("transform", "translate(" + this.scrollScale(this.max_rating) + ",0)");
    curr_axis.append("text")
        .attr("class", "second")
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "hanging")
        .attr("y", this.options.scroll_height + 2)
        .text(Math.round(_this.max_rating*100)/100)
        .attr("transform", "translate(" + this.scrollScale(this.max_rating) + ",0)");

    first_overlay = scroll_group_overlay.append('rect')
        .datum({x: this.scrollScale(this.min_rating)})
        .attr("class", "first")
        .attr("height", this.options.scroll_height + 10)
        .attr("width", 10)
        .attr("x", 0)
        .attr("y", 0)
        .attr("transform", "translate(" + this.scrollScale(this.min_rating) + ",0)")
        .style("fill", "none")
        .call(_this.drag);
    second_overlay = scroll_group_overlay.append('rect')
        .datum({x: this.scrollScale(this.max_rating)})
        .attr("class", "second")
        .attr("height", this.options.scroll_height + 10)
        .attr("width", 10)
        .attr("x", 0)
        .attr("y", 0)
        .attr("transform", "translate(" + this.scrollScale(this.max_rating) + ",0)")
        .style("fill", "none")
        .call(_this.drag);


    for(var i=0; i<sb.length; i++) {
      queue()
        .defer(d3.json, 'js/json/states/'+sb[i].name+'/state_styles.json')
        .await(function(err, bb){
          if(!err) {
            _this.s[bb.name] = bb.beers;
            // console.log(bb.name + " loaded");
          } else {
            console.log(err);
          }
        });
    }
    // queue()
    //   .defer(d3.json, 'js/')

    // Export module
    this.states = states;
    this.states_overlay = states_overlay;
    this.beers = beers;
    this.scroll = scroll;
    this.curr_axis_group = curr_axis_group;
    this.curr_axis = curr_axis;
    this.popup = popup;
    this.first_overlay = first_overlay;
    this.second_overlay = second_overlay;


  }

  MapVis.prototype.updateMap = function(style) {
    var all_str = "All styles";
    style = (style && style !='')? style: all_str;
    var _this = this,
        active_i = template.getMapActivatedIndex();

    _this.style = style;

    _this.sb.forEach(function(state, i, sb){
      // state.ravg = _this.s[state.name].brewery[0].ravg;
      // state.beer_count = _this.s[state.name].brewery[0].beer_count;
      if(style != all_str){
        var beer_map = (_this._sl[style].length>0)? _.map(_this._sl[style], function (style_name) { return _this.s[state.name][style_name]}) : _this.s[state.name][style],
            combined_beers = _.reduce(beer_map, function(mem, n) { return (n)? mem.concat(n):mem; }, []),
            beer_reduce = _.reduce(combined_beers, function(mem, beer) { 
              if(!(beer.name in mem.keys)) {
                mem.beers.push(beer);
                mem.keys[beer.name] = 1;
              }
              return mem; 
            }, {beers:[], keys:{}}),
            filtered_beers = (beer_reduce.beers>6)? _.filter(beer_reduce.beers, function(beer) { return beer.revs >= _this.options.min_revs}): beer_reduce.beers,
            sorted_beers = _.sortBy(filtered_beers, 'ravg'),
            ravg_filter = _.filter(beer_reduce.beers, function(beer) { return beer.ravg != '-'});

        state.beers = sorted_beers;
        state.beer_count = ravg_filter.length;
        state.ravg = Math.round((_.reduce(ravg_filter, function(mem, beer){ return mem+beer.ravg; }, 0.0))/state.beer_count*100)/100;

      } else {
        state.beers = [];
        state.beer_count = _this._sb[i].beer_count;
        state.ravg = _this._sb[i].ravg;
      
      }

      //map-popup
      if (i == active_i) {
        if(_this.selectedState != ''){
          var centroid = _this.path.centroid(_this.us_topo[i]),
            _data = {
              i:i,
              title: _this.sb[i].name,
              ravg: Math.round(_this.sb[i].ravg*100)/100,
              style: _this.style,
              beer_count: _this.sb[i].beer_count,
              beers: _this.sb[i].beers
            }
          template.activateMapPopup(_this.popup, centroid[0], centroid[1], _data);
        }
      }

    });

    this.max_rating = d3.max(this.sb, function(d){ return d.ravg});
    this.min_rating = d3.min(this.sb, function(d){ return d.ravg});

    this.redrawMap();
  }
  MapVis.prototype.registerUpdate = function(update_function) {
    this.updateFunction = update_function;
  }
  MapVis.prototype.getSelectedState = function() {
    return this.selectedState;
  }


  MapVis.prototype.redrawMap = function() {
    var _this = this,
        active_i = template.getMapActivatedIndex();

    setMinMax.call(_this);

    _this.states
      .transition().duration(_this.options.transition_duration)
        .style("fill", function(d, i) {
          if(i != active_i) {
            var _c;
            if (_this.sb[i].beer_count > 0)
              _c = _this.color(_this.sb[i].ravg);
            else
              _c = '#888'
            return _c;
          }
          return '#E2BF5A'
        });

    _this.beers
      .transition().duration(_this.options.transition_duration)
        .attr("transform", function(d, i){ return transformBeer.call(_this, d, i, _this.sb); })
        .style("opacity", function(d, i) {return (_this.sb[i].beer_count>0)? 1: 0});

    _this.redrawBar(true);
    _this.redrawScrollDrag();
  }

  MapVis.prototype.redrawBar = function(transit) {

    var _this = this,
        scroll = (transit)?_this.scroll.transition().duration(_this.options.transition_duration): _this.scroll,
        first_axis = (transit)?_this.curr_axis.selectAll('.first').transition().duration(_this.options.transition_duration): _this.curr_axis.selectAll('.first'),
        second_axis = (transit)?_this.curr_axis.selectAll('.second').transition().duration(_this.options.transition_duration): _this.curr_axis.selectAll('.second');

    if(_this.min_rating) {
      scroll
          .attr("transform", "translate("+_this.scrollScale(_this.min_rating)+",0)")
          .attr("width", _this.scrollScale(_this.max_rating-_this.min_rating))
          .style("opacity", 1);
    } else {
      scroll
          .style("opacity", 0);
    }

    if(_this.min_rating) {
      first_axis
          .attr("transform", "translate(" + _this.scrollScale(_this.min_rating) + ",0)")
          .style("opacity", 1);
      _this.curr_axis.select('text.first').text(Math.round(_this.min_rating*100)/100)
          .style("opacity", 1);
      second_axis
          .attr("transform", "translate(" + _this.scrollScale(_this.max_rating) + ",0)")  
          .style("opacity", 1);
      _this.curr_axis.select('text.second').text(Math.round(_this.max_rating*100)/100)
          .style("opacity", 1);
    } else {
      first_axis
          .style("opacity", 0);
      _this.curr_axis.select('text.first').text(Math.round(_this.min_rating*100)/100)
          .style("opacity", 0);
      second_axis
          .style("opacity", 0);
      _this.curr_axis.select('text.second').text(Math.round(_this.max_rating*100)/100)
          .style("opacity", 0);
    }
  }

  MapVis.prototype.redrawScrollDrag = function () {
    var _this = this;
    this.first_overlay
        .datum({x: this.scrollScale(this.min_rating)})
        .attr("transform", "translate(" + this.scrollScale(this.min_rating) + ",0)");
    this.second_overlay
        .datum({x: this.scrollScale(this.max_rating)})
        .attr("transform", "translate(" + this.scrollScale(this.max_rating) + ",0)");
  }

  function deselect(_i) {
    var _this = this;
    this.states
      .transition().duration(_this.options.transition_duration)
        .style("fill",function(d,i) {
          var _c;
            if (_this.sb[i].beer_count > 0)
              _c = _this.color(_this.sb[i].ravg);
            else
              _c = '#888'
            return _c;
        })
        .style("stroke",function(d,i) {
          return '#fff';
        })
        .style("opacity",function(d,i) {
          return 1;
        });
    this.states_overlay
      .transition().duration(_this.options.transition_duration)
        .style("stroke",function(d,i) {
          return 'none';
        });
    this.popup.style("z-index",0);
  }

  function select(_i) {
    var _this = this;
    this.states
      .transition().duration(_this.options.transition_duration)
        .style("fill",function(d,i) {
          if(i==_i) {
            return '#E2BF5A';
          }
          var _c;
          if (_this.sb[i].beer_count > 0)
            _c = _this.color(_this.sb[i].ravg);
          else
            _c = '#888'
          return _c;
        })
        .style("opacity",function(d,i) {
          return (i==_i)? 1: 0.6;
        });
    this.states_overlay
      .transition().duration(_this.options.transition_duration)
        .style("stroke",function(d,i) {
          return (i==_i)? '#000': 'none';
        });
    this.popup.style("z-index",1);
  }

  function transformBeer(d, i, sb) {
    var centroid = this.path.centroid(d),
        scale = this.scale(sb[i].beer_count);

    return "translate(" + centroid[0] + "," + centroid[1] + ") scale(" + scale + ")";
  }

  function dragstarted(d, _this) {
    d3.event.sourceEvent.stopPropagation();
    // d3.select(this).classed("dragging", true);
  }

  function dragged(d, _this) {
    if(d3.select(this).attr("class") == 'first') {
      _this.min_rating = _this.scrollScale.invert(d3.event.x);
      _this.min_rating = (_this.min_rating <= 0)? 0 : (_this.min_rating >= _this.max_rating)? _this.max_rating: _this.min_rating;
      d.x = (d3.event.x<=0)? 0: (d3.event.x>=_this.scrollScale(_this.max_rating))? _this.scrollScale(_this.max_rating): d3.event.x;
      d3.select(this).attr("transform", "translate(" + d.x + ",0)");
    }

    if(d3.select(this).attr("class") == 'second') {
      _this.max_rating = _this.scrollScale.invert(d3.event.x);
      _this.max_rating = (_this.max_rating >= 5)? 5 : (_this.min_rating >= _this.max_rating)? _this.min_rating: _this.max_rating;
      d.x = (d3.event.x<=_this.scrollScale(_this.min_rating))? _this.scrollScale(_this.min_rating): (d3.event.x>=_this.options.scroll_width)? _this.options.scroll_width: d3.event.x;
      d3.select(this).attr("transform", "translate(" + d.x + ",0)");
    }
    _this.redrawBar(false);
    _this.redrawMap();
  }

  function dragended(d, _this) {
  }


  return MapVis;
});