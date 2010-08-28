var http = require('http');
var fs = require('fs');
var url = require('url');
var sys = require('sys');

var staticResource = require('./libraries/static-resource');
//var mustache = require('./libraries/mustache');

var handler = staticResource.createHandler(fs.realpathSync('./static'));
//var mustachedPages = new Array('/index.html');

var server = http.createServer(function(request, response) {
    var path = url.parse(request.url).pathname;
    if(path == '/') {
        path = '/coming.html';
    }

    switch(path) {
      case '/upload':
        handleUpload(request, response);
        break;
      default:
        if(!handler.handle(path, request, response)) {
            response.writeHead(404);
            response.write('404');
            response.end();
        }
        break;
    }
});
server.listen(8080);

function handleUpload(request, response) {
    sys.debug('handleUpload called');
}
