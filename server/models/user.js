var dummyUser = {name: 'Hans', age: 34, id: 33};

exports.User = {
  get: function(id, done){
    done(null, dummyUser);
  },

  findByName: function(name, done){
    done(null, dummyUser);
  },

  create: function(attributes, done){
    done(null, dummyUser);
  }
};