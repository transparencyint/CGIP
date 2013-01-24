var application = require('application');
var User = require('models/user');
var Config = require('models/config');

$(function() {
  Backbone.Model.prototype.idAttribute = "_id";
  
  // create the user model
  window.user = new User(window.user_hash);
  delete window.user_hash;

  // start socket.io only when the user is logged in
  if(user.isLoggedIn()){
    // decide on location of the socket server
    var socketServer = '';
    if(!window.realtimePort)
      socketServer = 'http://' + location.host + ':' + window.realtimePort;
    else
      socketServer = '127.0.0.1:3000';
    console.log('connect socket to: ', socketServer)
    // connect to the socket
    window.socket = io.connect(socketServer);
    socket.on('connect', function(){
      // register the socket to the server
      socket.emit('register_socket', user.id);

      // save to the locked models
      socket.on('lock', function(modelLock){
        lockedModels.push(modelLock);
      });

      // remove from the locked models
      socket.on('unlock', function(model_id){
        lockedModels = _.reject(lockedModels, function(model){ return model.model_id == model_id; });
      });
    });
  }

  // set up the config model
  window.config = new Config();

  window.t = $.jsperanto.translate;
  
  application.initialize(function(){
    Backbone.history.start({pushState: (window.history && window.history.pushState)});
  });
});

// inject the csrf token on every request
var csrf_token = null;
$.ajaxPrefilter(function(options, originalOptions, jqXHR) {
  if(!options.headers) options.headers = {};
  if(!csrf_token) csrf_token = $('meta[name=csrf_token]').attr('content');
  options.headers['x-csrf-token'] = csrf_token;
});