var connection = require('../db/database_connection').connection.createConnection();
var db = connection.database('cgip_data');

var Model = {
  edit: function(id, doc, done){
    var start = new Date().getTime();
    db.save(id, doc._rev, doc, function(err, res){
      if(err) return done(err);
      doc._rev = res.rev;
      console.log('Time needed (edit): ' + (new Date().getTime() - start) + 'ms');
      done(err, doc);
    });
  },

  create: function(doc, done){
    db.save(doc, function(err, res){
      if(err) return done(err);
      doc._rev = res.rev;
      doc._id = res.id;
      done(err, doc);
    });
  },

  remove: function(id, done){
    db.get(id, function(err, doc){
      if(err) return done(err);
      db.remove(id, doc._rev, function(error, response){
        if(error) return done(error);
        done(error, {});
      });
    });
  },

  removeAll: function(docs, done){
    if(docs.length === 0) return done({ message: 'No models to delete!' });
    
    var toDelete = [];
    docs.forEach(function(doc){
      toDelete.push({
        id: doc._id,
        _id: doc._id,
        _rev: doc._rev,
        _deleted: true
      });
    });

    db.save(toDelete, function(err, res){
      if(err) return done(err);
      done(err, res);
    });
  }
};

exports.Model = Model;