var util = require('util');
var http = require('http');
var url = require('url');
var express = require('express');
var ConnectCouchdb = require('connect-couchdb')(express);
var auth = require('./server/auth').auth;
var config = require('./server/config').config;

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

passport.use(new LocalStrategy({
  usernameField: 'username',
  passwordField: 'password'
},
auth.authenticate));

passport.serializeUser(auth.serializeUser);

passport.deserializeUser(auth.deserializeUser);

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
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.post('/session', passport.authenticate('local'), function(req, res){
  res.json({ok : true});
});

app.get('/logout', function(req, res){
  req.logout();
  res.json({ ok: true });
});

app.get('/', function(req, res){
  console.log(req.user);
  res.redirect('/index.html');
});

app.get('/test', auth.ensureAdmin, function(req, res){
  res.json(req.user);
});

app.listen(appPort);