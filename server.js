var util = require('util');
var http = require('http');
var url = require('url');
var express = require('express');
var ConnectCouchdb = require('connect-couchdb')(express);
var config = require('server/config').config;

var sessionStore = new ConnectCouchdb({
  name: 'cgip_user_sessions',
  username: config.adminName,
  password: config.adminPassword,
  host: config.databaseHost
});

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var User = require('./server/models/user').User;

var app = express.createServer();

passport.use(new LocalStrategy(function(username, pw, callback){
  console.log(1);
  callback(null, User.findByName('Hans'));
}));

passport.serializeUser(function(user, done) {
  console.log('serializeUser');
  console.log(user);
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  console.log('deserializeUser');
  console.log(User.get(id));
  done(null, User.get(id));
});

// The remote database information
var PREFIX = '/db/';
var TARGET = 'http://127.0.0.1';
var PORT = 5984;

// set up a username and a password
// set to null if not needed
var USERNAME = null;
var PASSWORD = null;

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
    var outPort = (uri.port || 80);
    var path = uri.pathname + (uri.search || '');
    
    var headers = inRequest.headers;
    headers['host'] = uri.hostname + ':' + outPort;
    headers['x-forwarded-for'] = inRequest.connection.remoteAddress;
    headers['referer'] = 'http://' + uri.hostname + ':' + outPort + '/';

    var reqOptions = {
      hostname: uri.hostname,
      path: path,
      port: outPort,
      method: inRequest.method,
      headers: headers
    };

    if(USERNAME && PASSWORD)
      reqOptions.auth = USERNAME + ':' + PASSWORD;

    var outRequest = http.request(reqOptions, function(res){
      inResponse.statusCode = res.statusCode;

      res.on('data', function(chunk){
        inResponse.write(chunk);
      });

      res.on('end', function(){
        inResponse.end();
      });
    });

    outRequest.on('error', function(e){
      console.log('error');
      console.log(arguments);
      unknownError(inResponse, e);
    });

    if(inRequest.method == 'POST' || inRequest.method == 'PUT')
      outRequest.write(JSON.stringify(inRequest.body));

    outRequest.end();
};

process.on('uncaughtException', function(e) {
    util.log(e.stack);
});

app.configure(function(){
  app.use(express.methodOverride());
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.session({
    store: sessionStore,
    secret: 'aabdonie98gsdv79sdjsbv2624zihef'
  }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(couchDBForward);
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.post('/session', passport.authenticate('local'), function(req, res){
  console.log(req.user);
  res.json({'ok': true});
});

app.get('/', function(req, res){
  console.log(req.user);
  res.redirect('/index.html');
});

app.get('/test', function(req, res){
  res.json(req.user);
});

app.listen(appPort);