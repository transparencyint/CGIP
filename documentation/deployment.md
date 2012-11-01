# Deployment

## Preparations

It is neccessary that you've already finished all the steps in `hosting.md` (will be added soon).

### Remote repository

Connect via SSH to you server create a folder and name it `cgip.git`. Navigate inside that folder and create a new bare git repository with `git init --bare`. Bare repositories don't contain the working tree of a repository and are therefore very lightweight. We will use this repo only for git hooks.

Now go to the `hooks` folder and create file called `post-receive` and fill it with the following commands: (I used `nano` for it but you could also upload it via FTP)

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

	# build tbe server and restart the service
	./node_modules/brunch/bin/brunch build
	export NODE_ENV=production
	svc -du ~/service/cgip

	# echo something nice ;)
	echo Successfully deployed the newest master!
	
It should be pretty self-explanatory with the given comments. After you have created the file, make sure that it is executable.

This script will be executed everytime there is something new pushed to this repository.

## Deploy with push

Now let's do the magic push-deploy. Navigate to your local repository and create a new remote that points to the bare repo we just created: `git remote add deploy ssh://username@server.url/home/username/cgip.git`. Now there's a remote called `deploy`. When we now push the master to this repository git should execute the `post-receive` script.

Let's try it: `git push deploy master`

![screenshot of the console](http://cl.ly/image/0e1c0S2O300F/Screen%20Shot%202012-07-28%20at%203.07.56%20AM.png)

Wooohooo, seems like it worked quite well.

Push rights to the bare repo are handled via SSH and therefore all the people that should be allowed to deploy have to add their public keys to the server.