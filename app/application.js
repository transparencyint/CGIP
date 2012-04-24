// Application bootstrapper.
Application = {
  initialize: function() {
    var Router = require('lib/router');
    this.router = new Router();
    if (typeof Object.freeze === 'function') Object.freeze(this);
  }
}

module.exports = Application;
