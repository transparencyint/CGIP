module.exports = Backbone.Collection.extend({

  initialize: function(){
    this.reset([{
        id : 5,
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
        id : 6,
        name : 'Actor B',
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
      }]);
  }
});