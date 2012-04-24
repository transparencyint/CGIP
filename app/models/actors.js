var Actor = require('./actor');

module.exports = Backbone.Collection.extend({
  model: Actor,
  
  initialize: function(){
    this.reset([{
        id : 1,
        name : 'Actor A',
        pos : {
          x : 342,
          y : 145
        },
        connections : [
          {
            to : 2,
            direction : 'left'
          },
        ],
      },
      {
        id : 2,
        name : 'Actor B',
        pos : {
          x : 193,
          y : 389
        }
      }]);
  }
});