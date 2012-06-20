var Model = require('./model').Model;
var _ = require('underscore');

var connection = require('../db/database_connection').connection.createConnection();
var db = connection.database('cgip_data');

var Actor = {};
_.extend(Actor, Model);

Actor.allByCountry = function(country, done){
  db.view('cgip/actorsByCountry', { key: country }, function(err, docs){
    if(err) return done(err);
    var parsedDocs = [];

    docs.forEach(function(doc){
      parsedDocs.push(doc);
    });

    done(err, parsedDocs)
  });
};

exports.Actor = Actor;