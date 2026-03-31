---
layout: post
nav-class: dark
categories: sam
title: Systems, CI Updates Q1 2026
author-id: sam
---

### Code Coverage Reports - designing new GCOVR templates

A major effort this quarter and continuing on since it was mentioned in the last newsletter is the development of codecov-like coverage reports that run in GitHub Actions and are hosted on GitHub Pages. Instructions: [Code Coverage with Github Actions and Github Pages](https://github.com/boostorg/boost-ci/blob/master/docs/code-coverage.md). The process has really highlighted a phenomenon in open-source software where by publishing something to the whole community, end-users respond back with their own suggestions and fixes, and everything improves iteratively. It would not have happened otherwise. The upstream GCOVR project has taken an interest in the templates and we are working on merging them into the main repository for all gcovr users. Boost contributors and gcovr maintainers have suggested numerous modifications for the templates. Great work by Julio Estrada on the template development.

- Better full page scrolling of C++ source code files
- Include 'functions' listings on every page
- Optionally disable branch coverage
- Purposely restrict coverage directories to src/ and include/ 
- Another scrolling bug fixed
- Both blue and green colored themes
- Codacy linting
- New forward and back buttons. Allows navigation to each "miss" and subsequent pages

### Server Hosting

This quarter we decommissioned the Rackspace servers which had been in service 10-15 years. Rene provided a nice announcement:

[Farewell to Wowbagger - End of an Era for boost.org](https://lists.boost.org/archives/list/boost@lists.boost.org/thread/XYFD42TTQRYHWTLGP6GCIZQ6NHCZLNQT/)

There was more to do then just delete servers, I built a new results.boost.org FTP server replacing the preexisting FTP server used by regression.boost.org. Configured and tested it. Inventoried the old machines, including a monitoring server. Built a replacement wowbagger called wowbagger2 to host a copy of the website - original.boost.org. The monthly cost of a small GCP Compute instance seems to be around 5% of the Rackspace legacy cloud server. Components: Ubuntu 24.04. Apache. PHP 5 PPA. "original.boost.org" continues to host a copy of the earlier boost.org website for comparison and development purposes which is interesting to check.

Launched server instances for corosio.org and paperflow.

### Fil-C

Working with Tom Kent to add Fil-C https://github.com/pizlonator/fil-c test into the regression matrix https://regression.boost.org/ .
Built a Fil-C container image based on Drone images.
Debugging the build process. After a few roadblocks, the latest news is that Fil-C seems to be successfully building.  This is not quite finished but should be online soon.

### Boost release process boostorg/release-tools

The boostorg/boost CircleCI jobs often threaten to cross the 1-hour time limit. Increased parallel processes from 4 to 8. Increased instance size from medium to large.
And yet another adjustment: there are 4 compression algorithms used by the releases (gz, bz2, 7z, zip) and it is possible to find drop-in replacement programs that 
go much faster than the standard ones by utilizing parallelization. lbzip2 pigz. The substitute binaries were applied to publish-releases.py recently. Now the same idea in ci_boost_release.py. All of this reduced the CircleCI job time by many minutes.  

Certain boost library pull requests were finally merged after a long delay allowing an upgrade of the Sphinx pip package. Tested a superproject container image for the CircleCI jobs with updated pip packages. Boost is currently in a code freeze so this will not go live until after 1.91.0. Sphinx docs continue to deal with upgrade incompatibilities. I prepared another set of pull requests to send to boost libraries using Sphinx.

### Doc Previews and Doc Builds  

Antora docs usually show an "Edit this Page" link. Recently a couple of Alliance developers happened to comment the link didn't quite work in some of the doc previews, and so that opened a topic to research solutions and make the Antora edit-this-page feature more robust if possible. The issue is that Boost libraries are git submodules. When working as expected submodules are checked out as "HEAD detached at a74967f0" rather than "develop". If Antora's edit-this-page code sees "HEAD detached at a74967f0" it will default to the path HEAD. That's wrong on the GitHub side. A solution we found (credit to Ruben Perez) is to set the antora config to edit_url: '{web_url}/edit/develop/{path}'. Don't leave a {ref} type of variable in the path.

Rolling out the antora-downloads-extension to numerous boost and alliance repositories. It will retry the ui-bundle download.  

Refactored the release-tools build_docs scripts so that the gems and pip packages are organized into a format that matches Gemfile and requirement.txt files, instead of what the script was doing before "gem install package". By using a Gemfile, the script becomes compatible with other build systems so content can be copy-pasted easily.

CircleCI superproject builds use docbook-xml.zip, where the download url broke. Switched the link address. Also hosting a copy of the file at https://dl.cpp.al/misc/docbook-xml.zip

### Boost website boostorg/website-v2

Collaborated in the process of on-boarding the consulting company Metalab who are working on V3, the next iteration of the boost.org website.  

Disable Fastly caching to assist metalab developers.

Gitflow workflow planning meetings.  

Discussions about how Tools should be present on the libraries pages.

On the DB servers, adjusted postgresql authentication configurations from md5 to scram-sha-256 on all databases and multiple ansible roles. Actually this turns out to be a superficial change even though it should be done. The reason is that newer postgres will use scram-sha-256 behind-the-scenes regardless. 

Wrote deploy-qa.sh, a script to enable metalab QA engineers to deploy a pull request onto a test server. The precise git SHA commit of any open pull request can be tested.

Wrote upload-images.sh, a script to store Bob Ostrom's boost cartoons in S3 instead of the github repo.

### Mailman3

Synced production lists to the staging server. Wrote a document in the cppalliance/boost-mailman repo explaining how the multi-step process of syncing can be done.

### boostorg

Migrated cppalliance/decimal to boostorg/decimal.

### Jenkins

The Jenkins server is building documentation previews for dozens of boostorg and cppalliance repositories where each job is assigned its own "workspace" directory and then proceeds to install 1GB of node_modules. That was happening for every build and every pull request. The disk space on the server was filling up, every few weeks yet another 100GB. Rather than continue to resize the disk, or delete all jobs too quickly, was there the opportunity for optimization? Yes. In the superproject container image relocate the nodejs installation to /opt/nvm instead of root's home directory. The /opt/nvm installation can now be "shared" by other jobs which reduces space. Conditionally check if mermaid is needed and/or if mermaid is already available in /opt/nvm. With these modifications, since each job doesn't need to install a large amount of npm packages the job size is drastically reduced.

Upgraded server and all plugins. Necessary to fix spurious bugs in certain Jenkins jobs.

Debugging Jenkins runners, set subnet and zone on the cloud server configurations.

Fixed lcov jobs, that need cxxstd=20

Migrated many administrative scripts from a local directory on the server to the jenkins-ci repository. Revise, clean, discard certain scripts.

Dmitry contributed diff-reports that should now appear in every pull request which has been configured for LCOV previews.

Implemented --flags in lcov build scripts [--skip-gcovr] [--skip-genhtml] [--skip-diff-report] [--only-gcovr]

Ansible role task: install check_jenkins_queue nagios plugin automatically from Ansible.  

### GHA

Completed a major upgrade of the Terraform installation which had lagged upstream code by nearly two years.

Deployed a series of GitHub Actions runners for Joaquin's latest benchmarks at https://github.com/boostorg/boost_hub_benchmarks. Installed latest VS2026. MacOS upgrade to 26.3.

### Drone

Launched new MacOS 26 drone runners, and FreeBSD 15.0 drone runners.

