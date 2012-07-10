var Model = require('./model').Model;
var _ = require('underscore');

var connection = require('../db/database_connection').connection.createConnection();
var db = connection.database('cgip_data');

var Connection = {};
_.extend(Connection, Model);

Connection.allByCountry = function(country, done){
  db.view('cgip/connectionsByTypeAndCountry', { 
    startkey: [country],
    endkey: [country, {}]
  }, function(err, docs){
    if(err) return done(err);
    var parsedDocs = [];

    docs.forEach(function(doc){
      parsedDocs.push(doc);
    });

    done(err, parsedDocs)
  });
};

Connection.allByCountryAndType = function(country, type, done){
  db.view('cgip/connectionsByTypeAndCountry', { 
    key: [country, type]
  }, function(err, docs){
    if(err) return done(err);
    var parsedDocs = [];

    docs.forEach(function(doc){
      parsedDocs.push(doc);
    });

    done(err, parsedDocs)
  });
};

exports.Connection = Connection;