var cradle = require('cradle');
var config = require('../config').config;

cradle.setup({
  raw: false,
  cache: false,
  host: 'http://' + config.databaseHost,
  port: config.databasePort,
  auth: {
    username: config.adminName,
    password: config.adminPassword
  }
});

var connection = {
  createConnection : function(){
    return new(cradle.Connection)(); 
  }
};

exports.connection = connection;