var application = require('application');
var User = require('models/user');

$(function() {
  Backbone.Model.prototype.idAttribute = "_id";
  
  window.user = new User(window.user_hash);
  delete window.user_hash;

  application.initialize();
  
  Backbone.history.start({pushState: true});
});