(function(/*! Brunch !*/) {
  'use strict';

  if (!this.require) {
    var modules = {};
    var cache = {};
    var __hasProp = ({}).hasOwnProperty;

    var expand = function(root, name) {
      var results = [], parts, part;
      if (/^\.\.?(\/|$)/.test(name)) {
        parts = [root, name].join('/').split('/');
      } else {
        parts = name.split('/');
      }
      for (var i = 0, length = parts.length; i < length; i++) {
        part = parts[i];
        if (part == '..') {
          results.pop();
        } else if (part != '.' && part != '') {
          results.push(part);
        }
      }
      return results.join('/');
    };

    var getFullPath = function(path, fromCache) {
      var store = fromCache ? cache : modules;
      var dirIndex;
      if (__hasProp.call(store, path)) return path;
      dirIndex = expand(path, './index');
      if (__hasProp.call(store, dirIndex)) return dirIndex;
    };
    
    var cacheModule = function(name, path, contentFn) {
      var module = {id: path, exports: {}};
      try {
        cache[path] = module.exports;
        contentFn(module.exports, function(name) {
          return require(name, dirname(path));
        }, module);
        cache[path] = module.exports;
      } catch (err) {
        delete cache[path];
        throw err;
      }
      return cache[path];
    };

    var require = function(name, root) {
      var path = expand(root, name);
      var fullPath;

      if (fullPath = getFullPath(path, true)) {
        return cache[fullPath];
      } else if (fullPath = getFullPath(path, false)) {
        return cacheModule(name, fullPath, modules[fullPath]);
      } else {
        throw new Error("Cannot find module '" + name + "'");
      }
    };

    var dirname = function(path) {
      return path.split('/').slice(0, -1).join('/');
    };

    this.require = function(name) {
      return require(name, '');
    };

    this.require.brunch = true;
    this.require.define = function(bundle) {
      for (var key in bundle) {
        if (__hasProp.call(bundle, key)) {
          modules[key] = bundle[key];
        }
      }
    };
  }
}).call(this);
(this.require.define({
  "application": function(exports, require, module) {
    // Application bootstrapper.
Application = {
  initialize: function() {
    var HomeView = require('views/home_view');
    var Router = require('lib/router');
    // Ideally, initialized classes should be kept in controllers & mediator.
    // If you're making big webapp, here's more sophisticated skeleton
    // https://github.com/paulmillr/brunch-with-chaplin
    this.homeView = new HomeView();
    this.router = new Router();
    if (typeof Object.freeze === 'function') Object.freeze(this);
  }
}

module.exports = Application;

  }
}));
(this.require.define({
  "initialize": function(exports, require, module) {
    var application = require('application');

$(function() {
  application.initialize();
  Backbone.history.start();
});

  }
}));
(this.require.define({
  "lib/router": function(exports, require, module) {
    var application = require('application');

module.exports = Backbone.Router.extend({
  routes: {
    '': 'home'
  },

  home: function() {
    $('body').html(application.homeView.render().el);
  }
});

  }
}));
(this.require.define({
  "lib/view_helper": function(exports, require, module) {
    // Put your handlebars.js helpers here.

  }
}));
(this.require.define({
  "map": function(exports, require, module) {
    var inputDown, inputMove, inputUp;

if (window.Touch) {
	inputDown = "touchstart";
	inputMove = "touchmove";
	inputUp = "touchend";
}
else {
	inputDown = "mousedown";
	inputMove = "mousemove";
	inputUp = "mouseup";
}

function normalizedX(event){
	return window.Touch ? event.originalEvent.touches[0].pageX : event.pageX;
}	

function normalizedY(event){
	return window.Touch ? event.originalEvent.touches[0].pageY : event.pageY;
}

var actors = [
  {
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
  },
];

function render(){
  for(actor in actors){
    actor = actors[actor];
    $('body').append( createActor(actor.name, actor.pos) );
  }
}

render();

function createActor(name, pos){
  return $('<div></div>')
            .addClass('actor')
            .css({ left: pos.x, top: pos.y })
            .append(
              $('<div></div>')
                .addClass('name')
                .text(name)
            )
            .append(
              $('<div></div>')
                .addClass('connectors')
                .append($('<div class="connector top"></div>'))
                .append($('<div class="connector right"></div>'))
                .append($('<div class="connector bottom"></div>'))
                .append($('<div class="connector left"></div>'))
            );
}

$('body').on(inputDown, '.actor', startToDrag);
$('body').on(inputDown, '.connector', startToConnect);

function startToConnect(event){
  event.preventDefault();
  event.stopPropagation();
  if(event.button === 2) return true; // right-click
  
  var myOffset = $(this).offset();
  startPos = { 
    x : normalizedX(event) - myOffset.left,
    y : normalizedY(event) - myOffset.top
  };
  
  $(this).addClass('selected').parents('.actor').addClass('selected');

  $('body').addClass('dragging');
  $(document).one(inputUp, function(){ 
    $('body').removeClass('dragging');
    $('.selected').removeClass('selected');
  });
  
  $(document).bind(inputMove, moveConnection);
}

function moveConnection(){
  
}

function startToDrag(event){
  event.preventDefault();
  if(event.button === 2) return true; // right-click
  selectedElement = $(event.target).parents('.actor');
  var myOffset = selectedElement.offset();
  startPos = { 
    x : normalizedX(event) - myOffset.left,
    y : normalizedY(event) - myOffset.top
  };
  $(document).bind(inputMove, moveElement);
  moveElement(event);
}

function moveElement(event){
    selectedElement.css({ 
      top : normalizedY(event) - startPos.y,
      left : normalizedX(event) - startPos.x
    });
}

$(document).bind(inputUp, function(){ $(this).unbind(inputMove); });

var connection = function(x0, y0, x1, y1, size, color){
  this.update = function(x0, y0, x1, y1, size, color){
    this.size = size;
    this.color = color;
    this.start = {
      x : x0 + this.size,
      y : y0 + this.size,
    };
    this.end = {
      x : x1 + this.size,
      y : y1 + this.size,
    };
    
    this.width = Math.abs(this.end.x - this.start.x) + this.size*2;
    this.height = Math.abs(this.end.y - this.start.y) + this.size*2;
     
    this.cp1 = {
      x : this.start.x,
      y : this.end.y,
    };
    this.cp2 = {
      x : this.end.x,
      y : this.start.y,
    };
    
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.canvas.style.margin = -this.size + "px 0 0 -" + this.size + "px";
    
    this.ctx.lineWidth = this.size;
    this.ctx.strokeStyle = this.color;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    
    this.ctx.beginPath();
    this.ctx.moveTo(this.start.x, this.start.y);
    this.ctx.bezierCurveTo(this.cp1.x, this.cp1.y, this.cp2.x, this.cp2.y, this.end.x, this.end.y);
    this.ctx.stroke();
  };
  
  this.canvas = document.createElement('canvas');
  this.ctx = this.canvas.getContext('2d');
  
  this.update(x0, y0, x1, y1, size, color);
  
  this.render = function(){
    return this.canvas;
  }
};

//$('body').append( new connection(0, 0, 500, 500, 3, 'black'); );
  }
}));
(this.require.define({
  "models/collection": function(exports, require, module) {
    // Base class for all collections.
module.exports = Backbone.Collection.extend({
  
});

  }
}));
(this.require.define({
  "models/model": function(exports, require, module) {
    // Base class for all models.
module.exports = Backbone.Model.extend({
  
});

  }
}));
(this.require.define({
  "views/home_view": function(exports, require, module) {
    var View = require('./view');
var template = require('./templates/home');

module.exports = View.extend({
  id: 'home-view',
  template: template
});

  }
}));
(this.require.define({
  "views/templates/actor": function(exports, require, module) {
    module.exports = function (__obj) {
  if (!__obj) __obj = {};
  var __out = [], __capture = function(callback) {
    var out = __out, result;
    __out = [];
    callback.call(this);
    result = __out.join('');
    __out = out;
    return __safe(result);
  }, __sanitize = function(value) {
    if (value && value.ecoSafe) {
      return value;
    } else if (typeof value !== 'undefined' && value != null) {
      return __escape(value);
    } else {
      return '';
    }
  }, __safe, __objSafe = __obj.safe, __escape = __obj.escape;
  __safe = __obj.safe = function(value) {
    if (value && value.ecoSafe) {
      return value;
    } else {
      if (!(typeof value !== 'undefined' && value != null)) value = '';
      var result = new String(value);
      result.ecoSafe = true;
      return result;
    }
  };
  if (!__escape) {
    __escape = __obj.escape = function(value) {
      return ('' + value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    };
  }
  (function() {
    (function() {
    
      __out.push('<div class="name"></div>\n<div class="connectors">\n  <div class="connector top"></div>\n  <div class="connector right"></div>\n  <div class="connector bottom"></div>\n  <div class="connector left"></div>\n</div>\n  ');
    
    }).call(this);
    
  }).call(__obj);
  __obj.safe = __objSafe, __obj.escape = __escape;
  return __out.join('');
}
  }
}));
(this.require.define({
  "views/templates/home": function(exports, require, module) {
    module.exports = function (__obj) {
  if (!__obj) __obj = {};
  var __out = [], __capture = function(callback) {
    var out = __out, result;
    __out = [];
    callback.call(this);
    result = __out.join('');
    __out = out;
    return __safe(result);
  }, __sanitize = function(value) {
    if (value && value.ecoSafe) {
      return value;
    } else if (typeof value !== 'undefined' && value != null) {
      return __escape(value);
    } else {
      return '';
    }
  }, __safe, __objSafe = __obj.safe, __escape = __obj.escape;
  __safe = __obj.safe = function(value) {
    if (value && value.ecoSafe) {
      return value;
    } else {
      if (!(typeof value !== 'undefined' && value != null)) value = '';
      var result = new String(value);
      result.ecoSafe = true;
      return result;
    }
  };
  if (!__escape) {
    __escape = __obj.escape = function(value) {
      return ('' + value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    };
  }
  (function() {
    (function() {
    
      __out.push('<div id="content">\n  <h1>CGIP</h1>\n  <p>There will be more!</p>\n  <img src="http://placekitten.com/300/300" />\n</div>\n');
    
    }).call(this);
    
  }).call(__obj);
  __obj.safe = __objSafe, __obj.escape = __escape;
  return __out.join('');
}
  }
}));
(this.require.define({
  "views/view": function(exports, require, module) {
    require('lib/view_helper');

// Base class for all views.
module.exports = Backbone.View.extend({
  initialize: function() {
    this.render = _.bind(this.render, this);
  },

  template: function() {},
  getRenderData: function() {},

  render: function() {
    this.$el.html(this.template(this.getRenderData()));
    this.afterRender();
    return this;
  },

  afterRender: function() {}
});

  }
}));
