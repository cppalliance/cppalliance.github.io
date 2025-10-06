---
layout: post
nav-class: dark
categories: sam
title: Systems, CI Updates Q3 2025
author-id: sam
---

### Doc Previews and Doc Builds  

The isomorphic-git improvements are an ongoing saga. (As a reminder, isomorphic-git is a dependency and component of Antora, which can't parse submodules while boost relies heavily on submodules). This quarter I coded full submodule support into isomorphic-git and then submitted a PR with 150 files modified. An issue is that the library is suffering from a general lack of maintainers, it's stuck on Nodejs 14 from 5 years ago, and uses many out-of-date packages. These are preventing proper CI tests (specifically, recursive copy isn't supported) and now the maintainer refuses to merge the pull request without a major overhaul of BrowserFS -> ZenFS. It's a complete detour since this has nothing directly to do with submodules.  

An amusing anecdote from the story: out of the blue a developer from Germany appeared and he was very energetic about fixing everything in isomorphic-git. For a week or so, it seemed he would solve all problems. He would overhaul the entire package (which has been neglected), contribute many improvements, solve all bugs, upgrade ZenFS, etc. I was genuinely optimistic about his participation. However my latest assessment of the situation is he's experiencing some delusions of grandeur based on comments in git repositories such as...  that upgrading isomorphic-git "will trigger a massive, multi-trillion-dollar restructuring of the digital economy". After expressing impatience with the existing maintainers of isomorphic-git, the developer forked the repo, and has ceased to be involved directly. 

However all is not lost. The author of ZenFS is actively working with isomorphic-git to implement the BrowserFS -> ZenFS upgrade. He is contributing the pull request.  

### Boost website boostorg/website-v2

- Adjust db caching to support master/develop branches.  
- Improve script to deploy websites via 'git push'.  
- Remove files from wowbagger, disk space filling up.  
- Redirect live.boost.org to boost.org. Switch regression.boost.io -> regression.boost.org. Fix bugs in the regression CI jobs.   

### Mailman3

- Modified scripts to allow developers to locally download, parse, graph MM3 traffic. That is, conveniently download the database backups of the mailing lists.  
- Plausible Analytics for lists.boost.org.  
- Gunicorn number-of-workers adjustments.  
- Discuss HTML-formatting features with MM3 upstream maintainers. Resistance to the idea, and also from Andrey and others at Boost. It is not a basic feature to implement - affects multiple areas of the app. May not proceed in the short-term.  
- Troubleshooting, and discovered the cause of a page load delay. Disabled 'member visibility' for now, which causes a massive SQL query every time anyone visits the profile page.  
 
### boost-ci

Completed from last quarter: Nearly all CI jobs that use boost-ci set B2_CI_VERSION=1. Eliminate the need for this variable by making it a default, which will avoid errors when the variable isn't set properly. CI configuration becomes one step easier. B2_CI_VERSION=1 may now be omitted.   

### Jenkins

Asio docs builds for K-ballo.

### Boost release process boostorg/release-tools

- Release-tools bug fixes in connection with boostorg/redis antora builds.
- Commitbot accepts case-insensitive variables. (Needs to be merged.)  
- publish_release.py: extend preflight checks to staging.  
- New superproject container image - upgrade Doxygen.  

### Drone

- Built a container image "cppalliance/2404-p2996:1" to support P2996 ("Reflection for C++26"), based on the repository https://github.com/bloomberg/clang-p2996 that contains experimental support for P2996 reflection.  
- Upgraded Xcode versions on existing macOS machines.  

### JSON Benchmarks

After a server outage, recovered access through the console on dedicatednode2.cpp.al. Adjusted network configuration.  

### GHA

Significant time working on an upgrade to the latest version of the Terraform code. Encountered multiple bugs. The CI user on Windows is no longer configurable, but it should be set (to 'Administrator') during boost CI tests. Composed and sent a pull request. Ongoing. 
