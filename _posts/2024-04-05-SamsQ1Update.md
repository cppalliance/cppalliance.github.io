---
layout: post
nav-class: dark
categories: sam
title: Sam's Q1 2024 Update
author-id: sam
---

Here's an overview of some projects I have been working on the last few months.

### Boost Downloads

Set up an AWS Cloudfront CDN at archives.boost.io to host the Boost releases during an outage. JFrog is planning to cancel the account, and the outage was an unintentional (or intentional) warning. Extensive experimentation using a Fastly CDN in conjunction with JFrog, however they are sending S3 redirects which prevent this configuration. Installed another origin server and a load balancer. Debugged nginx. Added TLS. archives.boost.io has now been migrated from AWS Cloudfront to Fastly, with our own origin servers being the source rather than JFrog. 50TB of traffic each month even when not advertised on boost.org. The download traffic is mostly from the React open source project.

### Boost website boostorg/website-v2

Configured and tested TLS certificates in GCP. Increased cpu/mem on production. Composed a runbook for go-live steps of the boost website. Worked on automating this as much as possible, for example, a sticking point was that Social Auth (google, github) was locked to only one DNS domain. It would not respond on preview and www simultaneously. Solving that took many detours into other components, the Django "sites" framework and the allauth codebase. Worked with Lacey on a number of github issues, the main one being the problem that previous versions of boost libraries use inconsistent documentation paths. Each exception should be handled individually. Developed comprehensive script to sync boost.io production to staging (database + S3 files). Researching postgres backup/restore topics. Migrated preview.boost.org to www.boost.io. Some issues with transition to boostorg github. Solved trailing-slash bug: website links are missing the final slash character needed for a directory.

Created a static html mirror of boost.org: boost.org.cpp.al.

### boostorg/release-tools

Sent a PR to boostorg/boost with an updated release docker image. Refactored multiple scripts to be able to support Github Releases if that option is needed in the future. Consider options to reduce the size of the releases, such as a source-only distribution. Still in the planning stages with Alan, not done. Discussion about extra Antora files in the release artifact. Developed new scripts so published releases will sync to the new CDN. Created S3 bucket boost-archives, copying files from JFrog.

Debugging boostorg/cobalt docs build, sent image files to Klemens.

### Mailman project

Set up new test mailman servers for each environment (production, stage, etc). VMs, mailgun account, DNS, databases. Imported previous archives. Updated Ansible role to support Elasticsearch. Opened tickets with Hyperkitty about search results, display formats. Refactored ansible-mailman settings.py file to use an .env file instead of ansible variables, so it can integrate more easily with external dev environments. Created another github repo to collaborate on mailman. Checking on mailman cronjobs. Upgraded Hyperkitty.

### wowbagger

Early in January, engaged in discussions with the Boost Foundation about the condition of wowbagger, its relevance, list of services, issues in upgrading it.

### Jenkins

Reconfigure certain jobs to use their own node_modules directories, not a shared directory.

### Drone

Investigated and solved FreeBSD b2 crash. Deleted gcc symlink, only gcc11 remains. Advising tzlaine/parser about Drone integration.

