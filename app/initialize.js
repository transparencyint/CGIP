var application = require('application');

// set up the database info
Backbone.couch_connector.config.db_name = "cgip";
Backbone.couch_connector.config.ddoc_name = "cgip";
Backbone.couch_connector.config.global_changes = false;

$(function() {
  application.initialize();
  Backbone.history.start();
});

// overwrite the defaul requests, because /db is the new db namespace
$.ajaxPrefilter(function( options, originalOptions, jqXHR ) {
  if(window.location.href.indexOf('localhost:3000') != -1 || window.location.href.indexOf('127.0.0.1:3000') != -1)
    options.url = '/db' + options.url;
});