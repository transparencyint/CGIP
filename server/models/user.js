var config = require('../config').config;
var crypto = require('crypto');
var cradle = require('cradle');
cradle.setup({
  host: 'http://' + config.databaseHost,
  port: config.databasePort,
  auth: {
    username: config.adminName,
    password: config.adminPassword
  }
});
var db = new cradle.Connection().database('cgip_users');

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
    var pwhash = this.getSaltedHash(username, password);
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