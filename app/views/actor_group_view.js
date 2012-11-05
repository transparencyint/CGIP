var ActorView = require('./actor_view');

module.exports = ActorView.extend({
  events: function(){
    var events = _.clone(ActorView.prototype.events);
    events['click'] = 'highlightGroup';
    return events;
  },

  highlightGroup: function(){
    alert('This group contains ' + this.model.actors.length + ' valid actor(s): ' + this.model.get('actors').join(','));
  }
});