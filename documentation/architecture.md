# Architecture

## Overall

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

### Views