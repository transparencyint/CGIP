var config = require('../config').config;
var crypto = require('crypto');
var connection = require('../db/database_connection').connection.createConnection();
var db = connection.database('cgip_users');

exports.User = {
  get: function(id, done){
    db.get(String(id), function(err, doc){
      done(err, doc);
    });
  },

  findByName: function(name, done){
    db.get(name, function(err, doc){
      done(err, doc);
    });
  },

  create: function(username, password, done){
    var pwhash = this.getSaltedHash(password);
    db.get(username, function(err, doc){
      if(err && err.error == 'not_found')
        db.save(username, {
          id: username,
          pwhash: pwhash
        }, function(err, res){
          done(err, res);
        });
      else
        done({ message: 'User already existed!'});
    });
  },

  checkPassword: function(password, user){
    var hash1 = user.pwhash;
    var hash2 = this.getSaltedHash(password);
    return hash1 === hash2;
  },

  getSaltedHash: function(password){
    var pwhash = crypto.createHash('sha1');
    pwhash.update(password + config.salt + password);
    return 'hashed-' + pwhash.digest('hex');
  }
};