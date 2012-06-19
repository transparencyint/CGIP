var cradle = require('cradle');
var prompt = require('prompt');
var config = require('../config').config;
var User = require('../models/user').User;

cradle.setup({
  host: 'http://' + config.databaseHost,
  port: config.databasePort,
  auth: {
    username: config.adminName,
    password: config.adminPassword
  }
});

prompt.start();

prompt.get(['username', 'password'], function (err, result) {
  User.create(result.username, result.password, function(error, user){
    if(error){
      console.log('Could not create the user: ');
      console.log(error);
    }else{
      console.log('User created');
    }
  })
});