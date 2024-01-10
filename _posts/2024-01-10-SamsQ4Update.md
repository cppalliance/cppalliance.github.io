---
layout: post
nav-class: dark
categories: sam
title: Sam's Q4 2023 Update
author-id: sam
---

Here's an overview of some projects I have been working on the last few months.

### Doc Previews

A Jenkins server is building "pull request doc previews" for multiple boost repositories. If any Boost author is interested in "doc previews" let me know.

Specific previews: adding an Antora version to boostorg/url.

Upgraded the server packages, apps, and operating system to Ubuntu 22.04.

Mr. Docs has a dedicated server for docs testing. Debugged CI deployment issues there.  

### JSON benchmarks

https://benchmark.cppalliance.org/

Continued from the previous month, updated JSON benchmarks scripts to use a consistent output file location and revised jamfile.

### Boostorg website cppalliance/temp-site

Added prometheus and nagios monitoring alerts. Checking on status of db backup scripts. Upgraded CircleCI so release-tools will deploy to AWS S3, and temp-site will publish develop/master snapshots. Slack chat with Greg about library documentation. Test/debug slow load times of library docs on the site and reported findings. Discussions with Spencer about how URL maps ought to work. Sent Glen/Marshall info about deploying new boost releases on preview.boost.org. Ran a sync from prod to stage, including database and S3 files, so that stage looks like production. Added Frank and Lacie in GCP.  On the topic of quickbook for release notes: probably migrate to asciidocs. Created docs at https://github.com/cppalliance/temp-site-documentation. Deploy more domain names for testing. boost.io. Sent Calendar API info to Lacie. Wowbagger: cron scripts to backup files.

### Load testing

Investigated https://github.com/locustio/locust/ and Bees with Machine Guns. Installed both tools. Sent a PR (merged) to locustio improving their terraform script. After a couple days, for the sake of time, concluded we can solve 'load testing' problems by installing a CDN in front of the website, thus removing most traffic. Switch to that goal.

### CDN Fastly

Set up a CDN front-end to the temp-site at Fastly. Extensive testing, many iterations of VCL. Added SSL certificates. Opened a case to discuss the existing conflict/overlap when acme-challenge is used on both the backend cluster, and the CDN. They are planning to implement a new RFC in the next year to improve the situation. The same hostname should be applied on all servers so that social auth works. Updated kubernetes from "Ingress" to "Gateway API", to improve SSL requests. Deployed "Gateway" in each environment.

### boostorg/release-tools

Assisted Alan, who is adding Antora support to boost releases. Generated docker images with additional nodejs packages. Debug/test the main release scripts, which were modified.
Added packages to the images for Klemens. Added CI, code formatter 'black', similar to website. Updated boostorg/boost to use the new images.

### Mailman project

Setting up test instances of mailman2 and mailman3, to test and document mailman users, members, passwords, especially after an upgrade/migration. Wrote an improved documentation section for mailman-suite (merged) at https://gitlab.com/mailman/mailman-suite-doc. Various updates to cppalliance/ansible-mailman3 codebase. Meetings with Boost Foundation about the mailing lists. Install ElasticSearch on all instances. Added kube variables in temp-site, pointing to mm instances. Mailman cli test.

### Self-hosted runners

Analyzing the large codebase at philips-labs/terraform-aws-github-runner (tagr). Sent them yet another bugfix. Also, there is an outstanding issue (they still have not implemented) whereby the default runner labels can be entirely replaced/customized, and if that is done, tagr could be rolled out to more repositories with less risk of unforseen conflicts caused by label matching in the future. Ongoing. Installed LLVM on windows-2022 image.

### Drone

Upgraded the Drone executable itself. New dark mode support! That's the last commit from Drone which is being transmogrified into "https://github.com/harness/gitness". When gitness is eventually ready it may become a drop-in replacement, but that is not yet certain.

As requested by Alexander, install the latest "macOS 14 Sonoma" machines. Worked with boostorg/math to retire the oldest "macOS 10.13 High Sierra" that are now offline, and use 14. New drone 23.10 image for Peter. Sent a PR to boostorg/url to centralize the drone 'generate' function at cppalliance/ci-automation.

