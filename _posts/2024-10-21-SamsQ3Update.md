---
layout: post
nav-class: dark
categories: sam
title: Cloud  and Infrastructure Update Q3 2024
author-id: sam
---

### Boost release process boostorg/release-tools

In the previous quarter, publish_release.py included features to support the Fastly CDN at archives.boost.io. This quarter, that functionality was put into action with the release of Boost 1.86.0, and it was a chance to fine-tune and improve the script. More error checking. Adding a preflight phase to test SSH. Adjusting the publish_release.py script to stage windows executables for Tom Kent, so they are relocated to a publicly visible folder during a release.
Generally the file upload target is AWS S3, and from there the CDN origin servers download the archives.
Revamping build_docs scripts: add python venv to mac and windows. Support macos-14.
Briefly investigating docca - python issue that affected boost builds.
Deployed 24.04 version of docker image for the main boostorg/boost jobs. Fixed zip and 7z failures appearing on 24.04.

### Boost website boostorg/website-v2

Composed a cost inventory spreadsheet of the new infrastructure. Debugging an outage of the site that was traced back to redis -> django-health-check -> celery. Frank Wiles from Revsys ultimately solved this puzzle by adjusting a celery configuration variable.

Wrote local website development bootstrap scripts that will install all prerequisites for local development and then even launch docker-compose. Versions for mac, windows, linux. Updated the corresponding documentation, such that it's equally feasible to go through the steps manually to see what's being installed and then launch docker-compose from the command-line.

Researched how to selectively purge the Fastly CDN cache - and specifically applying that to /release/ on boost.io.  

### Mailman project

Revising runbook (steps to go-live in the future).
Incorporated Greg's changes to install a boost.io header on the mailing lists. Reduced and consolidated those files. Created ansible deployment for that feature. Now temporarily removing customizations before deployment. They may be returned later.
Upgraded the operating system on all mm3 test instances. Tested. Switched the search engine from Elastic Search to Xapian, which is better supported in terms of the Django modules.
Submitted upstream pull requests (merged) which
- document an improved Xapian installation method
- further document how the core and web components interact in terms of the db

### Slack

Discussing slackbot implementations with Kenneth.

### wowbagger

Documented and published issues about the various problems on the legacy web server.
Contributed to Kenneth's docker-compose strategy for the original boost.org website to allow local development via docker-compose, by downloading boost archives so the local environment is functional.
Worked with Rob to include Plausible analytics on boost.org.

### Jenkins

Investigate/repair doc builds of mrdocs, http_proto.
Modify doc builds of beast, url.
Generated PR doc builds of safe-cpp. Added a GHA step to render the html upon commit.
Upgraded the Jenkins executable, and plugins.
Set up previews of boostlook. master/develop and PRs.

### JSON Benchmarks

After experimenting on a Hetzner server, switched JSON Benchmarks to a new Xeon processor from KnownHost. Intel core processors are aimed at the consumer market while Xeon is a server architecture and is more consistent when running benchmark tests. Replaced Jenkins runner, canceled previous server.

### GHA

Debugging certain boost library jobs. Also, with the hosted runners, determined there was a systematic problem that the bootprocess was timing out too quickly. Adjusted terraform settings and redeployed. Would be good to propose a PR upstream to terraform: the timeout is too fast.
Enabled billing for math-cuda gpu tests.
Macminivault billing issues.
Resizing terraform runner Windows 2022, to add 30GB more disk space, and Pagefile (memory).
Built new Ubuntu runners, newer kernel, adjusting OS versions on boostorg/unordered GHA to fix sanitizers.

### Drone

Assisted developers in debugging jobs.
Scripted docker image cleanup on drone instances. 
Installed a cron job to clear the autoscaler, solving an issue that occasionally jobs get stuck in pending mode, preventing the instances from scaling.
