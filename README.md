# Jenkins-React-Tutorial
This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app). 
<br>Learning from [ReactJS Tutorial](https://reactjs.org/tutorial/tutorial.html). 

## Setup for a `create-react-app` base
Make sure that Node.js is installed, then: 

```sh
npx create-react-app your-app-name
```

## Tools Used

### Jenkins
Jenkins is the build/automation server for the CI/CD loop. 

Running jenkins using Docker Desktop for Windows via [jenkins/jenkins:lts](https://hub.docker.com/r/jenkins/jenkins) image:

```sh
docker pull jenkins/jenkins:lts
```

Setup a container to run in the background. Use a volume to maintain persistent data while not falling into the bind mount struggles with Jenkins user: 

```sh
docker run -d -p 8080:8080 -p 50000:50000 -v jenkins_home:/var/jenkins_home jenkins/jenkins:lts
```

### Jenkins and NPM
We want to run NPM builds from Jenkins, so we need to seed our image. We could do this with a compose and Dockerfile, but for now let's add in the requisite build to our container. First, log into the {generated_name} container: 

```sh
winpty docker exec -it -u root {generated_name} bin/bash
```

This will drop you in as `root` in the jenkins container we just spun up. We need to update our apt-get cache, install sudo, and then add the node repos and install nodejs.,

```
root@4162d686f0e1:/#
root@4162d686f0e1:/# apt-get update

root@4162d686f0e1:/# apt-get install -y sudo
root@4162d686f0e1:/# apt-get install -y curl

root@4162d686f0e1:/# curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -

root@4162d686f0e1:/# apt-get install -y nodejs
```

Now, you'll have a container running the `jenkins/jenkins:lts` image with node and npm installed on top of it.

### Commit a New Image and Rename
We should commit a new image now that we've modified the `jenkins/jenkins:lts`. We can do that by saying: 

```sh
# generic
docker commit {generated_name} newimage/namegoeshere:version

# example
docker commit {generated_name} testing/jenkins-npm:latest
```

Let's rename it so the container is easier to find: 

```sh
docker rename {generated_name} my_jenkins
```

Finally, we should enable `restart always` so that the container has maximum up-time, reboots automatically, and starts with our development environment: 

```sh
docker update --restart always my_jenkins
```

### Jenkins Access

You need to have a Deploy Key and an API Access Token in order to setup the webhooks properly with your Jenkins box. Please refer to [Deploy Keys](https://developer.github.com/v3/guides/managing-deploy-keys/#deploy-keys) and [API Tokens](https://jenkins.io/blog/2018/07/02/new-api-token-system/) for more information. 

Your API Access Token is used as the **Secret** in your GitHub webook


### Sonatype/Nexus3
Sonatype's Nexus3 will be our repository manager for stashing artifacts/npm builds. 

Running Nexus3 from a Docker container via [sonatype/nexus3](https://hub.docker.com/r/sonatype/nexus3/):

```sh
docker pull sonatype/nexus3
```

As we did with Jenkins, let's fire up a container with a mounted volume, and then rename and set a restart policy: 

```sh
# start a container
docker run -d -p 8081:8081 -v nexus_data:/nexus-data

# rename it
docker rename {generated_name} my_nexus

# restart policy
docker update --restart always my_nexus
```

### ngrok

Using ngrok as our reverse proxy service so that the local, dockerized services of Jenkins and Nexus can speak to the outside world. 

Please refer to the documentation at [Setting up a reverse proxy](https://github.com/tylervanover/jenkins-tutorial/wiki/Configuring-the-GitHub-Connection#setting-up-a-reverse-proxy) to review installation/explanation. 

Once our reverse proxy is up, we'll have a temporary URL which can be used for sending webhook payloads. 

### GitHub and Hook SCM Polling

We'll be using a combination of Jenkins with SCM hook polling and ngrok to fire off notifications with each push. 

That notification will be sent from GitHub to Jenkins, where it will trigger a build job, processing step, or anything in our workflow. 

Please refer to the documentation at [Configuring the GitHub Connection with GitHubHook SCM Polling](https://github.com/tylervanover/jenkins-tutorial/wiki/Configuring-the-GitHub-Connection#configuring-the-github-connection-with-githubhook-scm-polling--). 

### Testing
To test the front-end, we'll be using [Jest](https://jestjs.io/docs/en/getting-started) with npm. 

Whenever we setup our app, we need the following to our `package.json` file: 

```json
{
    "scripts": {
        "test": "jest"
    }
}
```

We'll also need to handle some [additional configurations](https://jestjs.io/docs/en/tutorial-react) to make sure **react**, **jest**, and our system are all playing nice. 

This enables us to use `npm run test` in our build pipeline to execute the tests and get a result:

```
$ npm run test

> tic-react-toe@0.1.0 test D:\repos\tic-react-toe
> jest

 PASS  tests/sum.test.js
  √ sums two numbers (5ms)

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
Snapshots:   0 total
Time:        4.169s
Ran all test suites.
```