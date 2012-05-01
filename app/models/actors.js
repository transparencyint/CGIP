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
            to: 2,
            type: 'accountability'            
          }
        ],
      },
      {
        id : 2,
        name : 'Actor B',
        pos : {
          x : 193,
          y : 389
        },
        connections : [
          {
            to: 3,
            type: 'accountability'            
          }
        ],
      },
      {
        id : 3,
        name : 'Actor C',
        pos : {
          x : 493,
          y : 189
        },
        connections : [
          {
            to: 1,
            type: 'accountability'            
          }
        ],
      }]);
  }
});