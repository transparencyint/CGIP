var Actor = require('../models/actor').Actor;
var Country = require('../models/country').Country
var Connection = require('../models/connection').Connection;
var _ = require('underscore');

Country.all(function(err, countries){
  var current = -1;
  var migrateNext = function(){
    current++;
    if(current >= countries.length){
      console.log('done migrating');
    }else{
      migrateCountry(countries[current].abbreviation, migrateNext)
    }
  };
  migrateNext();
});

var migrateCountry = function(country, callback){
  Connection.allByCountryAndType(country, 'money', function(err, connections){
    var totalCount = connections.length;
    var errors = [];
    var countDown = function(err, doc){
      totalCount--;
      if(err){
        errors.push({doc:doc, err:err});
        console.log('There was an error with this doc:', doc, err);
      }
      if(totalCount == 0){
        console.log('Finished with ' + errors.length + ' errors.');
        console.log('Errors:', errors);
        callback();
      }
    };

    if(connections.length == 0){
      console.log('Stopping connection in ' + country + ' migration since no connections in this country');
      return callback(); // empty countries don't need to be migrated 
    }
  
    _.each(connections, function(connection){
      // set disbursed to the old `amount` value if it's a number
      if(_.isNumber(connection.amount) && connection.amount > 0){
        console.log('Amount was set to: ' + connection.amount);
        connection.disbursed = connection.amount;
      }else{
        console.log('No amount set, resetting to 0')
        connection.disbursed = 0;
      }

      // set pledged to zero if not yet set
      if(!_.isNumber(connection.pledged))
        connection.pledged = 0;

      delete connection.amount;
      
      Connection.edit(connection._id, connection, countDown);
    });
  });
};