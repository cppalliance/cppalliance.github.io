---
layout: post
nav-class: dark
categories: sam
title: Doc Previews Revisited Q4 2024
author-id: sam
---

Here's an overview of some projects I have been working on the last few months.

### Jenkins

The main focus this quarter has been an overhaul of the Jenkins installation. We have been running a Jenkins instance to generate documentation previews for many Boost repositories, as well as JSON benchmarks, and lcov/gcovr code coverage analysis. The jobs were configured as Freestyle Projects, the "classic, general-purpose job type". These have all now been replaced by "Multibranch Pipeline". Each category of job type uses a Jenkinsfile [(list of Jenkinsfiles)](https://github.com/cppalliance/jenkins-ci/blob/master/jenkinsfiles/) with the most common being "[standard_libraries_1](https://github.com/cppalliance/jenkins-ci/blob/master/jenkinsfiles/standard_libraries_1)". Even when multiple jobs vary slightly they may still use the same consolidated Jenkinsfile, and then load [pre- and post-build scripts](https://github.com/cppalliance/jenkins-ci/tree/master/scripts) to modify small details. Here is a current [list of jobs](https://github.com/cppalliance/jenkins-ci/blob/master/docs/inventory.md).  

An advantage of Multibranch Pipeline is the job configurations are more "open-source" than before. The code is visible at https://github.com/cppalliance/jenkins-ci, whereas before with the Freestyle Projects that was not the case.  

Also, the multibranch plugin UI handles pull requests better than the previous 'GitHub Pull Request Builder'. Each PR is given its own dedicated page and sub-configuration. Each PR can be stopped, started, restarted, disabled, etc. It's easier to work with than before.

The downside (if any) is that the configuration of pipelines must be composed in their Groovy based DSL (domain specific language) which is not YAML, or Python. The syntax can be unexpected, but accomplishing most basic tasks is fairly straight-forward.  Examples can be found on many websites.

Since nearly every new Job requires debugging before it goes live, there are new scripts to automate the process of testing new jobs on a github fork, right away, without manually setting up the arrangement of forking a repo, duplicating the job, etc.

By the way - why choose Jenkins over Github Actions or another hosted service? I discussed that in an earlier blog post "Automated Documentation Previews". See the review of security considerations there. Besides security, it's also convenient that target repositories don't need to do anything, whether that be merging additional files, or configuring widely distributed "secrets". For the developer, the preview jobs are automatic.  

### Boost website boostorg/website-v2

Completely reinstalled the website database servers, staging and production. The purpose was to upgrade Ubuntu, and Postgres, without disrupting the existing instances.

Minor improvements of the Fastly CDN configuration. Process 404s.

Opened a ticket with Fastly to debug unexpected TTLs. Resolved.

Revamping IP addresses on the k8s network to use certain private IPs.

Devising an http redirect from boost.io to boost.org, to enable later.

Set up downloads.cppalliance.org, initially for hosting release reports.

Collaborating with web developers, discussing the CDN, deployments, browser cookies, documentation releases, mailman db access, logs. Advised on boostlook CI workflow design.

### Boost release process boostorg/release-tools

Added features to build_docs scripts to install boostlook, antora, as well as testing mrdocs.    
Built newer release-tools docker images, with new gems/pip packages. This has been uploaded to Docker Hub.  
Sent PR to boostorg/geometry regarding docs builds.  
Sent PR to boostorg/gil, boostorg/python, to fix newer Sphinx.  
Designed a feature to contact boost.io via a webhook during a new boost version release in publish_release.py.  
Designed a feature to tag all git submodules during a new boost version release in publish_release.py.  
Wrote a page ["How docs are built"](https://github.com/cppalliance/website-v2-operations/tree/master/doc_builds).  
Modified commitbot configurable settings.  

### Mailman project

Creating further automation scripts to speed-up an import of mm2 lists into mm3. Script as much as possible, so that a migration goes in the fewest steps. Terraform to generate compute instance. Scripts to configure lists further.  

Imported mm2 lists again, providing data to boost.io release reports. Modified ansible roles to install postgres read-only users for report access.

Investigated mm2/mm3 subscriber stats on the servers.  

### Unordered Benchmarks

Installed a new macOS instance to run boostorg/unordered benchmark tests.

### GHA

Rebuild images. Resize instances. Add packages.

### boost-ci

Hosting a copy of unofficial nodejs, allowing Github Actions to continue functioning on Ubuntu 18.  
Sent PR to nodejs/unofficial-builds, documenting the installation procedure in their README. Merged.  
Discussed codecov functionality with jeking3. Opened an issue in the codecov-action repo about a bug.  
