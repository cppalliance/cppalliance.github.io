---
layout: post
nav-class: dark
categories: sam
title: Systems, CI Updates Q4 2025
author-id: sam
---

### Doc Previews and Doc Builds  

The pull request to isomorphic-git "Support git commands run in submodules" was merged, and released in the latest version. (See previous post for an explanation). The commit modified 153 files, all the git api commands, and tests applying to each one. The next step is for upstream Antora to adjust package.json and refer to the newer isomorphic-git so it will be distributed along with Antora. Since isomorphic-git is more widely used than just Antora, their userbase is already field testing the new version.

Created an antora extension https://github.com/cppalliance/antora-downloads-extension that will retry ui-bundle downloads. The Boost Superproject builds sometimes fail because of Antora download failures. I am now in the process of rolling out this extension to all affected repositories. It must be included in each playbook if that playbook downloads the bundle as part of the build process.   

Adjusted doc previews to update the existing PR comments instead of posting many new ones, to reduce the email spam effect. The job will modify a timestamp in the PR comment which allows developers to see the most recent build time and if the pages rebuilt successfully. I needed to solve some puzzles to implement this, since usually Jenkins jobs are stateless and don't know if they previously posted a comment, or which comment it was that should be modified across subsequent jobs runs. It turns out there is a feature "Build with Parameters", and properties/parameters can be saved in the job.     

### Boost website boostorg/website-v2

Lowered the CPU threshold on the horizontal pod autoscaler to scale pods more rapidly when there is increased traffic.  

When web visitors go to the wrong domain or URL, set the redirects to 301 "moved permanently". Reduced the number of redirect hops by sending visitors directly to the final URL www.boost.org.

Investigated a bug where PDF files were timing out and crashing the server. Those should not be parsed by beautiful soup or lxml.  

During this quarter we published boost 1.90.0. Worked closely with the release managers to resolve problems during the release. The boost.org website was not fully updating after importing the new version.  

Meetings about CMS feature, other topics. Many general discussions about website issues.

### Mailman3

When unmoderating a new user on mailman3 an administrator must click a drop-down and select "Default Processing" so this subscriber may send emails directly to the list and not continue to be moderated. I have started developing an enhancement in Postorius whereby there is one simple button "Accept and Unmoderate" thus streamlining the process. However as often happens with new and radical ideas sent to the Mailman maintainers, they put up roadblocks. While I believe the new feature is promising, and it is helpful to quickly unmoderate users, without skipping that step, the future of the pull request is uncertain.

### boost-ci

Created a Fastly CDN mirror of keyserver.ubuntu.com at keyserver.boost.org. If keyserver.ubuntu.com experiences occasional outages but keys are cached on the CDN mirror, then CI jobs will be able to proceed without difficulty. Configured both Drone and boost-ci to use the CDN at keyserver.boost.org.    

### Jenkins

Beast2 doc previews. Capy previews. JSON lcov jobs. Openmethod doc previews.

Modified email notifications to send 'recovery' type messages after failed jobs.  Other enhancements to Jenkins jobs.  

### Boost release process boostorg/release-tools

When building releases with publish-release.py, generate "nodocs" copies of the Boost releases and upload them to archives.boost.io. The "nodocs" versions are now functional. If anyone would like to accelerate their CI build process, set the target URL to nodocs such as: https://archives.boost.io/release/1.90.0/source-nodocs/boost_1_90_0.tar.gz .

Migrated the release workstation instance from GCP to AWS so that during the next Boost release 1.91.0 the server will be closer to AWS S3, allowing file uploads to transfer faster. Designed a mechanism that resizes the server instance on a cron schedule via GHA. Most of the time it's quite small, but during releases the server is allocated more CPU.   

### Drone

Microsoft Windows - VS2026 container image.  
Ubuntu 25.10 container image.

### GHA

Added CI jobs to build "documentation" in the boostorg/container repository. GHA will test doc builds, which helps when debugging modifications to documentation.

Fil-C is a "fanatically compatible memory-safe implementation of C and C++." https://github.com/pizlonator/fil-c  Upon request, I composed an example Fil-C GitHub Actions job at https://github.com/sdarwin/fil-c-demo which was then applied by developers in other Boost repositories.

