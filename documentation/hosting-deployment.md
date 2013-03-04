# Hosting / Deployment

## Technology Dependencies on the local machine / the own server

There are not many dependencies for this web app. First, [NodeJS](http://nodejs.org/) in any version from the `0.8.x` branch is required. At the time of writing this the current version is `0.8.21` but the dev team has been using different versions of the `0.8.x` branch so they should all work (even `0.8.1` is working). 

NodeJS can be installed from source (<https://github.com/joyent/node>), from package managers (<https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager>) or you can download an installer and binaries from their website for MacOS and Windows (<http://nodejs.org/download/>).

The second dependency is [CouchDB](http://couchdb.apache.org). Again we were working with many versions of CouchDB but we recommend using the versions `>= 1.2` because there were changes in the replication protocol compared to versions of `1.0x` which would make it harder to replicate data.

Source and binaries can be found here: <http://couchdb.apache.org/#download> from which you can install it. Also, many package managers provide recent versions of CouchDB.

The third dependency is git, which we're using for our source code management. It is easily installable from many package managers and is available for all operating systems right from its website: <http://git-scm.com/>.

## Getting the code

The code is available from a public Github repository: <https://github.com/transparencyint/CGIP>. We created an open source organisation which all team members belong to. In that way we did not need to have the repository in one of our user namespaces and it looks way more organised.

In order to get the code, simply clone it from the public repository: `git clone git@github.com:transparencyint/CGIP.git`.

If you want to become a member of the organisation, just ask one of the team members. They have access to the organisation and can add you to it.

## Step-by-step guide to make it run

The following steps need to be performed once before you can get started developing / hosting:

1. Install all the dependencies which were mentioned above and clone the repository
2. Install brunch from command line via `npm install -g brunch`
3. Navigate to the `CGIP/` folder in the command line
4. Run `npm install` from the command line
5. Go to the `server` directory and copy `config.js.sample` to `config.js` and fill in your credentials (which also requires you to have started CouchDB and set up an admin user for it)
6. Create the databases with: `node server/scripts/create_databases.js`
7. Create the design docs with: `node server/scripts/create_design_docs.js`
8. Create a user with: `node server/scripts/create_user.js` (will prompt for details)
9. Run `brunch build`
10. Run `node server.js` and open [http://127.0.0.1:3000](http://127.0.0.1:3000) in your browser

## Hosting / Deployment

### Option 1: Uberspace

For the most of time we were using [Uberspace](http://uberspace.de/) as hoster in combination with git-deployment.

Registering for an account is straight forward and the space is immediately accessible after registration. You get full SSH access to your space and your provided with solid service-system which makes setting up the app really easy.

For the rest of the tutorial we need an open SSH connection to our server. This can be done easily with: `ssh MYUSERNAME@ourserverurl`.
First we simply clone the repository into some directory as described above.

#### Setting up CouchDB

CouchDB is not installed by default so we need to set it up on our own. If not done already we set up the service directory: `uberspace-setup-svscan`.

Then we install CouchDB with the built in helper: `uberspace-setup-couchdb`. It will print out several infos we need to note down like the port which CouchDB got assigned and the admin credentials for Futon. All this information can be added to the `config.js` file with `nano` (`nano cgip/server/config.js`).

#### Setting up the app

When CouchDB and the config have been set up, the next step is to create a service for the app. With `uberspace-setup-service CGIP node ~/CGIP/server.js` we create a new service in the `~/service/` directory which will be called `CGIP` and which will execute `node ~/CGIP/server.js` when started.

During development we were using NodeJS versions from the `0.8.x` branch. To set up this node version on our Uberspace we simply need to execute:

	echo 'export PATH=/package/host/localhost/nodejs-0.8.8/bin:$PATH' >> ~/.bash_profile
	source ~/.bash_profile

This will set the node binary to the correct version. More information about NodeJS on Uberspace can be found here: <http://uberspace.de/dokuwiki/development:nodejs>.

The app needs some environment variables so we need to alter the service a bit: `nano ~/service/CGIP/run`. Simply replace the node start script with this in the service file:
	
	# the environment vars
	export NODE_ENV=production
	export APP_PORT=PORTNUMBER

	# starting the app
	cd ~/CGIP
	exec node server.js 2>&1

`PORTNUMBER` is the only thing which needs to be changed here now. You can set it to any free port and the app will serve from it.

The way Uberspace works is that it puts an Apache in front of NodeJS if it should be served from port 80. So we need to create a rewrite rule for our app to Apache's `.htaccess` inside the `html/` directory which is accessible from the root directory:

	RewriteEngine On
	RewriteRule (.*) http://127.0.0.1:PORTNUMBER/$1 [P]

This will map all requests to be served by our NodeJS app which is running on `PORTNUMBER`.
