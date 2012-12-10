var application = require('application');
var User = require('models/user');

$(function() {
  Backbone.Model.prototype.idAttribute = "_id";
  
  window.user = new User(window.user_hash);
  delete window.user_hash;

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