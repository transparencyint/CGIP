var Actor = require('../models/actor').Actor;
var Connection = require('../models/connection').Connection;
var _ = require('underscore');

var changeActors = function(callback){
  Actor.allByCountry('bd', function(err, actors){
    var totalCount = actors.length;
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

    if(actors.length == 0){
      console.log('Stopping actor migration since no actors in this country');
      return callback(); // empty countries don't need to be migrated 
    }
  
    _.each(actors, function(actor){
      actor.country = 'do'
      Actor.edit(actor._id, actor, countDown);
    });
  });
};

var changeConnections = function(callback){
  Connection.allByCountry('bd', function(err, connections){
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
      console.log('Stopping connection migration since no connections in this country');
      return callback(); // empty countries don't need to be migrated 
    }
  
    _.each(connections, function(connection){
      connection.country = 'do'
      Connection.edit(connection._id, connection, countDown);
    });
  });
};

changeActors(function(){
  changeConnections(function(){
    console.log('DONE migrating');
  });
});