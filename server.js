var util = require('util');
var http = require('http');
var url = require('url');
var express = require('express');

var app = express.createServer();

// The remote database information
var PREFIX = '/db/';
var TARGET = 'http://cgip.iriscouch.com';
var PORT = 80;

// This app's port
var appPort = process.env['app_port'] || 3000;

// decide to forward the request or to 
function couchDBForward(req, res, next){
  var u = url.parse(req.url);
  // Only serve URLs that start with PREFIX
  if(u.pathname.substring(0, PREFIX.length) != PREFIX)
    next(); // this may be a static page request or whatever
  else{
    u = TARGET + u.pathname.substring(PREFIX.length-1) + (u.search||'');
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
    var outPort = (uri.port || 80);
    var path = uri.pathname + (uri.search || '');
    var headers = inRequest.headers;
    headers['host'] = uri.hostname + ':' + outPort;
    headers['x-forwarded-for'] = inRequest.connection.remoteAddress;
    headers['referer'] = 'http://' + uri.hostname + ':' + outPort + '/';

    var outRequest = http.request({
      hostname: uri.hostname,
      path: path,
      port: outPort,
      method: inRequest.method,
      headers: headers
    },function(res){
      res.on('data', function(chunk){
        inResponse.write(chunk);
      });

      res.on('end', function(){
        inResponse.end();
      });
    });

    //var outRequest = out.request(inRequest.method, path, headers);
    if(inRequest.method == 'POST')
      outRequest.write(JSON.stringify(inRequest.body));

    outRequest.on('error', function(e) {
      console.log('outRequest#error');
      unknownError(inResponse, e);
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