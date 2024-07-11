---
layout: post
nav-class: dark
categories: sam
title: Sam's Q2 2024 Update
author-id: sam
---

Here's an overview of some projects I have been working on the last few months.

### Boost Downloads

Discuss the details of uploading windows builds to the new CDN with Tom Kent. When publishing the boost releases, they are first uploaded to an S3 bucket s3://boost-archives/. Then the CDN origin servers download the files locally.

### Boost website boostorg/website-v2

A Fastly CDN is configured in front of the boost.io website to increase performance and reduce download times. Fastly is hosted version of Varnish software and uses the VCL programming language. I have been participating on their community forums to find solutions and techniques to adjusting headers, removing cookies, modify cache settings. The VCL framework allows manipulating the http traffic at various phases of the packet's journey during recv, pass, fetch, hit, miss. The language is distinct, but similar to javascript or python type languages.  Multiple iterations of adjusting the VCL. This is an ongoing project. Removed csrf tokens from certain website pages to facilitate caching.

Configuring oauth social auth for the website domains, continued from previous months. Remove fallback default url from boost.io, to reduce traffic on S3, accelerate response times.

Upload boost release notes to S3 so boost.io is able to parse antora markup files when switching from Quickbook to Antora.

Launched a server regression.boost.io, an AWS EC2 instance to host uploaded boost regression test reports on the new website.

Created a static html mirror of boost.org: boost.org.cpp.al.

### boostorg/release-tools

Developed an autocancel feature in boostorg/boost CircleCI to prevent multiple boost release builds from conflicting.

Multiple updates to release-tools to support the new Fastly workflow.

Switch all boost builds to use python virtual environments (python pip packages).

### Mailman project

Sent an email to the boost list, explaining the mailman3 project and requesting testers.  Based on their feedback, researching and solving some issues in the mailman deployment at lists.preview.boost.org.  Discovered an apparent bug in the mailman configuration where the home page was not immediately updating after imports or deletions.  It turns out another component 'qcluster' must be running. Adjust installation scripts accordingly.  Sent a (merged) pull request to upstream hyperkitty, fixing a formatting issue.

### wowbagger

A wowbagger disk failed on two different occasions, causing an outage of the boost.org website. Worked with David Sankel to restore the disk, recover from errors.  Updated the legacy boost.org website to use Fastly archive downloads. This involved modifying numerous pages on the site and including new functions in boost-tasks.

Migrated the boostorg/boost commitbot from wowbagger to Github Actions.

### Jenkins

New Antora doc previews for buffers, http-io, http-proto.  An outstanding project with Revsys is to revamp the lcov/gcovr code coverage displays. With that in mind I have cleaned up and rewritten the gcovr scripts that Jenkins uses so those are streamlined and easier to work with in the future.

### LLVM
Meetings with Google about LLVM CI. The Alliance suggested funding an improvement in their CI infrastructure. This interaction encouraged Google to become more involved, as they had previously committed to support the clang llvm project financially. Either way, hopefully the end result will be faster LLVM CI builds.

### GHA

New 24.04 VM images.

### cpp.al

Enhanced CircleCI jobs to remove concurrency and force sequential processing/rendering of blog posts on the cppalliance.org website.  

### Drone

Assist in debugging cppalliance/decimal, charconv, drone jobs.  Publish new 24.04 drone containers.  Upgrade auto-scaled VMs also.  Configured swap space (disk-based memory) on auto-scaled drone agents.  Refactor a few steps in the script that builds the drone server image.
