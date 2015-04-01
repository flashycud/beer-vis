var connect = require('connect');
var serveStatic = require('serve-static');
connect().use(serveStatic(__dirname + '/src')).listen(8080);