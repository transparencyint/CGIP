var util = require('util');
var _ = require('underscore');
var http = require('http');
var url = require('url');
var express = require('express');
var gzippo = require('gzippo');
var io = require('socket.io');
var ConnectCouchdb = require('connect-couchdb')(express);
var auth = require('./server/auth').auth;
var config = require('./server/config').config;

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
var Country = require('./server/models/country').Country;

var app = express();

passport.use(new LocalStrategy({
  usernameField: 'username',
  passwordField: 'password'
},
auth.authenticate));

passport.serializeUser(auth.serializeUser);

passport.deserializeUser(auth.deserializeUser);

app.configure(function(){
  app.set('view engine', 'jade');
  app.set('views', __dirname + '/server/views');
  app.set('view options', {
    layout: false
  });
  
  app.use(express.methodOverride());
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.favicon());
  app.use(gzippo.staticGzip(__dirname + '/public'));
  app.use(express.session({
    store: sessionStore,
    key: 'cgipsid',
    secret: config.sessionSecret,
    cookie: {
      maxAge: 604800000
    }
  }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(express.csrf());
  app.use(function(req, res, next) {
    res.locals.csrf_token = function(){ return req.session._csrf; };
    next();
  });
  app.use(app.router);
});

/** TODO: find out why res.redirect('/') is not working on uberhost */
var baseURL = (process.env['NODE_ENV'] === 'production') ? 'http://speculos.taurus.uberspace.de' : '';

/** Performs general routing actions */
var routeHandler = {

  /** Simply renders the index */
  renderIndex: function(req, res){
    res.render('index', { user: (req.user || null), lockedModels: lockedModels });
  },

  /** Redirects to the login when the user is not logged in */
  checkLogin: function(req, res){
    if(req.user){
      var user = {};
      user._id = req.user.id;
      user._rev = req.user._rev;
      res.render('index', { user: user, lockedModels: lockedModels });
    }else{
      res.redirect(baseURL + '/login?forward_to=' + req.url.split('/').join('__'));
    }
  },

  /** Redirects the user when already logged in */
  redirectWhenLoggedIn: function(req, res){
    if(req.user){
      res.redirect(baseURL + '/edit');
    }else{
      res.render('index', { user: null, lockedModels: lockedModels });
    }
  }
};

/* Push state URLs */
app.get('/', routeHandler.renderIndex);
app.get('/show/:country', routeHandler.renderIndex);
app.get('/login', routeHandler.redirectWhenLoggedIn);
app.get('/edit', routeHandler.checkLogin);
app.get('/edit/countries', routeHandler.checkLogin);
app.get('/edit/:country', routeHandler.checkLogin);
app.get('/edit/:country/actors', routeHandler.checkLogin);
app.get('/edit/:country/money/list', routeHandler.checkLogin);
app.get('/import/:country/money', routeHandler.checkLogin);

/* Session / auth handling */
app.post('/session', passport.authenticate('local'), function(req, res){
  res.json({_id: req.user._id, _rev: req.user._rev});
});

app.del('/session', function(req, res){
  req.logout();
  req.session.destroy(function(){
    res.json({ ok: true });
  });
});

app.get('/logout', function(req, res){
  req.logout();
  req.session.destroy(function(){
    res.redirect(baseURL + '/edit');
  });
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
    io.sockets.emit('change:' + req.params.actor_id, actor);
    res.json(actor);
  });
});

app.del('/:country/actors/:actor_id', auth.ensureAuthenticated, function(req, res){
  Actor.remove(req.params.actor_id, function(err, actor){
    io.sockets.emit('destroy:' + req.params.actor_id, actor);
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

app.put('/:country/connections/:connection_id', auth.ensureAuthenticated, function(req, res){
  Connection.edit(req.params.connection_id, req.body, function(err, connection){
    if(err) return res.json(err, 404);
    io.sockets.emit('change:' + req.params.connection_id, connection);
    res.json(connection);
  });
});

app.del('/:country/connections/:connection_id', auth.ensureAuthenticated, function(req, res){
  Connection.remove(req.params.connection_id, function(err, connection){
    io.sockets.emit('destroy:' + req.params.connection_id, null);
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

// Countries CRUD
app.get('/countries', function(req, res){
  Country.all(function(err, docs){
    if(err) return res.json(err, 404);
    res.json(docs);
  });
});

app.post('/countries', auth.ensureAuthenticated, function(req, res){
  Country.create(req.body, function(err, country){
    if(err) return res.json(err, 404);
    res.json(country);
  });
});

app.del('/countries/:id', auth.ensureAuthenticated, function(req, res){
  Country.remove(req.params.id, function(err, country){
    if(err) return res.json(err, 404);
    res.json(country);
  });
});

app.put('/countries/:id', auth.ensureAuthenticated, function(req, res){
  Country.edit(req.params.id, req.body, function(err, country){
    if(err) return res.json(err, 404);
    res.json(country);
  });
});

var port = process.env.APP_PORT || 3000;
var server = app.listen(port);
console.log('Server is up and running on port: ' + port);

var lockedModels = [];

// Realtime stuff
var io = io.listen(server);
// a less noisy log level
io.set('log level', 1)

// new connection established
io.sockets.on('connection', function (socket) {
  // register the current user
  socket.on('register_socket', function (user_id) {
    socket.user_id = user_id;
    console.log('register socket', user_id);
  });

  // broadcast a lock for a model
  socket.on('lock', function(model_id){
    var lock = {
      user_id: socket.user_id,
      model_id: model_id
    };
    lockedModels.push(lock);
    socket.broadcast.emit('lock', lock);
    socket.broadcast.emit('lock:'+model_id, null);
  });

  // broadcast an unlock for a model
  socket.on('unlock', function(model_id){
    lockedModels = _.reject(lockedModels, function(model){ return model.model_id == model_id; });
    socket.broadcast.emit('unlock', model_id);
    socket.broadcast.emit('unlock:'+model_id, null);
  });

  socket.on('new_model', function(model){
    var country = model.country;
    var type = model.type;
    var specificType = (type == 'actor') ? model['actorType'] : model['connectionType'];
    var key = [country, type].join(':');
    if(specificType)
      key += ':' + specificType;
    socket.broadcast.emit(key, model);
  });

  socket.on('disconnect', function(){
    var user_id = socket.user_id;
    console.log('disconnect socket', user_id);

    // select all tha locked models from this user
    var user_models = _.where(lockedModels, { user_id: user_id });

    // broadcast unlocks for these models
    _.each(user_models, function(model){
      var model_id = model.model_id;
      socket.broadcast.emit('unlock', model_id);
      socket.broadcast.emit('unlock:'+model_id, null);
    });
    // delete the locks
    lockedModels = _.reject(lockedModels, function(model){ return model.user_id == user_id; });
  });
});
