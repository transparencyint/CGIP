# The CGIP Database architecture

## Technology

The CGIP app uses CouchDB as its backend and runs as a Singple Page App inside CouchApp in order to query it directly without a proxy in between.

## Documents

### Actor

		{
			"name": "World Bank",
			"pos": {
				"x": 23,
				"y": 100
			},
			"collection": "actors"
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
			"collection": "connections",
			"type": "connections",
			"connectionType": "accountability",
			"from": "ACTOR_ID",
			"to": "ACTOR_ID",
			"source": ""
		}

The 

#### Money

This is how a money connection looks like in the backend:

		{
			"collection": "connections",
			"type": "connections",
			"connectionType": "money",
			"from": "ACTOR_ID",
			"to": "ACTOR_ID",
			"dispersed": 0,
			"pledged": 0
		}

## Databases

Each chapter has its own database and they're identified by their [ISO 3166-1 Alpha2 country code](http://en.wikipedia.org/wiki/ISO_3166-1#Current_codes):

- Dominican Republic -> DM
- Bangladesh -> BD
- Kenya -> KE
- Maldives -> MD
- Mexico -> MX
- Peru -> PE

You can create all needed databases by running the create_databases.js from the `backend scripts/` folder. 

`$ node backend\ scripts/create_databases.js`

It will prompt you for the username, the password (you can leave them both blank when they're not needed), the database url (e.g. http://127.0.0.1) and the database port (e.g. 5984). After that it tries to create the databases in the specified CouchDB.