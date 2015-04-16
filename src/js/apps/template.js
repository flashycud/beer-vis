define(
[
  "jquery",
  "d3",
  "underscore"
], 
function($, d3, _) {
  var template = $("#template"),
      map = $(".map-popup", template),
      mapActivitedIndex;

  function getTarget(target) {
    if(target instanceof d3.selection)
      return $(target[0]);
    else if(target instanceof $)
      return target;
  }

  return {
    activateMapPopup: function(target,x,y, data) {
      target = getTarget(target);
      mapActivitedIndex = data.i;
      var style = (data.style == undefined)? "All styles": data.style;
      $('.title', map).html(data.title);
      $('.ravg', map).html((data.ravg)? data.ravg: "-");
      $('.style', map).html(style);
      $('.count', map).html(data.beer_count + ((data.beer_count>1)? " beers":" beer"));

      if (data.beers) {
        var beer_list = ""
        for(var i=0; i<Math.min(5,data.beers.length); i++){
          beer_list = beer_list + "<li><div>"+"</div><div class='beer-name'>" + data.beers[i].name + "</div></li>";
        }
        $('.beers', map).html(beer_list);
      }
      target.css({
        top: y -150,
        left: x-150
      })
      target.append(map);
    },
    deactivateMapPopup: function() {
      template.append(map);
      mapActivitedIndex = null;
    },
    getMapActivatedIndex: function(){
      return mapActivitedIndex;
    }
  }

});