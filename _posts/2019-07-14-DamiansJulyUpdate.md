---
layout: post
nav-class: dark
categories: company, damian
title: Damian's June Update
---

This month I've been working on the following projects:
- Certify
- Boost.Beast

# Certify
After quite a bit of work exploring ways to make certificate verification more complete,
I've concluded that Boost is currently missing a few tools to make that viable.
A comprehensive solution requires, at the very least, a functional HTTP client
able to handle higher-level semantics like redirects, proxies or compressed bodies.
While these are unlikely to happen while performing an OCSP query or downloading
a CRL set from Google's update service, they still need to be handled, otherwise
the user will be left in a no better state than when no library is used.
At this point, Certify only offers basic verification, but that is still
simillar level to what cURL does. Providing a comprehensive solution will require
either a infrastructure solution (something like Google's CRLsets) or
a library based one (i.e. build up all the required libraries to be able
to perform proper certificate status checks).

# Boost.Beast
I've continued the work on expanding split compilation in Beast, by turning some
internal function templates, in websocket code, into regular functions. Additionally,
I've simplified the websocket prng code after proving with some benchmarks that the
previous solution made it worse both for the fast case (with TLS enabled)
and the slow one. The speed up is marginal, but it made the code much simpler
and reduced the size of binaries by small amount (a few K at best).
I've also worked to cleaning up some of the compilation warnings that I found
using the new Azure Piepelines CI in Beast. I also had to deal with an an odd case of
miscompilation under MSVC 14.2 (x64 Release), where the use of `static_string<7>`
failed tests with paritally garbage output while `static_string<8>` succeeded.

