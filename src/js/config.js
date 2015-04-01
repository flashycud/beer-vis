requirejs.config({
  baseUrl: 'js',
  paths: {
    app: 'main',
    d3: 'lib/d3/d3',
    jquery: 'lib/jquery/dist/jquery',
    underscore: 'lib/underscore/underscore',
    text: 'lib/requirejs-text/text',
    json: 'lib/requirejs-plugins/src/json',
  }
});

require(['app']);