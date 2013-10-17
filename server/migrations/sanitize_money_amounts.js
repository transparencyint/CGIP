var Country = require('../models/country').Country;
var Connection = require('../models/connection').Connection;
var _ = require('underscore');
var migrationHelper = require('../migration_helper');
var migrationID = 'sanitize_money_amounts';

console.log('Running position migration on all countries...');

var migrateAllCountries = function(){
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
};

var migrateCountry = function(country, callback){
  console.log('Migrating country:', country)
  Connection.allByCountry(country, function(err, connections){
    var totalCount = connections.length;
    var errors = [];
    var countDown = function(err, doc){
      totalCount--;
      if(err){
        errors.push({doc:doc, err:err});
        console.log('There was an error with this doc:', doc, err);
      }
      if(totalCount == 0){
        console.log('Finished country with ' + errors.length + ' errors.');
        console.log('Errors:', errors);
        callback();
      }
    };

    if(totalCount == 0){
      console.log('Stopping migration since no connections in this country');
      return callback(); // empty countries don't need to be migrated 
    }

    console.log('Starting')
    _.each(connections, function(connection){
      if(!migrationHelper.hasBeenMigrated(connection, migrationID)){
        if(connection.connectionType){
          ['pledged', 'disbursed'].forEach(function(mode){ 
              connection[mode] = parseInt(connection[mode], 10) || 0;
          });
        }
        Connection.edit(connection._id, connection, countDown);
      }else{
        countDown();
      }
    });
  });
};

migrateAllCountries();

var cleanMoney = function(model){ 
  
}