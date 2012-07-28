# CGIP

a student project

## Getting started

The documentation can be found in the `documentation` folder.

1. Install CouchDB from [http://couchdb.apache.org/](http://couchdb.apache.org/)
2. Install node.js from [http://nodejs.org](http://nodejs.org)
3. Install brunch from command line via `npm install -g brunch@1.1.2`
4. Navigate to the `CGIP/` folder in the command line
5. Run `npm install` from the command line
6. Go to `server` and copy `config.js.sample` to `config.js` and fill in your credentials
7. Create the databases with: `node server/scripts/create_databases.js`
8. Create the design docs with: `node server/scripts/create_design_docs.js`
9. Create a user with: `node server/scripts/create_user.js` (will prompt for details)
10. Run `brunch watch`
11. Run `node server.js` and open [http://localhost:3000](http://localhost:3000) in your browser

## Working on the project

1. Navigate to the `CGIP/` folder in the command line
2. Run `brunch watch` from the command line
3. Edit files in the `app/` folder and all your changes will automatically be recompiled

## Deployment

Git-deployment on [Uberspace](http://www.uberspace.com)!
For a detailed documentation see [documentation/deployment.md](https://github.com/transparencyint/CGIP/blob/master/documentation/deployment.md).

## Technologies

- [Backbone.js](http://documentcloud.github.com/backbone/) for the frontend code
- [Eco](https://github.com/sstephenson/eco) for the templates
- [Stylus](http://learnboost.github.com/stylus/) as a CSS pre-processor
- [CouchDB](http://couchdb.apache.org) as a backend `(decision pending)`