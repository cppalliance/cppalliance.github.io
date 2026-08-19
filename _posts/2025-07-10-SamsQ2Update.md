---
layout: post
nav-class: dark
categories: sam
title: Mailman3 and Website-V2
author-id: sam
---

### Mailman3 Deployment

The Boost mailing list has been in place for around 25 years. During at least the last 3 years we have been exploring an upgrade to mailman3 which is a completely new framework based on Django and multiple other components. The new server finally went live in June 2025 at the same URL: https://lists.boost.org.  

Mail archives going back to 2004 were imported into the new system. Static file copies of all archives are also hosted at listarchives.boost.org.  

Thanks to some organizational delays, there was more time to ensure a technically stable migration, discover potential problems and interact with the upstream open-source project maintainers. I was able to contribute documentation to the official Mailman Suite docs, switch the search engine from Elastic Search to Xapian (which they recommend), convert the cache to Redis, find a qcluster misconfiguration, submit a fix about an archive import bug, create new shell wrapper scripts for CLI execution, install logrotate, and more. 

Hopefully the new server is more enjoyable to interact with than mailman2. It solves certain issues: posts appear almost instantly on lists.boost.org and they are emailed out quickly. UTF-8 characters render correctly. New features can be added.

### Boost website boostorg/website-v2

The new boost.org went live! After nearly 4 years of development. A major milestone. Switched over DNS.

Also,  

Enabled IPv6.  
Installed horizontal pod autoscaler (HPA).  
Nginx redirect from boost.io to boost.org.    
Adjusted Fastly CDN settings for 'latest'. Fixing Fastly VCL commands to process 404s. Opened ticket, re-organized the order of the expressions.  
Created QA environment. Actually using the cppal-dev environment. Re-DNS servers.  
Discussing and planning a feature in website-v2 to improve doc page load times by a factor of 4, by caching doc pages in postgresql instead of always loading them across the network from S3.  
Improved the install scripts for local developer workstations, specifically the logic and steps of the Linux install.  

### Doc Previews and Doc Builds  

A few Boost libraries depend on [Antora](https://antora.org/), and the number will expand in the future. An existing problem with Antora is that the component isomorphic-git doesn't support submodules, while all Boost libraries are submodules. 

I have opened a draft pull request on isomorphic-git to include a subset of submodule capabilities, allowing it to operating on already-checked-out submodules. That would be sufficient to handle most cases of doc builds. Since the original author of isomorphic-git departed, there is at most a part-time maintainer. Review processes are somewhat slow. Further work needs to be done. But it's progressing and doesn't appear to be blocked, although there is a hurdle that a correct isomorphic-git update for submodules will need to modify 60+ git commands, each of which has a test suite and varying source code files.

### boost-ci

Nearly all CI jobs that use boost-ci set B2_CI_VERSION=1. We're now working on eliminating the need for this variable by making it a default. That will avoid an error when the variable isn't set properly. CI configuration becomes one step easier. Running reports to find which repos are affected. In-process.  

### Infrastructure Monitoring

The upstream Ansible roles to deploy Prometheus and Grafana were redesigned, and migrated from a 'role' to a 'collection'. In order to stay up-to-date and use the latest pip packages, I converted the Alliance's Prometheus/Grafana server to the new system and re-wrote the 'node exporter' modules which are customized to install on multiple operating systems, windows/macos/linux.  

Deployed new server.  

Further monitoring of Drone (number of runners). Postgresql (all db statistics).

### Jenkins

The latest Jenkins jobs send email notifications on failure. Working on designing adjustments to those steps to remove false-positives, which are caused by plugin bugs. It's valuable to receive accurate email notifications, allowing prompt investigation of the job issues.  

Debugging Bloom. Added Decimal. Int128.

Upgraded all plugins, server.

### Boost release process boostorg/release-tools

Boost release 1.88.0.  
Worked with release managers to debug the publish scripts. Opened issues on website-v2 about the release process.  
Helped multiple boost authors with various docs errors affecting superproject builds.  

### Drone

- Rebuilt vs2022 runners.  
- IBM invoicing issues. not uncommon.  
- IBM password expirations issues due to their configuration defaults.  
- Disabled hyperthreading on runners.

### GHA

Rebuilt windows-2025 runners.

### Benchmarks
New dedicated benchmark runners for boostorg/bloom.



