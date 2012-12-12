var Model = require('./model').Model;
var _ = require('underscore');

var connection = require('../db/database_connection').connection.createConnection();
var db = connection.database('cgip_data');

var Country = {};
_.extend(Country, Model);

Country.all = function(done){
  db.view('cgip/allCountries', {},
    function(err, docs){
      if(err) return done(err);
      var parsedDocs = [];

      docs.forEach(function(doc){
        parsedDocs.push(doc);
      });

      done(err, parsedDocs)
  });
};

Country.allByCountryAndType = function(country, type, done){
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

exports.Country = Country;