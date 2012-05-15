var application = require('application');

// set up the database info
Backbone.couch_connector.config.db_name = "cgip";
Backbone.couch_connector.config.ddoc_name = "cgip";
Backbone.couch_connector.config.global_changes = true;

$(function() {
  application.initialize();
  Backbone.history.start();
});

// overwrite the defaul requests, because /db is the new db namespace
$.ajaxPrefilter(function( options, originalOptions, jqXHR ) {
  options.url = '/db' + options.url;
});