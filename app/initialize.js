var application = require('application');
var User = require('models/user');

$(function() {
  Backbone.Model.prototype.idAttribute = "_id";
  
  window.user = new User(window.user_hash);
  delete window.user_hash;

  application.initialize();
  Backbone.history.start();
});

// overwrite the defaul requests, because /db is the new db namespace
// $.ajaxPrefilter(function( options, originalOptions, jqXHR ) {
//   if(window.location.href.indexOf('localhost:3000') != -1 || window.location.href.indexOf('127.0.0.1:3000') != -1)
//     options.url = '/db' + options.url;
// });