---
layout: post
nav-class: dark
categories: sam
title: Sam's Q3 Update
author-id: sam
---

Here's an overview of projects I have been working on the last few months.

Github Actions self-hosted runners: based on https://github.com/philips-labs/terraform-aws-github-runner/ - Set up a second functional staging environment. Refactor code to work in both environments. Logic improvements. Sent doc updates upstream in PR. Also a PR to fix launching server instances. Added terraform in boostorg/beast, unordered, url. Improve AMI image builds. Rebuild with auth enabled, more disk space, packages. Debug build-tools installation issue on Windows 2022.

Develop self-hosted runners admin server at gha.cpp.al: https://github.com/cppalliance/github-runner-admin. Has the capability to switch to self-hosted runners based on # of jobs as a decision algorithm. Implement prometheus/grafana data collection and monitoring of tagr system, including number of queued jobs, number of active runners launched, account billing status. Query github api to fetch statistics.

Boostorg website cppalliance/temp-site: send Frank info on jfrog analytics. Add mailgun keys. Run the import releases scripts. Add variables, tokens, in kube files. Add domains to ingress. Implement social auth on prod websites. Debugging profile photo upload. Setting up backups for db1 and staging-db1 machines. Both snapshot backups and dumps to cloud storage. Deploy admin-server.boost.cpp.al server, for ansible and admin tasks related to website. Test multiple ways to use certificates with ingress. Report db connection leak, Frank fixed. Enabled versioning on S3 buckets. Tested restore procedure on directory in S3 bucket with versions enabled. Set up queries in GCP Cloud Logging, which discovers certain backend warnings/errors. Deploy site on preview.boost.org domain. Submitted and merged redis memorystore PR. Submitted and merged string quoting PR. Discuss boost-beta releases with Lacey.

Mailman servers project: Modify ansible role to be able to only provision mailman-core, rather than full stack. Include database, postfix, nginx, in the role. Posting to mm3 mailing list about results. Deploy multiple production and staging mailman3 core servers. Future: should re-configure/replace those servers with boost.org domain instead of cppalliance.org domain. GKE networking topic, connection between core and web. Add feature in temp-site, hostAliases.

Install and set up mrdox.com website on vm. Resize disk.

Create an AWS account for Anarthal to work on BoostTech project. Sent PR to Zajo, switch drone to newer macs.

Release tools. New feature in boostorg/release-tools to upload develop/master docs from the archives to s3 so the new website can host. Review and discuss release-tools with Alan. Add feature in publish_releases.py to upload to S3. Lint code in boostorg/release-tools. rebuild, upload 2204 image to dockerhub for release-tools, uses python-is-python3 package. Refactor build_docs CI, more efficiently display results. Debugging specific boost libraries with build_docs.

old boost.org website: Assist Marshall with boost-tasks script. Review update-super-project.

Fix JSON benchmarks. Discuss strategies with Dmitry.

Drone machine OS upgrade.
