var Actor = require('../models/actor').Actor;
var Country = require('../models/country').Country
var _ = require('underscore');
var migrationHelper = require('../migration_helper');
var migrationID = 'convert_actor_positions';

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
  Actor.allByCountry(country, function(err, actors){
    var totalCount = actors.length;
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

    if(actors.length == 0){
      console.log('Stopping migration since no actors in this country');
      return callback(); // empty countries don't need to be migrated 
    }
    
    console.log('Calculating bounding box...');
    var minX = _.min(actors, function(actor){ return actor.pos.x; }).pos.x;
    var maxX = _.max(actors, function(actor){ return actor.pos.x; }).pos.x;
    var subsctract = minX + ((maxX - minX) / 2);
    console.log('minX:', minX, 'maxX:', maxX);
    console.log('Starting')
    _.each(actors, function(actor){
      if(!migrationHelper.hasBeenMigrated(actor, migrationID)){
        actor.pos.x -= subsctract;
        Actor.edit(actor._id, actor, countDown);
      }else{
        countDown();
      }
    });
  });
};

migrateAllCountries();