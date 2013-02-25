# Database

The CGIP app uses [CouchDB](http://couchdb.apache.org/) which is a document-based NoSQL database. It works completely different than SQL-databases like MySQL because documents don't have a fixed scheme and queries are not written in SQL. In order to structure the data, CouchDB uses map/reduce views which create indexes that are then queried by the backend server. For a very good (and free) beginners resource check out the [CouchDB guide](http://guide.couchdb.org/draft/index.html).

The following chapters will explain the different document types, our views and some general information about database specific topics.

## Document Types / Entities

In general, CouchDB documents are JSON-documents and so they can only have the types which are also defined in JSON: Strings, Booleans, Numbers, Arrays and Objects. 

In order to manage documents, CouchDB adds two fields to each document:

- `_id`: the document's id
- `_rev`: the current revision of the document. CouchDB keeps track of old revisions of a document and only allows changes with correct revision numbers. (concurrency control)

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

For simplicity, the fields `_id` and `_rev` will be left out in the upcoming examples. Typically each document also has a field `type`, which is used to identify documents in the view-functions.

### Country

For each country we're only storing some metadata, its English name and its [ISO 3166-1 alpha-2](http://en.wikipedia.org/wiki/ISO_3166-1_alpha-2#Officially_assigned_code_elements) code (abbreviation):

	{
	    "roleDimensions": [-500, -250, 59, 250, 500],
   		"showMonitoring": true,
   		"abbreviation": "bd",
   		"name": "Bangladesh",
   		"type": "country"
	}

- `roleDimensions`: represents the positions for the actor role edges
- `showMonitoring`: should the monitoring field be shown on this map?
- `abbreviation`: the country's abbreviation
- `name`: the country's name (English only)

All other documents will be grouped by country by adding a field `country` to them which is the abbreviation of the country. 

### Actor and Actor Group

An actor has the following scheme:

	{
   		"name": "President",
	    "abbreviation": "P",
   		"pos": {
       		"x": -440,
       		"y": 40
   		},
   		"organizationType": "Research Organization",
   		"purpose": ["adaption", "mitigation"],
   		"role": ["funding"],
   		"description": "This is the president",
   		"hasCorruptionRisk": true,
    	"corruptionRisk": "He's paying a lot to this cousin's companies.",
    	"corruptionRiskSource": "https://www.google.com",
		"type": "actor",
 		"country": "do"
	}

- `name`: this actor's name
- `abbreviation`: a short form of the name. This is quite handy when the actor is an organisation with a long name. If an abbreviation is set, it will be shown in the map instead of the name.
- `pos`: the x- and y-position on the map
- `organizationType`: the type
- `purpose`: all of this actor's purposes
- `role`: all the roles of this actor
- `description`: a more detailed description of this actor
- `hasCorruptionRisk`: indicates if there is a corruption risk
- `corruptionRisk`: a more detailed description of the corruption risk
- `corruptionRiskSource`: the source which shows the corruption risk (URL or publication reference)
- `type`: it's an actor
- `country`: the actor belongs to this country

An Actor Group also contains the same fields as like normal actor and in addition to that also a field called `actors` which is an Array, consisting of Actor ids which are contained in this group:

	{
		(...)
		"actors": ["sdf7w6egfw78ef7wef", "e76fw6w6vw6isivdfsdcu"]
		(...)
	}

### Connections

Connections are independent from Actors and there is an own document type and class for each connection. All their models and collections reside in the `models/connections` folder.


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