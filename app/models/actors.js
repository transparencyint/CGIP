var Actor = require('./actor');

module.exports = Backbone.Collection.extend({
  model: Actor,
  url: '/actors',
  initialize: function(){
    this.reset([{
        id : 1,
        name : 'Government',
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
        name : 'CCU',
        pos : {
          x : 193,
          y : 389
        },
        connections : [
          {
            to: 4,
            type: 'accountability'            
          }
        ],
      },
      {
        id : 3,
        name : 'BCCRF',
        pos : {
          x : 633,
          y : 129
        },
        connections : [
          {
            to: 1,
            type: 'accountability'            
          }
        ],
      },
      {
        id : 4,
        name : 'PPCR',
        pos : {
          x : 763,
          y : 349
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