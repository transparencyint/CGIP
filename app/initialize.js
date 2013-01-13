var application = require('application');
var User = require('models/user');
var Config = require('models/config');

$(function() {
  Backbone.Model.prototype.idAttribute = "_id";
  
  // create the user model
  window.user = new User(window.user_hash);
  delete window.user_hash;

  // start socket.io
  if(user.isLoggedIn()){
    window.socket = io.connect();
    socket.on('connect', function(a, b){
      socket.emit('register_socket', user.id);
    });
  }

  // set up the config model
  window.config = new Config();
  
  application.initialize(function(){
    Backbone.history.start({pushState: true});
  });
});

// inject the csrf token on every request
var csrf_token = null;
$.ajaxPrefilter(function(options, originalOptions, jqXHR) {
  if(!options.headers) options.headers = {};
  if(!csrf_token) csrf_token = $('meta[name=csrf_token]').attr('content');
  options.headers['x-csrf-token'] = csrf_token;
});