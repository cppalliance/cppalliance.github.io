---
layout: post
nav-class: dark
categories: sam
title: Automated Documentation Previews
author: Sam Darwin
author-id: sam
---
# Overview

Greetings, and welcome to my first blog post at The C++ Alliance.

I've recently begun working on an interesting project for the Alliance which might also have more widespread applicability. The same requirement could possibly apply to your organization as well. 

Consider an open-source project that has multiple contributors who are submitting changes via pull-requests in Github. You'd like to have assurances that a pull-request passes all tests before being merged. That is done with continuous integration solutions such as Travis or Circle-CI, which are quite popular and well-known. Similarly, if the submission is *documentation*, you would like to be able to view the formatted output in it's final published format so you can review the layout, the colors, and so on. What would be the best way to build and publish documentation from pull requests?

Perhaps the first thought would be to include the functionality in Travis or Circle-CI. And that is certainly possible. However, in some cases there may be sensitive passwords, ssh keys, or other tokens in the configuration. Is it safe to allow random pull requests, from conceivably anyone on the whole internet, to trigger a Circle-CI build that contains authentication information? Let's explore that question, and then present a possible alternative that should be more secure.

# Security

In Circle-CI, you can choose to enable or disable jobs for Pull Requests. It's clearly safer to leave them disabled, but if the goal is to run automatic tests, this feature must be turned on. Next, you may choose to enable or disable access to sensitive keys for Pull Requests. This sounds like a great feature that will allow the jobs to be run safely. You could build Pull Requests with limited authorization. But what if you'd like to include secret keys in the build, that are needed to publish the documentation to an external server which is going to host the resulting content. After building the docs, they must be transferred to wherever they will be hosted. That means you must either include the secret keys in plain text, or toggle the setting to enable sensitive keys in Circle-CI.

Let's briefly think about the latter option. If secret keys are enabled in Circle-CI, they are not outright published or visible to the end-user. The build system obfuscates them. The obfuscation is a good first step. Unfortunately, there's a file called .circleci/config.yml in the project, which contains all the commands to be run by the build system. A pull request could modify that file so that it prints the secrets in clear text.

What can be done?

The answer - which is not overly difficult if you already have some experience - is to run an in-house build server such as Jenkins. This adds multiple layers of security: 

- Optionally, does *not* publicly print the build output.
- Optionally, does *not* run based on a .circleci file or Jenkinsfile, so modifying the configuration file is not an avenue for external attacks.
- For each build job, it will only include the minimal number of secret keys required for the current task, and nothing more.

While the new system may not be impregnable, it's a major improvement compared to the security issues with Circle-CI for this specific requirement.

# Design

Here is a high level overview of how the system operates, before getting into further details. 

A jenkins server is installed.

It builds the documentation jobs, and then copies the resulting files to AWS S3.

The job posts a message in the GitHub pull request conversation with a hyperlink to the new docs.

Each pull request will get it's own separate "website". There could be hundreds of versions being simultaneously hosted. 

An nginx proxy server which sits in front of S3 serves the documents with a consistent URL format, and allows multiple repositories to share the same S3 bucket.

The resulting functionality can be seen in action. On this pull request [https://github.com/boostorg/beast/pull/1973](https://github.com/boostorg/beast/pull/1973) a message appears:

| An automated preview of the documentation is available at [http://1973.beastdocs.prtest.cppalliance.org/libs/beast/doc/html/index.html](http://1973.beastdocs.prtest.cppalliance.org/libs/beast/doc/html/index.html) |

The link takes you to the preview, and will be updated with each new commit to the pull request.

# More Details

The Jenkins server polls each configured repository at a 5 minute interval, to see if a new pull request has been added. Alternatively, instead of polling, you may add a webhook in Github.

Each repository corresponds to a separate Jenkins "project" on the server. A job checks out a copy of the submitted code, runs the specific steps necessary for that codebase, and uploads the resulting website to an AWS S3 bucket.

The configuration leverages a few Jenkins plugins:<br>
- "GitHub Pull Request Builder" to launch jobs based on the existence of a new pull request.
- "S3 Publisher Plugin" for copying files to S3.
- "CloudBees Docker Custom Build Environment Plugin" to run the build inside an isolated docker container.

One previews bucket is created in S3 such as s3://example-previews

The file path in the S3 bucket is formatted to be "repository"/"PR #". For example, the filepath of pull request #60 for the repo called "website" is s3://example-previews/website/60

The web URL is generated by inverting this path, so "website/60" becomes "60.website". The full URL has the format "60.website.prtest.example.com". This translation is accomplished with an nginx reverse proxy, hosted on the same Jenkins server.

nginx rule:<br>
rewrite ^(.*)$ $backendserver/$repo/$pullrequest$1 break;

A wildcard DNS entry sends the preview visitors to nginx:<br>
*.prtest.example.com -> jenkins.example.com

# Implementation

In this section, we will go over all the steps in detail, as a tutorial.

In the following code sections,<br>
Replace "example.com" with your domain.<br>
Replace "website" with your repository name.<br>
Replace "example-previews" with your S3 bucket name.

### General Server Setup
  
Install Jenkins - https://www.jenkins.io/doc/book/installing/  
  
Install SSL certificate for Jenkins (jenkins.example.com):  
```  
apt install certbot  
certbot certonly  
```  
  
Install nginx.  

```
apt install nginx
```

Create a website, as follows:  
```  
server {  
    listen 80;  
    listen [::]:80;  
    server_name jenkins.example.com;  
    location '/.well-known/acme-challenge' {  
        default_type "text/plain";  
        root /var/www/letsencrypt;  
    }  
    location / {  
         return 301 https://jenkins.example.com:8443$request_uri;  
    }  
}  
  
server {  
listen 8443 ssl default_server;  
listen [::]:8443 ssl default_server;  
ssl_certificate /etc/letsencrypt/live/jenkins.example.com/fullchain.pem;  
ssl_certificate_key /etc/letsencrypt/live/jenkins.example.com/privkey.pem;  
#include snippets/snakeoil.conf;  
location / {  
include /etc/nginx/proxy_params;  
proxy_pass http://localhost:8080;  
proxy_read_timeout 90s;  
}  
}  
```  
 
Set the URL inside of Jenkins->Manage Jenkins->Configure System to be https://_url_ , replacing _url_ with the hostname such as jenkins.example.com.
 
Install the plugin "GitHub pull requests builder"  
Go to ``Manage Jenkins`` -> ``Configure System`` -> ``GitHub pull requests builder`` section.  
  
Click "Create API Token". Log into github. 
  
Update "Commit Status Build Triggered", "Commit Status Build Start" to --none--  
Create all three types of "Commit Status Build Result" with --none--  
  
On the server:  
  
```  
apt install git build-essential  
```  
  
Install the plugin "CloudBees Docker Custom Build Environment"  
  
add Jenkins to docker group

```
usermod -a -G docker jenkins
```

Restart jenkins.  

```
systemctl restart jenkins
```
  
Install the "S3 publisher plugin"
  
In Manage Jenkins->Configure System, go to S3 Profiles, create profile. Assuming the IAM user in AWS is called "example-bot", then create example-bot-profile with the AWS creds. The necessary IAM permissions are covered a bit further down in this document. 
  
Install the "Post Build Task plugin"
 
### Nginx Setup
  
Create a wildcard DNS entry at your DNS hosting provider:  
*.prtest.website.example.com CNAME to jenkins.example.com  
  
Create an nginx site for previews:  
  
```  
server {  
    # Listen on port 80 for all IPs associated with your machine  
    listen 80 default_server;  
  
    # Catch all other server names  
    server_name _;  
  
    if ($host ~* ([0-9]+)\.(.*?)\.(.*)) {  
        set $pullrequest $1;  
        set $repo $2;  
    }  
  
    location / {  
        set $backendserver 'http://example-previews.s3-website-us-east-1.amazonaws.com';  
  
        #CUSTOMIZATIONS  
        if ($repo = "example" ) {  
          rewrite ^(.*)/something$ $1/something.html ;  
        }  
  
        #FINAL REWRITE  
        rewrite ^(.*)$ $backendserver/$repo/$pullrequest$1 break;  
  
        # The rewritten request is passed to S3  
        proxy_pass http://example-previews.s3-website-us-east-1.amazonaws.com;  
        #proxy_pass $backendserver;  
        include /etc/nginx/proxy_params;  
        proxy_redirect /$repo/$pullrequest / ;  
    }  
}  
  
```  
  
### AWS Setup  
  
Turn on static web hosting on the bucket.  
Endpoint is http://example-previews.s3-website-us-east-1.amazonaws.com  
  
Add bucket policy  
  
```  
{  
    "Version": "2012-10-17",  
    "Statement": [  
        {  
            "Sid": "PublicReadGetObject",  
            "Effect": "Allow",  
            "Principal": "*",  
            "Action": "s3:GetObject",  
            "Resource": "arn:aws:s3:::example-previews/*"  
        }  
    ]  
}  
```  
  
Create an IAM user and add these permissions
  
```  
    "Version": "2012-10-17",  
    "Statement": [  
        {  
            "Effect": "Allow",  
            "Action": [  
                "s3:GetBucketLocation",  
                "s3:ListAllMyBuckets"  
            ],  
            "Resource": "*"  
        },  
        {  
            "Effect": "Allow",  
            "Action": [  
                "s3:ListBucket"  
            ],  
            "Resource": [  
                "arn:aws:s3:::example-previews"  
            ]  
        },  
        {  
            "Effect": "Allow",  
            "Action": [  
                "s3:PutObject",  
                "s3:GetObject",  
                "s3:DeleteObject"  
            ],  
            "Resource": [  
                "arn:aws:s3:::example-previews/*"  
            ]  
        }  
    ]  
}  
```  
  
### JENKINS FREESTYLE PROJECTS   
  
Create a new Freestyle Project
 
Github Project (checked)  
Project URL: https://github.com/yourorg/website/  
  
Source Code Management  
Git (checked)  
Repositories: https://github.com/yourorg/website
Credentials: github-example-bot (you should add a credential here, that successfully connects to github)
Advanced:  
Refspec: +refs/pull/*:refs/remotes/origin/pr/*  
Branch Specifier: ${ghprbActualCommit}  
  
Build Triggers  
GitHub Pull Request Builder (checked)  
GitHub API Credentials: mybot  

#Consider whether to enable the following setting.
#It is optional. You may also approve each PR.
Advanced:
Build every pull request automatically without asking.    
  
Trigger Setup:    
Build Status Message:    
`An automated preview of this PR is available at [http://$ghprbPullId.website.prtest.example.com](http://$ghprbPullId.website.prtest.example.com)`  
Update Commit Message during build:  
Commit Status Build Triggered: --none--  
Commit Status Build Started: --none--  
Commit Status Build Result: create all types of result, with message --none--  
  
Build Environment:  
Build inside a Docker container (checked)  
#Note: choose a Docker image that is appropriate for your project   
Pull docker image from repository: circleci/ruby:2.4-node-browsers-legacy  
 
Build:  
Execute Shell:  
```  
#Note: whichever build steps your site requires.
```  
  
Post-build Actions  
Publish artifacts to S3  
S3 Profile: example-bot-profile  
  
Source: _site/** (set this value as necessary for your code)  
Destination:  example-previews/example/${ghprbPullId}  
Bucket Region: us-east-1  
No upload on build failure (checked)  

#The following part is optional. It will post an alert into a Slack channel.  
Add Post Build Tasks  

Log Text: GitHub

Script:

```
#!/bin/bash
PREVIEWMESSAGE="A preview of the example website is available at http://$ghprbPullId.example.prtest.example.com"
curl -X POST -H 'Content-type: application/json' --data "{\"text\":\"$PREVIEWMESSAGE\"}"  https://hooks.slack.com/services/T21Q22/B0141JT/aPF___
```

Check box "Run script only if all previous steps were successful"

In Slack administration, (not in jenkins), create a Slack app. Create a "webhook" for your channel. That webhook goes into the curl command. 
