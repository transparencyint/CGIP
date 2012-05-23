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

#### Accountability

		{
			"collection": "connections",
			"type": "connections",
			"connectionType": "accountability",
			"from": "ACTOR_ID",
			"to": "ACTOR_ID",
		}

#### Money

		{
			"collection": "connections",
			"type": "connections",
			"connectionType": "money",
			"from": "ACTOR_ID",
			"to": "ACTOR_ID",
		}