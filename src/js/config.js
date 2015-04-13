requirejs.config({
  baseUrl: 'js',
  paths: {
    app: 'main',
    d3: 'lib/d3/d3',
    topojson: 'lib/topojson/topojson',
    queue: 'lib/queue-async/queue',
    jquery: 'lib/jquery/dist/jquery',
    underscore: 'lib/underscore/underscore',
    text: 'lib/requirejs-text/text',
    json: 'lib/requirejs-plugins/src/json',
  }
});

require(['app']);