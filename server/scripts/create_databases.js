var cradle = require('cradle');
var config = require('../config').config;
var connection = require('../db/database_connection').connection.createConnection();

var databases = ['cgip_user_sessions', 'cgip_users', 'cgip_data'];

// 'cgip_dm', 'cgip_bd', 'cgip_ke', 'cgip_md', 'cgip_mx', 'cgip_pe'

var currentDb = 0;

var createIfNotExists = function(dbName){
  console.log('Creating database: ' + dbName);
  var db = connection.database(dbName);
  db.exists(function(err, exists){
    if(err){
      console.log('Error: ');
      console.log(err);
      createNext();
    } else if(exists){
      console.log('Database ' + dbName + ' already exists.');
      createNext();
    } else {
      db.create(function(err){
        if(err){
          console.log(err);
        } else {
          console.log('Database ' + dbName + ' created!');
        }

        createNext();
      });
    }
  });
};

var createNext = function(){
  if(currentDb < databases.length)
    createIfNotExists(databases[currentDb]);
  else
    console.log('Script finished!');
  currentDb++;
};

createNext();