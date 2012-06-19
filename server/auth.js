var User = require('./models/user').User;

var auth = {
  authenticate: function(username, pw, done){
    console.log('auth');
    User.findByName('Hans', function(err, user){
      console.log('auth - cb');
      if(err) return done(err);
      if(user)
        return done(null, user);
      else
        return done(null, null, { message: 'User: ' + username + ' not found.' });
    });
  },

  serializeUser: function(user, done) {
    console.log('serializeUser');
    console.log(user);
    var id = user.id? user.id : user._id;
    done(null, user.id);
  },

  deserializeUser: function(id, done) {
    console.log('deserializeUser');
    User.get(id, function(err, user){
      console.log('deserializeUser - cb');
      if(err) return done(err);
      if(user)
        return done(null, user);
      else
        return done(null, null, { message: 'Could not find a user with specified ID: ' + id });
    });
  },

  ensureAuthenticated: function (req, res, next) {
    if (req.isAuthenticated()) {
      next();
    }else{
      res.json({ message: 'Invalid credentials.'}, 401)
    }
  },

  ensureAdmin: function (req, res, next) {
    if (req.isAuthenticated() && req.user.roles && req.user.roles.indexOf('admin') >= 0) {
      next();
    }else{
      res.json({ message: 'Needs admin privileges.'}, 401)
    }
  }
};

exports.auth = auth;