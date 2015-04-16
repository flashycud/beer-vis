define(
[
  "jquery",
  "d3"
], 
function($, d3) {
  var template = $("#template"),
      map = $(".map-popup", template);

  function getTarget(target) {
    if(target instanceof d3.selection)
      return $(target[0]);
    else if(target instanceof $)
      return target;
  }

  return {
    activateMapPopup: function(target,x,y, data) {
      target = getTarget(target);
      var style = (data.style == undefined)? "All styles": data.style;
      $('.title', map).html(data.title);
      $('.ravg', map).html(data.ravg);
      $('.style', map).html(style);
      $('.count', map).html(data.beer_count + ((data.beer_count>1)? " beers":" beer"));

      if (data.beers) {
        var beer_list = _.reduce(data.beers, function(beer) {

        });
        $('.beers', map).html()
      }
      target.css({
        top: y -150,
        left: x-150
      })
      target.append(map);
    },
    deactivateMapPopup: function() {
      template.append(map);
    }
  }

});