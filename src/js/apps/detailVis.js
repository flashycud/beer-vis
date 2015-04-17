define([
  'd3',
  'd3tip',
  'radar',
  'wordcloud'
],

function (d3, d3tip,  Radar, Wordcloud) {
	

	/* Dummy global variables */
	var cur_style 		= "Ale";
	var cur_style_lvl	= 1;
	var cur_state		= "California";

	/* Global variables for radar chart */

	var data = [];
	var dataset = [];

	var	margin = {top: 20, right: 20, bottom: 20, left: 20},
	padding = {top: 60, right: 60, bottom: 120, left: 60},
	outerWidth = 660,
	outerHeight = 600;


	var raw_radar_data = [{
	    name: 'beer1', // optional can be used for styling
	    axes: [
	    {axis: "overall", value: 0}, 
	    {axis: "aroma", value: 0}, 
	    {axis: "appearance", value: 0},  
	    {axis: "taste", value: 0},  
	    {axis: "palate", value: 0}
	    ]
	}];

	var radardata = raw_radar_data;

	/* Global variables for word cloud */
	var fill = d3.scale.category20();
	var word_list = [];

	/* Initialize word cloud svg */
	var wordcloud_g = d3.select("body").append("svg")
	.attr("class", "wordcloud")
	.attr("width", 300)
	.attr("height", 300)
	.append("g")
	.attr("transform", "translate(150,150)")

	wordcloud_g.selectAll("text")
	.data(word_list)
	.enter().append("text")
	.style("font-size", function(d) { return d.size + "px"; })
	.style("font-family", "Impact")
	.style("fill", function(d, i) { return fill(i); })
	.attr("text-anchor", "middle")
	.attr("transform", function(d) {
		return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
	})
	.text(function() { return null; });


	 function drawWordCloud(words) {
	 	
	 	var texts = wordcloud_g.selectAll("text").data(words)
	 	
	 	texts.enter().append("text");
	 	
	 	texts.style("font-size", function(d) { return d.size + "px"; })
	 	.style("font-family", "Impact")
	 	.style("fill", function(d, i) { return fill(i); })
	 	.attr("text-anchor", "middle")
	 	.attr("transform", function(d) {
	 		return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
	 	})
	 	.text(function(d) { return d.text; });
	 }

	 function updateWordCloud(style_lvl, style, state, beername) {

	 	var command = "./js/apps/wordcloud.php?";
	 	if (style != null && style != '') {
	 		command += "&style="+style;
	 	}

	 	if (style_lvl != null && style_lvl != '') {
	 		command += "&style_lvl="+style_lvl;
	 	}

	 	if (state != null && state != '') {
	 		command += "&state="+state;
	 	}

	 	if (beername != null && beername != '') {
	 		command += "&beer="+beername;
	 	}

	    $.get(command, function(data) { // data is the thing that from php
	        $('#messages').empty(); // 
	        words = JSON.parse(data);

	        word_list = [];

	        for (var i = 0.; i < words.length; i++) {
	        	word_list.push([words[i]['keyword'], words[i]['count']]);
	        };

	    	// Smoothing
	    	var max = Number.NEGATIVE_INFINITY;
	    	var min = Number.POSITIVE_INFINITY;

	    	for (var i = 0; i < word_list.length; ++i) {
	    		max = (max < Number(word_list[i][1])) ? Number(word_list[i][1]) : max;
	    		min = (min > Number(word_list[i][1])) ? Number(word_list[i][1]) : min;
	    	}

	    	sqrtmap = d3.scale.sqrt()
	    	.domain([min,max])
	    	.range([10,50]);

	    	d3.layout.cloud().size([300, 300])
	    	.words(word_list.map(function(d) {
	    		return {text: d[0], size: sqrtmap(d[1])};
	    	}))
	    	.padding(5)
	    	.rotate(function() { return ~~(Math.random() * 2) * 90; })
	    	.font("Impact")
	    	.fontSize(function(d) { return d.size; })
	    	.on("end", drawWordCloud)
	    	.start();
	    });
	}


	/*
	 * Functions for bar chart
	 */

	$("input[type='radio']").click(function(){
		var radioValue = $("input[name='feature']:checked").val();
		if(radioValue){
			feature = radioValue;
			updateBars(cur_style_lvl, cur_style, cur_state);
			updateWordCloud(cur_style_lvl, cur_style, cur_state, null);
		}
	});	


	function dataTransform(data) {
		dataset = [];
		for (i = 0; i < data.length; i++) {
			var element = {}
			element.key = data[i].name;
			element.value = Number(data[i][feature]);
			element.abv = Number(data[i].abv);
			dataset.push(element);
		}
	}


	var feature = $("input[name='feature']:checked").val(),
	innerWidth = outerWidth - margin.left - margin.right,
	innerHeight = outerHeight - margin.top - margin.bottom,
	width = innerWidth - padding.left - padding.right,
	height = innerHeight - padding.top - padding.bottom;	


	// console.log(dataset.map(function(d) {return d.key; }));
	// console.log([1, width], 0.05)

	var x = d3.scale.ordinal()
	.domain(dataset.map(function(d) {return d.key; }))
	.rangeRoundBands([1, width], 0.05);

	var y = d3.scale.linear()
	.domain([d3.min(dataset, function(d) { return d.value; }),
		d3.max(dataset, function(d) { return d.value; })])
	.range([Math.floor(height*0.2), height*0.8]);

	var xAxis = d3.svg.axis()
	.scale(x)
	.orient('bottom')
	.ticks(dataset.length);

	var key = function(d) {
		return d.key;
	};

	var tip = d3tip()
	.attr('class', 'd3-tip')
	.offset([-10, 0])
	.html(function(d) {
		return "<strong>"+ d.key  +":</strong><br>ABV: <span style='color:red'>" +(d.abv)+ "</span>";
	})




	var svg = d3.select('body').select('.vis')
	.append('svg')
	.attr('width', outerWidth)
	.attr('height', outerHeight)
	.append('g')
	.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

	svg.call(tip);

	var g = svg.append('g')
	.attr('transform', "translate(" + padding.left + "," + padding.top + ")");

	g.append('g')
	.attr('class', 'axis')
	.attr('transform', 'translate(0, ' + (height + margin.bottom) + ')')
	.call(xAxis)
	.selectAll("text")  
	.style("text-anchor", "end")
	.attr("dx", "-.8em")
	.attr("dy", ".15em")
	.attr("transform", function(d) {
		return "rotate(-45)" 
	});


	g.selectAll('rect')
	.data(dataset, key)
	.enter()
	.append('rect')
	.attr('class', 'bar')
	.attr('height', function(d) { 
		return y(d.value); 
	})
	.attr('width', x.rangeBand())
	.attr('x', function(d, i) { 
		return x(d.key);
	})
	.attr('y', function(d) { return height - y(d.value)} )
	.attr('fill', '#ff7e47')

	g.selectAll('.label')
	.data(dataset, key)
	.enter()
	.append('text')
	.attr('class', 'label')
	.text(function(d) {
		return d.value;
	})
	.attr('text-anchor', 'end')
	.attr('x', function(d, i) {
		return x(d.key) + x.rangeBand()/2;
	})
	.attr('y', function(d) {
		return height - y(d.value) + margin.top;
	})


	function updateBars(style_lvl, style, state) {

		orderby = feature;

		var command = "./js/apps/beers.php?";
		if (style != null && style != '') {
			command += "&style="+style;
		}

		if (style_lvl != null && style_lvl != '') {
			command += "&style_lvl="+style_lvl;
		}

		if (state != null && state != '') {
			command += "&state="+state;
		}

		if (orderby != null && orderby != '') {
			command += "&orderby="+orderby;
		}

		console.log(command)

		$.get(command, function(data1) { // data is the thing that from php

		    // Update bar data
		    data = JSON.parse(data1);
		    
		    // Update radar chart data
		    radardata = raw_radar_data;

		    linearmap = d3.scale.linear()
		    .domain([4,5])
		    .range([1,5]);

		    for (var i = 0; i < data.length; i++) {
		    	var axes_dict = [];

		    	axes_dict.push({axis: "overall", value: linearmap(data[i]["overall"])});
		    	axes_dict.push({axis: "aroma", value: linearmap(data[i]["aroma"])});
		    	axes_dict.push({axis: "appearance", value: linearmap(data[i]["appearance"])});
		    	axes_dict.push({axis: "taste", value: linearmap(data[i]["taste"])});
		    	axes_dict.push({axis: "palate", value: linearmap(data[i]["palate"])});

		    	radardata.push({name: data[i]["name"], axes: axes_dict});

		    };

		});

	    var sortTimeout = setTimeout(function() {

	    	dataTransform(data);
	    		 // console.log(dataset)

			x.domain(dataset.map(function(d) { return d.key }));
			y.domain([d3.min(dataset, function(d) { return d.value; }),
				d3.max(dataset, function(d) { return d.value; })]);
			xAxis.scale(x)
			.ticks(dataset.length);

	        //Select all rects
	        var bars = g.selectAll('.bar').data(dataset, key);

			//Enter 
			bars.enter()
			.append('rect')
			.attr('class', 'bar')
			.attr('x', function(d, i) { 
				return width;
			})
			.attr('y', function(d) {
				return height - y(d.value);
			})
			.attr('height', function(d) {
				return y(d.value);
			})
			.attr('fill', '#ff7e47')
			.on('mouseover', function(d, i) {
				d3.select(this)
				.attr('fill', '#428bca');

				temp_list = [];
				temp_list.push(radardata[i+1]);
				RadarChart.draw(".chart-container", temp_list);
				updateWordCloud(null, null, null, radardata[i+1]['name'])

				tip.show(d);
			})
			.on('mouseout', function(d) {
				d3.select(this)
				.transition()
				.duration(250)
				.attr('fill', '#FF7E47');
				tip.hide(d);

				temp_list = [];
				temp_list.push(radardata[0]);
				RadarChart.draw(".chart-container", temp_list);
			})

			//Update
			bars.transition()
			.duration(500)
			.attr('x', function(d, i) { 
				return x(d.key);
			})
			.attr('y', function(d) {
				return height - y(d.value);
			})
			.attr('height', function(d) {
				return y(d.value);
			})
			.attr('width', x.rangeBand());

			//Exit
			bars.exit()
			.transition()
			.duration(500)
			.attr('x', width)
			.remove();
			
			//Select all labels
			var labels = g.selectAll('.label').data(dataset, key);

			//Enter
			labels.enter()
			.append('text')
			.attr('class', 'label')
			.text(function(d) {
				return d.value;
			})
			.attr('text-anchor', 'middle')
			.attr('x', function(d, i) {
				return width;
			})
			.attr('y', function(d) {
				return height - y(d.value) + margin.top;
			});

			//Update
			labels.transition()
			.duration(500)
			.text(function(d) {
				return d.value;
			})
			.attr('x', function(d, i) {
				return x(d.key) + x.rangeBand()/2;
			})
			.attr('y', function(d) {
				return height - y(d.value) + margin.top;
			});

			//Remove existing labels
			labels.exit()
			.remove();

			g.select('.axis')
			.transition()
			.duration(1000)
			.call(xAxis)
			.selectAll("text")  
			.style("text-anchor", "end")
			.attr("dx", "-.8em")
			.attr("dy", ".15em")
			.attr("transform", function(d) {
				return "rotate(-45)" 
			});		

		}, 100);		
	}

	/* External update function */
	function updateDetailVis(style_lvl, style, state) {
		// Update local variables
		var cur_style_lvl	= style_lvl;
		var cur_style 		= style;	
		var cur_state		= state;

		// Call local update functions
		updateBars(style_lvl, style, state);
		updateWordCloud(style_lvl, style, state, null);
		RadarChart.draw(".chart-container", raw_radar_data);
	}

	// updateBars(cur_style_lvl, cur_style, cur_state);

	return updateDetailVis;
	// // detailVis(1, "Ale", "California");
	// var updateDetailVis = detailVis();
	// updateDetailVis(3, "American IPA", "California");
});