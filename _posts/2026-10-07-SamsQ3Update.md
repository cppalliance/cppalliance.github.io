---
layout: post
nav-class: dark
categories: sam
title: Systems, CI Updates Q3 2026
author-id: sam
---

### Boost website: boost.org

The new version of boost.org went live in September!  This is referred to in the codebase as "v3" while the name of the repository remains at https://github.com/boostorg/website-v2. If you encounter any problems please open an issue there.

The new website was a collaboration between MetaLab and in-house staff developers. It completely redesigns the UI on all pages for a fresh colorful look, with many new features and improvements.

### EDG

The Edison Design Group, Inc. has for decades been the publisher of one of the few existing conformant world-class C++ compilers, in this case they make a "front-end" C++ compiler. Along with Harry Bott, Matt Borland, Mark Cooper and others at the Alliance, we have been assisting them in a migration to open-source. From https://edg.com/ to https://edgcpp.org/ and https://github.com/edgcpp.  Launching a GitHub organization, a new website, advising on procedures and strategies. Establishment of a Fiscal Sponsorship Committee. Alliance developers will contribute to the new codebase https://github.com/edgcpp/compiler as will Nvidia, Microsoft, and many long-time EDG customers.

### Clang compilation - new large server

Launched a server clang4.cpp.al with 172 CPUs and 250GB memory, available to members of the clang compiler team for testing and development, and various projects are underway on the machine. Dell PowerEdge™ R470 DX294-1 at Hetzner.

Installed a GitHub actions runner. There is a project to test C++ profiles by compiling all boost library tests. This required quite a bit of debugging, as running all the tests seemed to time out after 6 hours, or 12 hours, or any amount of time given, and we needed to delve into where and why this happened. Segment and divide the job into many parts. Run them in parallel. It turns out boostorg/math is the culprit, but even then, with dozens of test suites, it's not obvious which specific tests. Again segment and parallelize the boostorg/math tests. This seems to call to mind various aphorisms "The first 90 percent of the code accounts for the first 90 percent of the development time. The remaining 10 percent of the code accounts for the other 90 percent of the development time." (attributed to Tom Cargill of Bell Labs). Substitute the words "build time" in place of "development time". Eventually, you must ask how truly critical it is that all tests complete in 12 hours. What if 99% of them do. Should the final 1% or .1% be debugged, further and further down the rabbit hole. What is the purpose? In some cases, yes they must finish at all costs. In other cases, if the purpose is merely to collect interesting feedback and test results about how profiles work, then perhaps not.

### Drone

When clang4.cpp.al is not using all 172 CPUs for clang compilation, it seemed a cost-effective optimization strategy to run drone CI jobs there also. This was surprisingly fraught with peril, I encountered numerous obstacles when pushing the limits of performance to 30 simultaneous drone runners on one machine. Each time it appeared to work. And then a report of an unexpected problem. 1. It turns out Docker maxes out, by default, at 15 or 16 containers when each container is assigned a small IP subnet range. The solution - configure a larger range of addresses in "default-address-pools". 2. github.com begins blocking clones of the boost superproject. Why... because too much git traffic is originating from one server. How can this be solved. First attempt: add an authentication header to the http requests, using a token which identifies a real user, then api traffic may be increased dramatically. 60 versus 5000. That is, using GitHub's REST API, unauthenticated requests are limited to 60 requests per hour per source IP, while authenticated traffic (personal access token, OAuth, or GitHub App user token) gets 5000 per hour. Thus, I implemented an nginx proxy sending all drone runner requests through an nginx vhost and adding an authentication header, believing this will fix it. 3. The command `git clone https://github.com/boostorg/boost` is not an api call. It is a standard git operation, throttled by GitHub. The X/Y 60/5000 for "git clone" is unknown and unpublished. Adding an authentication header isn't guaranteed to solve it. And so... the next solution, a full-fledged GitHub mirror based on https://github.com/rolandjitsu/git-cache-proxy. 4. During server boot, the nginx vhost binds to a local internal docker interface for improved security. That service isn't up yet during a reboot. Nginx fails to connect, and then it crashes. Finally, the drone runners come online, accept CI jobs, try to use the mirror, and it's down. Since nginx didn't start. Adjust the boot ordering in systemd.

Rebuilt all Microsoft Windows drone runners based on Windows 2025. Visual Studio allows installing or colocating multiple VS versions on the same server which means all versions can be baked into the same docker image and supporting many images isn't necessary. This was done. As a side note b2 doesn't natively support the method yet. You must instruct b2 where the compilers are located in the filesystem through jam files.  

The main problem when standardizing on Windows 2025 is Visual Studio 2015, which requires an older operating system. This threatened to complicate the infrastructure because another set of machines would be needed to host one obsolete test environment. However, it was solved with Hyper-V isolation. In this alternative, each container gets its own small utility VM and its own Windows kernel, so the image OS version does not have to match the host.

Automate and script the deployment/installation process. Debugged SSH, git, other installation issues.

macOS screensharing is not particularly secure. Recently we received an alert about "Critical macOS Screen Sharing Vulnerability (CVE-2026-65400) - Update Required." Rebuilt ~10 macOS machines hosted at macminivault. Added firewall rules and blocked screen sharing.  

### GitHub Actions

Composed a script to install self-hosted GitHub actions runners on Linux, macOS, Windows. https://github.com/cppalliance/ansible-actions-runner.  Of course it's already possible to follow the instructions provided by GitHub in order to install a runner on your own machine.  This involves 5 or 10 steps, copying and pasting.  However you must also consider where to place the runner, and then remember to take further steps which will install it as a service on boot. You need to have access to the particular short-lived installation tokens they show you. And so on.  Not quite one-click. Compare that to the new ansible role - add these host vars for the target machine:

```
gha_runners:
  - repo: boostorg/corosio
  - repo: boostorg/capy
```

And apply the role. Done. That is indeed easier and less error-prone than before.

A new enhancement in the role, not available from GitHub: `serial_execution: true` on each runner implements a lock-file and prevents parallel execution when running benchmarks.

With all the above automation in place, launched Linux/macOS/Windows benchmark machines for capy and corosio with self-hosted runners.  

### Mailman3

Carrying over from the previous quarter, the large project to implement SSO single sign-on for lists.wg21.org went live in July.

Ongoing work with consultants and staff to deploy new templates and front-end UI designs.  

Automated the installation step of creating message footers on list servers.

### Boost release process boostorg/release-tools

Reduced build times by installing mrdocs in a shared location `/opt/mrdocs` during release builds. All boost libraries may now share the same version of mrdocs, even if they otherwise run separate build scripts.
 
### Runpod

runpod.io reported the current `DeepSeek 8*H200` pod will be replaced during maintenance. In preparation, proxy traffic through a cpp.al URL which can be redirected at will to any other pod.  

Installed grafana exporters to graph vllm query statistics.  

Proxy brave search api queries via the pod.

### website-v2 tasks

- Synced production to staging and cppal-dev environments to assist MetaLab. Improvements of this script.  
- Discussed maildev deployments. Maildev is a nice method to protect against accidentally emailing users during testing.  
- Adjusted S3 policies.  
- Multiple cycles of debugging "slow queries" on the database from the new website design.  
- Included a preflight check in deploy-website.sh script.  
- Added a robots.txt file.  
- Adjusted number of gunicorn workers, HPA.  

### General server issues

Resizing disks. Enabling backups.   

### Internal, Corporate

Onboarding.  
Servers to host v2 of cppalliance.org.

### Monitoring

Major version upgrade of prometheus/grafana installation from https://github.com/prometheus-community/ansible 

### Doc Previews, Code Coverage  

Repairing json lcov builds, broken mrdocs previews, cppalliance.org previews and deployments.    
Pull request previews were briefly offline due to upstream nginx releasing a regex bug. Modified the regex in the vhosts as a work-around.

