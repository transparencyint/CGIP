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

The app should be accessible via `http://USERNAME.SERVERNAME.uberspace.de` now.

#### Git deployment

If we wanted to update the app to the latest version now we'd have to connect to the server via SSH and get the latest code with git. But there is also an automated way:

Connect via SSH to you server, create a folder and name it `cgip.git`. Navigate to that folder and create a new bare git repository with `git init --bare`. Bare repositories don't contain the working tree of a repository and are therefore very lightweight. We will use this repo only for git hooks (<http://git-scm.com/book/en/Customizing-Git-Git-Hooks>).

Now go to the `hooks` folder and create file called `post-receive` and fill it with the following script: (`nano post-receive`)

	#!/bin/sh

	# set the needed env variables
	unset $(git rev-parse --local-env-vars)
	export USER=username
	export HOME=/home/username
	. $HOME/.bash_profile

	# go to the remote repo of the server
	# and pull the latest changes
	cd ~/CGIP
	git checkout master
	git pull

	# build the server
	./node_modules/brunch/bin/brunch build
	
	# minify the js-files
	./node_modules/uglify-js/bin/uglifyjs --overwrite public/javascripts/app.js
	./node_modules/uglify-js/bin/uglifyjs --overwrite public/javascripts/vendor.js

	export NODE_ENV=production
	
	# restart the service
	svc -du ~/service/cgip

	# echo something nice ;)
	echo Successfully deployed the newest master!
	
It should be pretty self-explanatory with the given comments, you just need to change the paths and usernames according to your setup. After you have created the file, make sure that it is executable.

This script will be executed every time there is something new pushed to this repository.

Now let's do the magic push-deploy. Navigate to your local repository and create a new remote that points to the bare repo we just created: `git remote add deploy ssh://username@server.url/home/username/cgip.git`. Now there's a remote called `deploy`. When we now push the master to this repository git should execute the `post-receive` script on the Uberspace.

Let's try it: `git push deploy master`

If it doesn't show error messages it should have worked. If it is not working, check the log files which are in the service repository.

Push rights to the bare repo are handled via SSH and therefore all the people that should be allowed to deploy have to add their public keys to the server.

### Option 2: Nodejitsu

After having troubles with ports in the TI network we decided to switch to another hoster which allows to use port 80 for the Websocket communication. It seemed like the TI network simply blocked all outgoing and ingoing traffic from any other port we tried, so there was no other option.

We decided to try out [Nodejitsu](https://www.nodejitsu.com/) which is a hoster dedicated to NodeJS hosting. Getting an account is really easy and can be done via their website.

Hosting and deploying can be done with their command line tool which needs to be installed via NPM (so you need NodeJS available on your computer). Installing the tool is as easy as: `npm install -g jitsu`.

Afterwards we need to login with the credentials that we also entered on the website: `jitsu login`.

Deploying apps to Nodejitsu is essentially different to deploying them to Uberspace. For example we can't access the server via SSH so there is no way for us to use git for the deployment. Nodejitsu simply takes the complete folder that you use for your app and uploads it to their servers (it is possible to ignore files which are defined in the `.npmignore`).