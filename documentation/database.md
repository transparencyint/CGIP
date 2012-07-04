# The CGIP Database architecture

## Technology

The CGIP app uses CouchDB as its backend and runs as a Singple Page App backed by a node.js backend that restricts db access and serves as a caching layer.

## Documents

### Countries

Each document is associated to one specific country so that it only appears in the maps of the representative country. The field `country` is the [ISO 3166-1 alpha-2](http://en.wikipedia.org/wiki/ISO_3166-1_alpha-2#Officially_assigned_code_elements) of the country. The codes we use in the first iteration are the following:

- `bd`: Bangladesh
- `do`: Dominican Republic
- `ke`: Kenya
- `mv`: Maldives
- `mx`: Mexico
- `pe`: Peru

### Actor

		{
			"name": "World Bank",
			"pos": {
				"x": 23,
				"y": 100
			},
			"type": "actor"
		}

### Connections

Connections are independent from Actors and there is an own document type and class for each connection. All their models and collections reside in the `models/connections` folder.

In order to create a connection of any type, simply require its class in your current class and instantiate it by the wished values into the constructor. They can be handled as normal Backbone Models and therefore in order to save a connection you have to call save on it e.g. `myConnection.save()`. You can pass the save method an object with callbacks to be called in case of an error or success:

	myConnections.save(null, {
		success: function(){
			// when created
		},
		error: function(){
			// in case of an error
		}
	});
	
You can also simply use `myConnection.destroy()` in order to delete it from the server.

Each connection also has a dedicated Collection that you can also find in the same folder. These Collections can be used to fetch all the connections of that very type with the `fetch` method. In addition to that, they also have a method called `destroyAll` which deletes all the models inside that collection from the database.

#### Accountability

This is how an accountability connection looks like in the backend:

		{
			"type": "connection",
			"connectionType": "accountability",
			"from": "ACTOR_ID",
			"to": "ACTOR_ID",
			"source": ""
		}

#### Money

This is how a money connection looks like in the backend:

		{
			"type": "connection",
			"connectionType": "money",
			"from": "ACTOR_ID",
			"to": "ACTOR_ID",
			"dispersed": 0,
			"pledged": 0
		}

## Databases

There are three databases needed to run this app:

- `cgip_data`: all data for the visualisation (e.g. actors, connections) is stored here
- `cgip_users`: all registered users
- `cgip_user_sessions`: as a permanent session store

You can create all needed databases by running the create_databases.js from the `server/scripts/` folder. 

`$ node server/scripts/create_databases.js`