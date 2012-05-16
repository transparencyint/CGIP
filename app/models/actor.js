module.exports = Backbone.Model.extend({
  url: '/actors',
  defaults : {
    name : '',
    money_flow: [],
    accountable_to: []
  }
});