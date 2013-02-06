var View = require('./view');

module.exports = View.extend({
	id: 'worldMap',
  className: 'index clearfix',

  template: require('./templates/index'),

  initialize: function(){
  	this.points;
		this.mapWidth;
	
  	this.pointStart = { hue: 200, saturation: 74 };
		this.pointEnd = { hue: 200, saturation: 74  };

		this.selectorTemplate = '%s, %s a, %s .arrow:before';
		this.valueTemplate = 'text-shadow: 0 1px 1px hsl(%h,%s%,30%);' +
			'border: 1px solid hsl(%h,%s%,30%);' +
			'background: hsl(%h,%s%,52%);' +
			'box-shadow: 0 1px hsl(%h,%s%,75%) inset,' +
			           ' 0 1px 2px hsla(%h,%s%,13%,.34);';

		this.delay = 1000;
		this.i = 0;
		this.count;

		_.bindAll(this, 'rainbow');
  },

  getRenderData: function() {
    return {
      countries: this.options.countries.toJSON()
    };
  },

  afterRender: function(){
  	var view = this;

  	_.defer(function(){

  		view.points = document.querySelectorAll('.point');
			view.mapWidth = document.querySelector('.map').clientWidth;

  		view.count = view.points.length;

			// sort by position on the map: left to right
			view.points = _.sortBy(view.points, function(point){ return point.offsetLeft; });

			_.each(view.points, view.rainbow);
		});
  },

  rainbow: function(point){

    // "point mexico" -> ".point.mexico"
    var selector = '.' + point.className.split(" ").join(".");
    
    // 0.56
    var percentage = point.offsetLeft / this.mapWidth;
    
    // 178
    var hue = this.pointStart.hue + percentage * (this.pointEnd.hue - this.pointStart.hue);
    var saturation = this.pointStart.saturation + percentage * (this.pointEnd.saturation - this.pointStart.saturation);
    
    var fullSelector = this.selectorTemplate.replace(/%s/g, selector);
    var value = this.valueTemplate.replace(/%h/g, hue).replace(/%s/g, saturation);
    
    document.styleSheets[0].addRule(fullSelector, value);
    
    setTimeout(function(){ point.classList.add('appear'); }, Math.sqrt(++this.i/this.count) * this.delay);
  }

});