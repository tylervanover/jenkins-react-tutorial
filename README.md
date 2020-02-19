# Tic-React-Toe
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

Now, you'll have a container running the `jenkins/jenkins:lts` image. 

Let's rename it so the container is easier to find: 

```sh
docker rename {generated_name} my_jenkins
```

Finally, we should enable `restart always` so that the container has maximum up-time, reboots automatically, and starts with our development environment: 

```sh
docker update --restart always my_jenkins
```

> You need to have a Deploy Key and an API Access Token in order to setup the webhooks properly with your Jenkins box. Please refer to [Deploy Keys](https://developer.github.com/v3/guides/managing-deploy-keys/#deploy-keys) and [API Tokens](https://jenkins.io/blog/2018/07/02/new-api-token-system/) for more information. 

> Your API Access Token is used as the **Secret** in your GitHub webook

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
