var application = require('application');
var User = require('models/user');
var Config = require('models/config');

$(function() {
  Backbone.Model.prototype.idAttribute = "_id";
  
  // create the user model
  window.user = new User(window.user_hash);
  delete window.user_hash;

  // hotfix for missing socket
  window.socket = io.connect();

  // start socket.io
  if(user.isLoggedIn()){
    // connect the socket
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
  
  // remove click delay on mobile device
  new FastClick(document.body);
  
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