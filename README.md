# CGIP

a student project

## Getting started

The documentation can be found in the `documentation` folder.

1. Install node.js from [http://nodejs.org](http://nodejs.org)
2. Install brunch from command line via `npm install -g brunch@1.1.2`
3. Navigate to the `CGIP/` folder in the command line
4. Run `npm install` from the command line
5. Run `node server.js` and open [http://localhost:3000](http://localhost:3000) in your browser

## Working on the project

1. Navigate to the `CGIP/` folder in the command line
2. Run `brunch watch` from the command line
3. Edit files in the `app/` folder and all your changes will automatically be recompiled

## Deployment

1. Make sure you have compiled all new files
2. Execute `couchapp push app.js http://OURDBUSERNAME:OURDBPASSWORD@cgip.iriscouch.com/cgip`
3. Open [http://cgip.iriscouch.com/cgip/_design/cgip/index.html](http://cgip.iriscouch.com/cgip/_design/cgip/index.html)

## Technologies

- [Backbone.js](http://documentcloud.github.com/backbone/) for the frontend code
- [Eco](https://github.com/sstephenson/eco) for the templates
- [Stylus](http://learnboost.github.com/stylus/) as a CSS pre-processor
- [CouchDB](http://couchdb.apache.org) as a backend `(decision pending)`