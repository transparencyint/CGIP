var connection = require('../db/database_connection').connection.createConnection();
var db = connection.database('cgip_data');

exports.Connection = {
  allByCountry: function(country, done){
    db.view('cgip/connectionsByTypeAndCountry', { 
      startKey: [country],
      endKey: [country]
    }, function(err, docs){
      if(err) return done(err);
      var parsedDocs = [];

      docs.forEach(function(doc){
        parsedDocs.push(doc);
      });

      done(err, parsedDocs)
    });
  }
};