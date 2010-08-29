var http = require('http');
var fs = require('fs');
var url = require('url');
var sys = require('sys');
var path = require('path');

//var formidable = require('./libraries/formidable');
var staticResource = require('./libraries/static-resource');
//var mustache = require('./libraries/mustache');
var io = require('./libraries/socketio')

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

var listener = io.listen(server);
listener.on('connection', function(client) {
    sys.debug('client connected: '+client.sessionId);
    client.on('disconnect', function() {
        sys.debug('client disconnected: '+client.sessionId);
    });
});

sys.debug('server is running!');

/*
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
*/

function handleUpload(request, response) {
    //request.setEncoding('utf8');
    /*
    var form = new formidable.IncomingForm();
    form.uploadDir = fs.realpathSync('./files');
    
    form.addListener('field', function(field, value) {
        sys.debug('field');
    });
    form.addListener('file', function(field, file) {
        sys.debug('file');
    });
    form.addListener('end', function() {
        sys.debug('end');
        response.writeHead(200, {'content-type': 'text/plain'});
        response.end('thanks!\n\n');
    });
    form.parse(request);
    */
    //sys.debug('called!');
    //sys.debug('version: '+request.httpVersion);
    //sys.debug(sys.inspect(request.headers));

    var base64data = new Buffer(0);
    //var base64data = '';
    request.addListener('data', function(chunk) {
        //sys.debug(sys.inspect(chunk));
        //sys.debug('chunk length: '+chunk.length);
        //sys.debug('new length: '+(base64data.length+chunk.length));
        var newBuffer = new Buffer(base64data.length+chunk.length);
        base64data.copy(newBuffer, 0, 0);
        chunk.copy(newBuffer, base64data.length, 0);
        base64data = newBuffer;
        
        //base64data += chunk.toString('base64');
        /*
        //sys.debug('data: '+chunk.toString('base64'));
        //sys.debug(listener.clients.length);
        //sys.debug(sys.inspect(listener.clients));
        for(var index = 0; index < listener.clients.length; index++) {
            var client = listener.clients[index];
            //sys.debug(sys.inspect(client));
            if(client != null) {
                client.send(chunk);
            }
        }
        */
    });
    request.addListener('end', function() {
        /*
        var newData = '';
        var startIndex = 0;
        var endIndex = 0;
        while(startIndex < base64data.length) {
            if(newData != '') {
                newData += '\n';
            }
            endIndex += 76;
            if(endIndex > base64data.length) {
                endIndex = base64data.length;
            }
            newData += base64data.substring(startIndex, endIndex);
            startIndex = endIndex;
        }
        */

        var newData = base64data.toString('base64')/*base64data.toString('base64')*/;
        //sys.debug('image:'+newData);
        for(var index = 0; index < listener.clients.length; index++) {
            var client = listener.clients[index];
            //sys.debug(sys.inspect(client));
            if(client != null) {
                client.send('data:image/png;base64,'+newData);
            }
        }
        
        response.writeHead(200, {'content-type': 'text/plain'});
        response.end(base64data+'\n\n');
    });
};
