var application = require('application');
var User = require('models/user');
var Config = require('models/config');

$(function() {
  Backbone.Model.prototype.idAttribute = "_id";
    
  if(!Modernizr.csstransitions || !Modernizr.flexboxlegacy || !Modernizr.svg || !Modernizr.inlinesvg || !Modernizr.history) {
    $('.browserSupport').show();
    return;  
  }else
    $('.browserSupport').remove();

  // create the user model
  window.user = new User(window.user_hash);
  delete window.user_hash;

  // dummy socket
  window.socket = { on: function(){}, emit: function(){}};

  // start socket.io only when the user is logged in
  if(user.isLoggedIn()){
    // decide on location of the socket server
    var socketServer = '';
    if(window.realtimePort)
      socketServer = 'http://' + location.host + ':' + window.realtimePort;
    else
      socketServer = location.host;

    console.log('connect socket to: ', socketServer)

    // connect to the socket
    window.socket = io.connect(socketServer);

    // socket is connected
    socket.on('connect', function(){
      // register the socket to the server
      socket.emit('register_socket', user.id);

      // save to the locked models
      socket.on('lock', function(modelLock){
        lockedModels.push(modelLock);
      });

      // remove from the locked models
      socket.on('unlock', function(model_id){
        lockedModels = _.reject(lockedModels, function(model){ if(model) return model == model_id; });
      });
    });
  }

  // create the mediator
  window.mediator = _.clone(Backbone.Events);
  // create the config after the app has been initialized properly
  window.config = new Config();

  // hook into socket.io in order to turn it on/off depending on the config
  var socketOn = socket.on;
  var socketEmit = socket.emit;
  // only call the correct functions if realtime is turned on
  socket.on = function(eventName, func){
    if(config.isRealtimeEnabled()) socketOn.apply(socket, arguments);
  };
  socket.emit = function(eventName, arg){
    if(config.isRealtimeEnabled()) socketEmit.apply(socket, arguments);
  };

  // make the translate function available in global context for easier calls
  window.t = $.jsperanto.translate;
  
  // initialize the app
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

// show out of sync message on failing requests
$(document.body).ajaxError(function(event, xhr){
  var status = xhr.status;
  // 409 (conflic), 423 (resource locked)
  if(status == 409 || status == 423){
    $('#outofsync').text(t('Your data seems to be outdated, please reload your browser to prevent errors.')).addClass('show');
  }
});