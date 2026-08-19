---
layout: post
nav-class: dark
categories: sam
title: Cloud and Infrastructure Update Q1 2025
author-id: sam
---

Here's an overview of some projects I have been working on the last few months.

### Server Upgrades

The Ubuntu LTS 'Long Term Support' release 24.04 was officially available in April 2024, however it's not advisable to upgrade existing servers until the release has a chance to be field-tested and validated. Among other issues, the Ubuntu 24.04 zip package "fails when filenames contain unicode characters", which was a serious bug that affected release-tools. By April 2025 though, it seems reasonable to upgrade. The C++ Alliance is hosting around 35 server instances, many small or nano in size, for a variety of purposes. This quarter, upgraded all the operating systems to 24.04. If a workload is critical, there is a risk an in-place upgrade will disrupt that system, and so it's preferable to rebuild the machine from scratch and migrate. That is especially important for postgres database servers because an upgrade generates a completely new DB service with an empty database, causing multiple DBs to be running.  

Rebuilding an application server from scratch may involve many components. What if something gets skipped? To be sure everything is accounted for, I composed some new installation scripts with Ansible, that will allow future upgrades of 26.04 or 28.04 to run more easily also. For example, the github repository `cppalliance/ansible-paperbot` installs the Slack integration Paperbot onto a new server. To see what this does, in the Cpplang Slack workspace, invite @npaperbot to a channel and try "@npaperbot search constexpr".

Another new installer `cppalliance/ansible-drone` migrated the Alliance's Drone server to a new instance. This script includes crontab entries to clear frozen jobs, monitoring probes reporting the number of autoscaled instances, and automatically copies the postgres database from backup archives.  

Upgrading many servers at once has a benefit of serving as an inventory/review. Small problems can be discovered and corrected. For example, a server instance boost-library-stats.cpp.al depends on the Github API to retrieve repo statistics. The API format changed after a few years so the code needed a refresh. Another (recurring) issue, the latest Ubuntu is the first one to require Python virtual environments, which were purely optional in 22.04.

### boost-ci

Upgraded lcov from v1.15 to v2.3 in codecov.sh. While that sounds uneventful, in fact it turned into a project, since the new lcov generated numerous "ERRORS" that hadn't existed before. Almost certainly if you leverage boost-ci your boost library now has failing coverage reports using lcov 2.3 - except that through careful testing we have enabled "ignore-errors".  The ignored errors are "inconsistent, mismatch, unused". Examine the CI output of recent codecov and search for the string "warning". The errors have been replaced by warnings.

Of the 20 possible lcov error conditions, how can we be sure which need to be ignored? I wrote an automated report (in the feature/reports branch of boost-ci) that ran lcov on all boost libraries. The results confirmed the common errors. This is customizable with $LCOV_OPTIONS and $LCOV_IGNORE_ERRORS_LEVEL (see codecov.sh) so you may voluntarily switch back to a crashing codecov reports at any time.  

You might think "wait, you should leave errors enabled, and force developers to fix their mistakes." However there are multiple reasons not to do this. The main one is that lcov is encountering errors in the standard library itself, and so everyone's coverage reports would fail, without any way to fix that. Next, many boost developers are part-time and do not have unlimited resources. Should their coverage reports remain broken/unusable for a year or two before they are able to devote the proper time to fix them? And finally, the errors have not been hidden or removed. They have simply been converted to warnings that are still visible in the log output.  

### Jenkins

General adjustments to the new configuration and jenkinsfiles.  
New automated docs for boostorg/bloom library candidate.   
Iterations of redesigns for the boostorg/unordered docs.  
Migrate preview hosting to jenkins2.  
Among the Jenkins jobs are gcovr/lcov coverage reports. Refactored and improved those bash scripts, in the ci-automation repo.  

### Boost website boostorg/website-v2

Experimentation (ongoing) to install a Horizontal Pod Autoscaler HPA in the k8s cluster, which will automatically scale the deployment, and therefore allow a smaller deployment in steady-state when the cluster is not busy.  

Wrote a git deploy script for Rob. Mailman db dumps. Discussions about tino,non-tino deployments in boostlook.  

### Boost release process boostorg/release-tools

Multiple small bug fixes. JFrog was finally shut off which affected boost.org and wowbagger.  
Upgraded CDN origin servers.  
Merged PRs to use webhooks on boost.io, as well as git tagging during releases.  

### Drone

Dealing with the IBM Cloud account, which perpetually has billing problems on their side. Re-enabled account.  
Migrate IBM servers from São Paulo to Dallas.   
Implement git fetch timeouts, which did not exist in the drone-git codebase, and was a necessary bug fix. Sent them a PR. Database query scripts to verify results.  

### GHA

New Windows 2025 images.

### JSON Benchmarks

Format/lint script.  
boostorg/json bench output changed, and so the ingest of the data needed updating.  
New monitoring alerts, email alerts.  
