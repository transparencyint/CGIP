var connection = require('../db/database_connection').connection.createConnection();
var db = connection.database('cgip_data');

exports.Actor = {
  allByCountry: function(country, done){
    db.view('cgip/actorsByCountry', { key: country }, function(err, docs){
      if(err) return done(err);
      var parsedDocs = [];

      docs.forEach(function(doc){
        parsedDocs.push(doc);
      });

      done(err, parsedDocs)
    });
  },

  edit: function(id, doc, done){
    db.save(id, doc._rev, doc, function(err, res){
      if(err) return done(err);
      doc._rev = res.rev;
      done(err, doc);
    });
  }
};