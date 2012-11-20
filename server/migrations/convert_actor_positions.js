var Actor = require('../models/actor').Actor;
var _ = require('underscore');
var migrationHelper = require('../migration_helper');
var migrationID = 'convert_actor_positions';

console.log('Running position migration on all countries...');

var migrateAllCountries = function(){

};

var migrateCountry = function(country, callback){
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
      }
    });
  });
};

migrateCountry('do', function(){
  console.log('done');
})