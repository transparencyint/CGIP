# CGIP

a student project

## Getting started

The documentation can be found in the `documentation` folder.

1. Install node.js from [http://nodejs.org](http://nodejs.org)
2. Install brunch from command line via `npm install -g brunch@1.1.2`
3. Navigate to the `CGIP/` folder in the command line
4. Run `npm install` from the command line
5. Create the databases with: `node server/scripts/create_databases.js`
6. Create the design docs with: `node server/scripts/create_design_docs.js`
7. Create a user with: `node server/scripts/create_user.js` (will prompt for details)
8. Run `node server.js` and open [http://localhost:3000](http://localhost:3000) in your browser

## Working on the project

1. Navigate to the `CGIP/` folder in the command line
2. Run `brunch watch` from the command line
3. Edit files in the `app/` folder and all your changes will automatically be recompiled

## Deployment

no deployment strategy yet

## Technologies

- [Backbone.js](http://documentcloud.github.com/backbone/) for the frontend code
- [Eco](https://github.com/sstephenson/eco) for the templates
- [Stylus](http://learnboost.github.com/stylus/) as a CSS pre-processor
- [CouchDB](http://couchdb.apache.org) as a backend `(decision pending)`