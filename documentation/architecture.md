# Architecture

## Overall

## Conventions

To make the code as modular and as organized as possible, each "class" is kept in an own file and wrapped as an own module. This also prevents unneeded code to be shared in the shared-namespace of the application. Classnames are to be written in camelCase and file names with underscores as separators e.g. the class `HomeView` would reside in a file called `home_view.js`.

To use a certain class inside another class we simply require them as shown in the example above.

	var BaseClass = require('path/to/base_class');

	module.exports = BaseClass.extend({
  		// add your class definition in here
	});
	
The part in `module.exports` is then shareable with other files. THis is also where all our class-logic will go into. `BaseClass.extend` means that we're extending another class, which means sth. like deriving from that class.

## Backbone 101

In this short introduction we will add a simple route and a new View to our application. For additional information about how Backbone.js works, check out this nice [step-by-step tutorial](http://arturadib.com/hello-backbonejs/)(although it's a bit outdated) and their [reference documentation](http://documentcloud.github.com/backbone/).

### Routers

Routers are objects that map a certain route (a part of the URL in the browser, after the `#`) to a function of that object. For example a very basic route looks like this:
    
    (...)
    routes: {
      '': 'home'
    },

    home: function() { alert("Hello World"); }
    (...)

This router maps the "empty" route to the method "home", which is then executed. 

But let's look at a more complex router:

    (...)
    routes: {
      'user/:id': 'user'
    },

    user: function(id) { alert("My user id is: " + id); }
    (...)

The URL `mydomain.com/#user/23` would match the route above and the user method is executed. Notice the `:id` in the matcher string, Backbone parses that string and automatically creates the id variable and passes it to the user function.

In the router functions we would then trigger an AJAX-call to fetch certain data, e.g. the user model that has been requested. When the data arrives at the client we create a view from it to show it to the user.

### Models

Triggering AJAX requests is sth. we don't need to do manually because it's something that Backbone.js encapsulates in Models. Models take care of everything data- and logic-related in the appliaction to ensure a clean separation of presentation and logic.

A model knows how to load it's data from the server from a url property we can specify, either a String or a function (to allow dynamic URLs). Depending on the action to be called on the Model (e.g. save or destroy) Backbone automatically calls the correct REST action on the server ([more info here](http://documentcloud.github.com/backbone/#Sync)).

	module.exports = Backbone.Model.extend({
  		url: function(){
    		var id = this.get('id');
    		if(id)
      			return "/users/" + this.get('id');
    		else
      			return "/users"
		}
	});

To retrieve values from a model simply call `myModel.get('ATTRIBUTE')` on it. To change a certain value on a model simply call `myModel.set({name: 'hans', age: 23})`. Setting values on a model does not persist them on the server, this has to be done manually vie the `save()` method. Since this operation is done asynchronously we have to pass a callback function to know when the request has been finished: 

	myModel.save({success: function(){
		alert('Success, yippie!!');
	}, error: function(){
		alert('model save problems');
	}});
	
One of the most important things of Models is that they are able to trigger events when their values change so that elements are able to react to model changes. 

### Views

Views contain all the logic that is needed for the behavior of a certain UI element e.g. a list element with a `delete` button. Each view has one part of the DOM associated to it (you can reference it via `this.el` or `this.$el` for the jQuery element). In normal JavaScript applications the jQuery code looks very messy and is hard to understand, but the Backbone.View does provide some nice ways to structure it.

	var View = require('./view');
	
	module.exports = View.extend({
  
  	  template: require('./path/to/template'),
  
  	  className : 'myElementsCSSClass',
  
  	  events : {
    	'click .delete' : 'deleteClicked',
    	'click' : 'loadField'
  	  },
  
	  initialize: function(){
    	/* this method is like a constructor */
      },
      
      render: function(){
      	this.$el.html(this.template(this.model.toJSON()));
      },
      
      deleteClicked: function(event){
      	this.model.destroy();
      	this.$el.destroy();
      },
      
      loadField: function(event){
      	/* do whatever you want to load data for this field */
      }
  	  
	});		

`template` references this views template, which will be covered in more detail in the Templating section. `events` is a hash that provides easy and unobtrusive event-binding for the view. In this example a click on the sub DOM-element of this view with the class `.delete` will trigger the function `deleteClicked` to be called. There's no need to bind events manually.

The method `render` takes care of rendering te template to the DOM and therefore uses the model and the template. Since this step is repeated very often, our base View class already implements this method and additionaly provides two methods to enhance the process: `afterRender` and `getTemplateData` ->

	(…)
	afterRender: function(){
		/* this method is executed after the element has been rendered */
	},
	
	getTemplateData: function(){
		/* this method is used to prepare the data for the templat
		We can do any sort of pre-calculation in here */
		var data = this.model.toJSON();
		data.currentDate = new Date().getTime();
		return data; /* important: don't forget to return the data */
	}
	(…)

A very important part of Views is to react on model changes. This can be done very easy in Backbone by subscribing to change-events.

	(…)
	initialize: function(){
		/* subscribe to name-change */
		this.model.on('change:name', this.nameChanged, this);
		
		/* subscribe to all change-events and simply re-render */
		this.model.on('change', this.render, this);
	},
	
	nameChanged: function(){
		/* update the name field when it changes in the model */
		this.$('.name').text(this.model.get('name));
	}
	(…)

## Templating

### Eco

## Stylesheets

### Stylus