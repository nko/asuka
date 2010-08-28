var http = require('http');
var fs = require('fs');
var url = require('url');
var staticResource = require('./libraries/static-resource');

var handler = staticResource.createHandler(fs.realpathSync('./static'));

var server = http.createServer(function(request, response) {
    var path = url.parse(request.url).pathname;
    if(path == '/') {
        path = '/coming.html';
    }
    
    if(!handler.handle(path, request, response)) {
        response.writeHead(404);
        response.write('404');
        response.end();
    }
});
server.listen(8080);
