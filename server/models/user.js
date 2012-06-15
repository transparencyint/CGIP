var dummyUser = {name: 'Hans', age: 34, id: 33};

exports.User = {
  get: function(id){
    return dummyUser;
  },

  findByName: function(name){
    return dummyUser;
  },

  create: function(attributes){
    return dummyUser;
  }
};