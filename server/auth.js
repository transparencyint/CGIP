var User = require('./models/user').User;

var auth = {
  /** TODO: currently throws a 500 when wrong username/pw */
  authenticate: function(username, pw, done){
    User.findByName(username, function(err, user){
      if(err) return done(err, null, err);

      if(user && User.checkPassword(username, pw, user))
        return done(null, user);
      else
        return done({ message: 'Wrong password.' }, null);
    });
  },

  serializeUser: function(user, done) {
    var id = user.id? user.id : user._id;
    done(null, user.id);
  },

  deserializeUser: function(id, done) {
    User.get(id, function(err, user){
      if(err || !user) return done(err, null, null);
      
      done(null, user);
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