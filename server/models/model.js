var connection = require('../db/database_connection').connection.createConnection();
var db = connection.database('cgip_data');

var Model = {
  edit: function(id, doc, done){
    db.save(id, doc._rev, doc, function(err, res){
      if(err) return done(err);
      doc._rev = res.rev;
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
  }
};

exports.Model = Model;