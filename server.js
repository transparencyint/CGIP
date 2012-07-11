var util = require('util');
var http = require('http');
var url = require('url');
var express = require('express');
var gzippo = require('gzippo');
var ConnectCouchdb = require('connect-couchdb')(express);
var auth = require('./server/auth').auth;
var config = require('./server/config').config;
var dbConnection = require('./server/db/database_connection').connection.createConnection();
var dataDb = dbConnection.database('cgip_data');

var sessionStore = new ConnectCouchdb({
  name: 'cgip_user_sessions',
  username: config.adminName,
  password: config.adminPassword,
  host: config.databaseHost,
  port: config.databasePort
});

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var User = require('./server/models/user').User;
var Actor = require('./server/models/actor').Actor;
var Connection = require('./server/models/connection').Connection;

var app = express.createServer();

passport.use(new LocalStrategy({
  usernameField: 'username',
  passwordField: 'password'
},
auth.authenticate));

passport.serializeUser(auth.serializeUser);

passport.deserializeUser(auth.deserializeUser);

app.configure(function(){
  app.set('basepath', '/');
  app.set('view engine', 'jade');
  app.set('views', __dirname + '/server/views');
  app.set('view options', {
    layout: false
  });
  
  app.use(express.methodOverride());
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.session({
    store: sessionStore,
    key: 'cgipsid',
    secret: 'aabdonie98gsdv79sdjsbv2624zihef',
    cookie: {
      maxAge: 604800000
    }
  }));
  app.use(function(req, res, next) {
    console.log('-- session --');
    console.log('path: ' + req.url);
    console.dir(req.session);
    console.log('-------------');
    next()
  });
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.use(express.staticCache());
  app.use(gzippo.staticGzip(__dirname + '/public'));
});

/* Renders the index jade with the user info */
app.get('/', function(req, res){
  var user = {};
  if(req.user){
    user._id = req.user.id;
    user._rev = req.user._rev;
  }else
    user = null;
  res.render('index', { user: user });
});

/* Session / auth handling */
app.post('/session', passport.authenticate('local'), function(req, res){
  res.json({_id: req.user._id, _rev: req.user._rev});
});

app.get('/logout', function(req, res){
  req.logout();
  req.session.destroy();
  res.redirect('home');
});

/* Testfoo */
app.get('/test', function(req, res){
  res.json(req.user);
});

/* Actor CRUD */
app.get('/:country/actors', function(req, res){
  Actor.allByCountry(req.params.country, function(err, docs){
    if(err) return res.json(err, 404);
    res.json(docs);
  });
});

app.post('/:country/actors', auth.ensureAuthenticated, function(req, res){
  Actor.create(req.body, function(err, actor){
    if(err) return res.json(err, 404);
    res.json(actor);
  });
});

app.put('/:country/actors/:actor_id', auth.ensureAuthenticated, function(req, res){
  Actor.edit(req.params.actor_id, req.body, function(err, actor){
    if(err) return res.json(err, 404);
    res.json(actor);
  });
});

app.del('/:country/actors/:actor_id', auth.ensureAuthenticated, function(req, res){
  Actor.remove(req.params.actor_id, function(err, actor){
    if(err) return res.json(err, 404);
    res.json(actor);
  });
});

/* Connections CRUD */
app.get('/:country/connections', function(req, res){
  Connection.allByCountry(req.params.country, function(err, docs){
    if(err) return res.json(err, 404);
    res.json(docs);
  });
});

app.get('/:country/connections/:connection_type', function(req, res){
  Connection.allByCountryAndType(req.params.country, req.params.connection_type, function(err, docs){
    if(err) return res.json(err, 404);
    res.json(docs);
  });
});

app.post('/:country/connections', auth.ensureAuthenticated, function(req, res){
  Connection.create(req.body, function(err, connection){
    if(err) return res.json(err, 404);
    res.json(connection);
  });
});

app.put('/:country/connections/:actor_id', auth.ensureAuthenticated, function(req, res){
  Connection.edit(req.params.actor_id, req.body, function(err, connection){
    if(err) return res.json(err, 404);
    res.json(connection);
  });
});

app.del('/:country/connections/:connection_id', auth.ensureAuthenticated, function(req, res){
  Connection.remove(req.params.connection_id, function(err, connection){
    if(err) return res.json(err, 404);
    res.json(connection);
  });
});

app.post('/:country/connections/:connection_type/destroyAll', auth.ensureAuthenticated, function(req, res){
  var models = req.body.models || [];
  if(models.length > 0)
    Connection.removeAll(req.body.models, function(err, con){
      if(err) return res.json(err, 404);
      res.json({ ok: true });
    });
  else
    res.json({ ok: true });
});

var port = process.env.APP_PORT || 3000;
app.listen(port);
console.log('Server is up and running on port: ' + port);