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

An Actor Group also contains the same fields as like normal actor and in addition to that also a field called `actors` which is an Array, consisting of Actor ids which are contained in this group and a field `actorType` which shows that this actor is a group:

	{
		(...)
		"actorType": "group",
		"actors": ["sdf7w6egfw78ef7wef", "e76fw6w6vw6isivdfsdcu"]
		(...)
	}

### Connections

A connection keeps a reference to both connected actors and information of its corruption risk:

	{
		"from": "8sg6df87sdv76sbdvuszvbdlu",
		"to": "fs65vckeucs6jefv74skzjfs",
		"hasCorruptionRisk": false,
		"corruptionRisk": "",
		"corruptionRiskSource": "",
		"type": "connection"
	}

- `from` and `to`: they're both Strings which represent Actor ids
- `hasCorruptionRisk`, `corruptionRisk` and `corruptionRiskSource`: see the actor description for more information on these fields
- `type`: this is a connection

In the map however, there are no simple connections but three different types of documents which derive from the normal connection:

#### Accountability

A accountability connection has the same fields as the normal connection and in addition to that a `connectionType`, which indicates it's specific type.

    {
    	(...)
      	"type": "connection",
      	"connectionType": "accountability"
      	(...)
    }

#### Monitoring

A monitoring connection also has the same fields as the normal connection and the special `connectionType`.

    {
    	(...)
      	"type": "connection",
      	"connectionType": "monitoring"
      	(...)
    }

#### Money

A money connection has information about the `disbused` and the `pledged` money amounts for this connection as well as all the fields which were described above:

    {
    	(...)
    	"type": "connection",
    	"connectionType": "money",
    	"pledged": 34345,
    	"disbursed": 34345
    	(...)
    }

## Databases

There are three databases needed to run this app:

- `cgip_data`: all data for the visualisation (e.g. actors, connections) is stored here
- `cgip_users`: all registered users
- `cgip_user_sessions`: as a permanent session store

The reason for dividing it into three databases is to disallow users to be able to change user account data. They're only allowed to write into the `cgip_data` database.

You can create all needed databases by running the create_databases.js from the `server/scripts/` folder.  -> `$ node server/scripts/create_databases.js`


### Get Production data

In order to load the data from the production server onto your local server or to create a backup of the production data simply go to your local CouchDB Futon interface (e.g. [http://127.0.0.1:5984/_utils](http://127.0.0.1:5984/_utils)) and select `Replicator` from the menu on the right.

There, enter the the URL of the remote CouchDB into the from-field e.g. `http://myuser:mypassword@serverurl.com/databasename`. Then, enter the name of the local DB into the form on the left. If you create a backup, simply call it sth. like `cgip_backup_DATE`.

All that is left now is to click the `Replicate` button and CouchDB will fetch all the documents from the production server.

In case you want to delete all your data and refresh your database, delete your local database and create a new empty one to replicate the data to.