var util = require('util');
var http = require('http');
var url = require('url');
var express = require('express');

var app = express.createServer();

// The remote database information
var PREFIX = '/db/';
var TARGET = 'http://localhost';
var PORT = 5984;

// This app's port
var appPort = process.env['app_port'] || 3000;

// decide to forward the request or to 
function couchDBForward(req, res, next){
  var u = url.parse(req.url);
  // Only serve URLs that start with PREFIX
  if(u.pathname.substring(0, PREFIX.length) != PREFIX)
    next(); // this may be a static page request or whatever
  else{
    u = TARGET + ':' + PORT + u.pathname.substring(PREFIX.length-1) + (u.search||'');
    couchDBRequest(req, res, u);
  }
};

function error(response, error, reason, code) {
    util.log('Error '+code+': '+error+' ('+reason+').');
    response.writeHead(code, { 'Content-Type': 'application/json' });
    response.write(JSON.stringify({ error: error, reason: reason }));
    response.end();
}

function unknownError(response, e) {
    util.log(e.stack);
    error(response, 'unknown', 'Unexpected error.', 500);
}

function couchDBRequest(inRequest, inResponse, uri) {
    util.log(inRequest.method + ' ' + uri);
    uri = url.parse(uri);
    var out = http.createClient(uri.port, uri.hostname);
    var path = uri.pathname + (uri.search || '');
    var headers = inRequest.headers;
    headers['host'] = uri.hostname + ':' + uri.port;
    headers['x-forwarded-for'] = inRequest.connection.remoteAddress;
    headers['referer'] = 'http://' + uri.hostname + ':' + uri.port + '/';

    var outRequest = out.request(inRequest.method, path, headers);

    out.on('error', function(e) {
      unknownError(inResponse, e);
    });
    outRequest.on('error', function(e) {
      unknownError(inResponse, e)
    });

    inRequest.on('data', function(chunk) {
      outRequest.write(chunk);
    });
    inRequest.on('end', function() {
      outRequest.on('response', function(outResponse) {
        if (outResponse.statusCode == 503) {
          return error(inResponse, 'db_unavailable', 'Database server not available.', 502);
        }
        inResponse.writeHead(outResponse.statusCode, outResponse.headers);
        outResponse.on('data', function(chunk) { inResponse.write(chunk); });
        outResponse.on('end', function() { inResponse.end(); });
      });
      outRequest.end();
    });
};

process.on('uncaughtException', function(e) {
    util.log(e.stack);
});

app.configure(function(){
  app.use(express.methodOverride());
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.session({secret: 'aabdonie98gsdv79sdjsbv2624zihef'}));
  app.use(couchDBForward);
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.listen(appPort);