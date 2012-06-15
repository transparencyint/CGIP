var cradle = require('cradle');
var prompt = require('prompt');


var databases = ['dm', 'bd', 'ke', 'md', 'mx', 'pe'];

prompt.start();

prompt.get(['username', 'pw', 'dburl', 'dbport'], function (err, result) {
    if (err) {
      console.log('Error: ');
      console.log(err);
      return;
    }

    cradle.setup({
      host: result.dburl,
      port: result.dbport,
      auth: {
        username: result.username,
        password: result.pw
      }
    });

    var connection = new(cradle.Connection)();
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
});