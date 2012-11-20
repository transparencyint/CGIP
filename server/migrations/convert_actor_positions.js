var Actor = require('../models/actor').Actor;
var _ = require('underscore');
var migrationID = 'convert_actor_positions';

console.log('Running position migration on all countries...');

Actor.allByCountry('pe', function(err, actors){
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
    }
  };
  console.log('Calculating bounding box...');
  var minX = _.min(actors, function(actor){ return actor.pos.x; }).pos.x;
  var maxX = _.max(actors, function(actor){ return actor.pos.x; }).pos.x;
  var subsctract = minX + ((maxX - minX) / 2);
  console.log('minX:', minX, 'maxX:', maxX);
  
  _.each(actors, function(actor){
    if(!actor.migrations) actor.migrations = {};
    // only execute this migration if not already processed
    if(!actor.migrations[migrationID]){
      actor.migrations.push(migrationID);
      actor.pos.x -= subsctract;
      Actor.edit(actor._id, actor, countDown);
    }
  });
})