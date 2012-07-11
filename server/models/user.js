var config = require('../config').config;
var crypto = require('crypto');
var connection = require('../db/database_connection').connection.createConnection();

exports.User = {
  get: function(id, done){
    connection.database('cgip_users').get(String(id), function(err, doc){
      done(err, doc);
    });
  },

  findByName: function(name, done){
    connection.database('cgip_users').get(name, function(err, doc){
      done(err, doc);
    });
  },

  create: function(username, password, done){
    var pwhash = this.getSaltedHash(username, password);
    connection.database('cgip_users').get(username, function(err, doc){
      if(err && err.error == 'not_found')
        connection.database('cgip_users').save(username, {
          id: username,
          pwhash: pwhash
        }, function(err, res){
          done(err, res);
        });
      else
        done({ message: 'User already existed!'});
    });
  },

  checkPassword: function(username, password, user){
    var hash1 = user.pwhash;
    var hash2 = this.getSaltedHash(username, password);
    return hash1 === hash2;
  },

  getSaltedHash: function(username, password){
    var pwhash = crypto.createHash('sha1');
    pwhash.update(username + config.salt + password);
    return 'hashed-' + pwhash.digest('hex');
  }
};