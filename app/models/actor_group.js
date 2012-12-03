var Actor = require('./actor');

module.exports = Actor.extend({  
  defaults: function(){
    return {
      actors: []
    };
  }
});