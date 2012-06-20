var connection = require('../db/database_connection').connection.createConnection();
var design_docs = {
  cgip_data: require('../db/design_doc').design_doc
};

var db = connection.database('cgip_data');
db.get('_design/cgip', function(err, doc){
  if(err && err.error === 'not_found')
    createDesignDoc('_design/cgip', design_docs.cgip_data, printResult);
  else
    deleteDesignDoc('_design/cgip', doc, function(err){
      if(err) return printResult(err);
      createDesignDoc('_design/cgip', design_docs.cgip_data, printResult);
    });
});

var createDesignDoc = function(id, doc, cb){
  console.log('Creating design doc: ' + doc._id);
  db.save(id, doc, function(err){
    cb(err);
  });
};

var deleteDesignDoc = function(id, doc, cb){
  console.log('Deleting design doc: ' + doc.id);
  db.remove(id, doc._rev, function(err){
    cb(err);
  });
};

var printResult = function(err){
  if(err) return console.log('Could not create design doc: ' + err);
    console.log('Design doc created');
};