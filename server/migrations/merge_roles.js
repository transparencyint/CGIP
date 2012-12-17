var Actor = require('../models/actor').Actor;
var Country = require('../models/country').Country
var _ = require('underscore');

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

    // migration code here
    _.each(actors, function(actor){
      if(_.contains(actor.role, 'approval') || _.contains(actor.role, 'accreditation')){
        actor.role = _.without(actor.role, 'approval', 'accreditation');
        if(!_.contains(actor.role, 'coordination'))
          actor.role.push('coordination');
        console.log('changed: ' + actor.name + ' (' + country + ')');
        Actor.edit(actor._id, actor, countDown);
      }else{
        countDown();
      }
    });
  });
};

migrateAllCountries();