---
layout: post
nav-class: dark
categories: company, damian
title: Damian's April Update
---

This month I've been working on the following projects:
- Certify
- Boost.Beast
- Boost.Build
- BeastLounge

# Certify
Certify did not have any platform-independent means of caching certificate
status (i.e. revoked, valid, unknown), so I implemented one. For now it has to
be manually filled, but I'll add a way to import a static blacklist (somewhat
similar to the builtin blacklist in Chrome) and query the status of a
certificate. Unfortunately there is no way to handle OCSP stapling within the
verification callback invoked by OpenSSL which is quite detrimental to
usability. Additionally, OpenSSL doesn't have a way of starting and waiting for
an asynchronous operation within callbacks (without blocking).

Don't forget to star the repository: [https://github.com/djarek/certify](https://github.com/djarek/certify)!

# Boost.Beast
When working on making sure Beast is `std::launder`-correct, I ran into a number
of previously undiagnosed bugs in Beast. All of them have been fixed in
[v254](https://github.com/boostorg/beast/pull/1598/files). I was quite confused
why these issues weren't found by CI previously. I've been able to track it down
to old toolchain versions in Travis. Additionally, the test matrix lacks a few
fairly important variants. Considering the fact that Trusty is no longer
supported and the switch to Xenial is inevitable, I've decided to port over the
CI to Azure Pipelines, because it offers better concurrency which allows the
Beast CI to afford a larger test matrix. In the process I've also decided to use
as many default b2 options as possible, to make future changes to the CI easier.
There's still an issue with Valgrind in Xenial to be resolved (doesn't support
the `RDRAND` instruction).

# Boost.Build
While working on the AzP CI for Beast, I found out that the `coverage` feature
in `b2` doesn't actually set build flags. `coverage=all` will now properly cause
tests to produce `gcno` and `gcda` files for consumption by the lcov tool.

# BeastLounge
When experimenting with the BeastLounge application running on Heroku I found
out that Heroku's router has a builtin 55s timeout which dropped websocket
connections. I solved the issue by making the websocket ping timeouts
configurable.
