var http = require('http');
var fs = require('fs');
var url = require('url');
var sys = require('sys');

//var multipart = require('./libraries/multipart/lib/multipart');
var formidable = require('formidable');
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
sys.debug('server is running!');

function parseMultipart(request) {
    var parser = multipart.parser();
    parser.headers = request.headers;

    request.addListener("data", function(chunk) {
        parser.write(chunk);
    });
    request.addListener("end", function() {
        parser.close();
    });

    return parser;
}

function handleUpload(request, response) {
    sys.debug('handleUpload called');

    request.setEncoding('binary');
    var stream = parseMultipart(request);
    stream.onPartBegin = function(part) {
        sys.debug("Started part, name = " + part.name + ", filename = " + part.filename);
    };
    stream.onData = function(chunk) {
        sys.debug('data: '+chunk);
        sys.debug('onData');
    };
    stream.onEnd = function() {
        sys.debug('onEnd');
        
        response.writeHead(200, {'Content-Type': 'application/json'});
        response.write('{success: true}');
        response.end();
    };
}
