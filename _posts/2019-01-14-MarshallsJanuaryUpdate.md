---
layout: post
nav-class: dark
categories: marshall
title: Marshall's January Update
---

Monthly update (or, what Marshall did in December)

There are three main areas where I spend my time.

* Boost
* Libc++
* WG21, where I am the chair of the Library Working Group (LWG)

----
Boost:
December was a big month for boost, and much of the first part of the month was taken up with the release process. I was the release manager for the 1.69.0 release, which went live on 12-December. The final release process was fairly straighforward, with only one release candidate being made/tested - as opposed to the beta, which took _three_. In any case, we had a successful release, and the I (and other boost developers) are now happily working on features/bug fixes for the 1.70 release - which will occur in March.  

----
Libc++:
After the WG21 meeting in November, there was a bunch of new functionality to be added to libc++. The list of new features (and their status) can be seen [on the libc++ website](https://libcxx.llvm.org/cxx2a_status.html).  My major contributions of new features in December were [Consistent Container Erasure](https://wg21.link/P1209R0), [char8_t: A type for UTF-8 characters and strings](https://wg21.link/P0482), and [Should Span be Regular?](https://wg21.link/P1085R2), and a big chunk of [Extending <chrono> to Calendars and Time Zones](https://wg21.link/P0355R7).

This is all pointing towards the January 16th "branch for release", and for the scheduled March release of LLVM 8.0.

As the "code owner" for libc++, I also have to review the contributions of other people to libc++, and evaluate and fix bugs that are reported. That's a never ending task; there are new contributions ever day.

----
WG21

Being between meetings (November -> February) there was not any special WG21 work to be done in December. There's an ongoing stream of bug reports, discussion, paper reviews that get done between meetings, and there is a series of papers that I need to finish for the pre-Meeting mailing deadline on 21-January. I have 1 1/2 done, and need to do 3-4 more.
