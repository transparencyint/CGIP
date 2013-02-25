# Database

The CGIP app uses [CouchDB](http://couchdb.apache.org/) which is a document-based NoSQL database. It works completely different than SQL-databases like MySQL because documents don't have a fixed scheme and queries are not written in SQL. In order to structure the data, CouchDB uses map/reduce views which create indexes that are then queried by the backend server. For a very good (and free) beginners resource check out the [CouchDB guide](http://guide.couchdb.org/draft/index.html).

The following chapters will explain the different document types, our views and some general information about database specific topics.

## Document Types / Entities

In general, CouchDB documents are JSON-documents and so they can only have the types which are also defined in JSON: Strings, Booleans, Numbers, Arrays and Objects. 

In order to manage documents, CouchDB adds two fields to each document:

- `_id`: the document's id
- `_rev`: the current revision of the document. CouchDB keeps track of old revisions of a document and only allows changes with correct revision numbers. (concurrent control)

Besides these two fields, CouchDB only stores the actual data. Just to get an idea of what a JSON document looks like, here is a sample document:

	{
   		"_id": "3af373bc6c7305d2b47a17eea4003da8",
   		"_rev": "5-bd2f8892951cc62f65117b2328eecccc",
   		"name": "Hugo",
   		"age": 25,
   		"is_student": true,
   		"type": "person",
	    "metadata": {
   			"pets": ["Balto", "Snowflake"]
   		}
	}


### Country

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

### Delete all docs of a database

There is no handy way to delete all docs from a database in CouchDB, so here a litte jQuery script:

    $.ajax({
      url: '/couchdb/cgip_user_sessions/_all_docs', 
      success: function(res){
        console.log(res.rows.length);
        var total = res.rows.length;
        var currentlyDeleted = 0;
        for(var i = 0; i < res.rows.length; i++){
          $.ajax({ 
            url: '/couchdb/cgip_user_sessions/' + encodeURI(res.rows[i].id) + '?rev=' + res.rows[i].value.rev,
            type: 'DELETE',
            success: function(){
              currentlyDeleted++;
              console.log(currentlyDeleted + '/' + total);
            }
          });
        }
      },
      dataType: 'json'
    });

## Get Production data

In order to load the data from the production server on your local server or to create a backup of the production data simply go to your local CouchDB Futon interface (e.g. [http://127.0.0.1:5984/_utils](http://127.0.0.1:5984/_utils)) and select `Replicator` from the right menu.

There, enter the the URL of the remote CouchDB into the from-field e.g. `http://myuser:mypassword@serverurl.com/databasename`. Then, enter the name of the local DB into the form on the left. If you create a backup, simply call it sth. like `cgip_backup_DATE`.

All that is left now is to click the `Replicate` button and CouchDB will fetch all the documents from the production server.

In case you want to delete all your data and refresh your database, delete your local database and create a new empty one to replicate the data to.