---
layout: post
nav-class: dark
categories: marshall
title: Marshall's July Update
---

There are four main areas where I spend my time.

* Libc++, where I am the "code owner"
* WG21, where I am the chair of the Library Working Group (LWG)
* Boost
* Speaking at conferences

This month, the big news (and the big work item) was the approval of the C++ "Committee Draft" at the WG21 meeting in Cologne on July 15-20.

You can think of this as a "beta version" of the C++20 standard; all features are complete. The next step is bug fixing, with an eye towards releasing next year.

# Libc++

The LLVM 9.0 release is on track for September. We have a release branch, and the RC1 was recently dropped.

Because of the run-up and the aftermath of the Cologne meeting, the libc++ accomplishments are a bit sparse this month.

As the "code owner" for libc++, I also have to review the contributions of other people to libc++, and evaluate and fix bugs that are reported. That's a never-ending task; there are new contributions ever day.

### LWG issues resolved this month in libc++ (almost certainly incomplete)

* [LWG2273](https://wg21.link/LWG2273)	`regex_match` ambiguity


### LLVM features implemented this month (almost certainly incomplete)

* [P1612](https://wg21.link/P1612)	Relocate endian
* [P1466](https://wg21.link/P1466)	Parts of P1466 "Misc Chrono fixes" more to come here.


### LLVM bugs resolved this month (definitely incomplete)

<!-- 
* [Bug 36863](https://llvm.org/PR36863)	`basic_string_view(const CharT*, size_type)` constructor shouldn't comment out assert of nullptr and length checks
* [Bug 42166](https://llvm.org/PR42166)	`to_chars` can puts leading zeros on numbers
 -->

### Other interesting LLVM bits from this month (certainly incomplete)

* [Revision 365854](https://llvm.org/r365854) Reorganize the `<bit>` header to make most of the facilities available for internal use pre-C++20. NFC for external users.

* [Revision 367120](https://llvm.org/r367120) Fix a bug in std::chrono::abs where it would fail when the duration's period had not been reduced.

* [Revision 364884](https://llvm.org/r364884) Add an internal call `__libcpp_is_constant_evaluated`, which works like `std::is_constant_evaluated`, except that it can be called at any language level (back to C++98). For older languages, it just returns `false`. This gets rid of a lot of ifdefs in the libc++ source code.


The current status of libc++ can be found here:
* [C++20 status](https://libcxx.llvm.org/cxx2a_status.html)
* [C++17 status](https://libcxx.llvm.org/cxx1z_status.html)
* [C++14 status](https://libcxx.llvm.org/cxx1y_status.html) (Complete)
* [Libc++ open bugs](https://bugs.llvm.org/buglist.cgi?bug_status=__open__&product=libc%2B%2B)


# WG21

As I said above, we shipped a CD out of Cologne. Now we wait for the National Bodies (members of ISO, aka "NBs") to review the draft and send us comments. When we've resolved all of these comments, we will send the revised draft out for balloting. If the NBs approve, then that draft will become C++20.

We approved many new features for C++20 in Cologne:
* [P0553](https://wg21.link/0553) - Bit Operations
* [P0980](https://wg21.link/0980) - Constexpr `string`
* [P1004](https://wg21.link/1004) - Constexpr `vector`
* [P1065](https://wg21.link/1065) - Constexpr `INVOKE`
* [P1135](https://wg21.link/1135) - The C++20 Synchronization Library
* [P1208](https://wg21.link/1208) - Source Location
* [P0645](https://wg21.link/0645) - Text Formatting
* [P1361](https://wg21.link/1361) - Integration of `chrono` with text formatting
* [P1754](https://wg21.link/1754) - Rename concepts to standard\_case for C++20, while we still can
* [P1614](https://wg21.link/1614) - Spaceship integration in the Standard Library
* [P0600](https://wg21.link/0600) - Stop Tokens and a Joining Thread
* [P0631](https://wg21.link/0631) - Math Constants

We also did not approve many proposed features. Most of these were not approved because we ran out of time, rather than any fault of theirs:
* [P1391](https://wg21.link/1391) - Range constructors for `string_view`
* [P1394](https://wg21.link/1394) - Range constructors for `span`
* [P0288](https://wg21.link/0288) - `any_invokable`
* [P0201](https://wg21.link/0201) - `polymorphic_value`
* [P0429](https://wg21.link/0429) - A Standard flatmap
* [P1222](https://wg21.link/1222) - A Standard flatset
* [P0533](https://wg21.link/0533) - constexpr for cmath
* [P0792](https://wg21.link/0792) - `function_ref`
* [P0881](https://wg21.link/0881) - A Proposal to add stacktrace library
* [P1272](https://wg21.link/1272) - Byte-swapping
* [P0627](https://wg21.link/0627) - Function to mark unreachable code
* _and many others_


I still have a bunch of mechanical changes that need to be made before we ship:
* [P1718R0: Mandating the Standard Library: Clause 25 - Algorithms library](https://wg21.link/P1718)
* [P1719R0: Mandating the Standard Library: Clause 26 - Numerics library](https://wg21.link/P1719)
* [P1720R0: Mandating the Standard Library: Clause 28 - Localization library](https://wg21.link/P1720)
* [P1721R0: Mandating the Standard Library: Clause 29 - Input/Output library](https://wg21.link/P1721)
* [P1722R0: Mandating the Standard Library: Clause 30 - Regular Expression library](https://wg21.link/P1722)
* [P1723R0: Mandating the Standard Library: Clause 31 - Atomics library](https://wg21.link/P1723)

We polled the NBs before Cologne, and they graciously agreed to have these changes made post-CD.

# Boost

The next [Boost release cycle](https://www.boost.org/development/index.html) is in process; I am helping Michael Caisse as release manager with this release. We should have a release in the next couple of weeks.


# Conferences

Upcoming talks:
* [CppCon](https://www.cppcon.com) in September in Denver.
* [C++ Russia](https://cppconf-piter.ru/en/) is at the end of October in St. Petersburg.
* [ACCU Autumn](https://conference.accu.org) is right after the WG21 meeting in early November.
* [Meeting C++](https://meetingcpp.com) is in mid-November in Berlin.

I will be making the "Fall 2019 C++ European Tour", going from St. Petersburg to Belfast to Berlin before heading home mid-November.
