requirejs.config({
  baseUrl: 'js',
  shim: {
        d3: {
          exports: 'd3'
        },
        radar: {
          exports: 'radar',
          deps: ['d3']
        },
        wordcloud: {
          exports: 'wordcloud',
          deps: ['d3']
        }
  },
  paths: {
    app: 'main',
    d3: 'lib/d3/d3',
    topojson: 'lib/topojson/topojson',
    queue: 'lib/queue-async/queue',
    jquery: 'lib/jquery/dist/jquery',
    underscore: 'lib/underscore/underscore',
    text: 'lib/requirejs-text/text',
    json: 'lib/requirejs-plugins/src/json',
    d3tip: 'lib/d3-tip/index',
    radar: 'lib/radar/radar-chart',
    wordcloud: 'lib/wordcloud/d3.layout.cloud'
  }
});

require(['app']);