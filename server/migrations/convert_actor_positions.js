var Actor = require('../models/actor').Actor;
var _ = require('underscore');

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
  _.each(actors, function(actor){
    Actor.edit(actor._id, actor, countDown);
  })
})