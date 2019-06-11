---
layout: post
nav-class: dark
categories: company, damian
title: Damian's May Update
---

This month I've been working on the following projects:
- Certify
- Boost.Beast
- Boost.Build

# Certify
This month, I've worked on expanding the documentation of Certify, especially
the example and introduction parts. When looking through the documentation for
Boost.Build I found out it's possible to import snippets from *.cpp files
into the documentation, which will allow me to make sure that snippets in
the documentation compile and are tested. I've also attempted cleaning up the
Certify build script to use the OpenSSL module in b2, but I ran into issues, so
I'll have get back to this one in the future.

Don't forget to star the repository: [https://github.com/djarek/certify](https://github.com/djarek/certify)!

# Boost.Beast
I've been able to complete the port of the Beast CI to Azure Pipelines and expand
the test matrix beyond what was tested in the existing CI infrastructure. Thanks
to the expanded concurrent job limit, a full run on AzP takes less time than a
full Travis and Appveyor build, especially when wait times are taken into accout.
One of the matrix items I added were tests for header-only no-deprecated builds,
which turned out to be broken. Untested code has a nasty tendency to rot.
I've also been able to identify some function templates in `http::basic_fields`
which could be turned into regular functions. One of them, was instantiated
4 times because they were passed a predicate which was a lambda expression.
These two changes turned out to be fairly significant, because they allowed
shaving off at least 10 KiB of binary size per instantiation (amd64, -O3).

# Boost.Build
When working on the Azure Pipelines CI for Beast I noticed that b2 doesn't support
the leak sanitizer, so I decided to add it. It's available via the `leak-sanitizer=on` feature.
