var application = require('application');

$(function() {
  application.initialize();
  Backbone.history.start();
});

// overwrite the defaul requests, because /db is the new db namespace
$.ajaxPrefilter(function( options, originalOptions, jqXHR ) {
  options.url = '/db' + options.url;
});