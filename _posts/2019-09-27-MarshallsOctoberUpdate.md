---
layout: post
nav-class: dark
categories: marshall
title: Marshall's Combined August and September Update
---

There are four main areas where I spend my time.

* Libc++, where I am the "code owner"
* WG21, where I am the chair of the Library Working Group (LWG)
* Boost
* Speaking at conferences

Lots of work these month(s) behind the scenes, getting stuff ready for C++20, LLVM 9, and Boost 1.71.0.

# Libc++

The [LLVM 9.0 release](http://releases.llvm.org/download.html#9.0.0) has shipped!  The release date was 19-September, a few days later than planned. There are a lot of new [libc++ features](http://releases.llvm.org/9.0.0/projects/libcxx/docs/ReleaseNotes.html) in the release.

As the "code owner" for libc++, I also have to review the contributions of other people to libc++, and evaluate and fix bugs that are reported. That's a never-ending task; there are new contributions ever day.

Many times, bug reports are based on misunderstandings, but require a couple of hours of work in order to figure out where the misunderstanding lies.

We're working on a major redesign of the "debug mode" for libc++, after we realized that the existing (not widely used) debug mode is useless when you're trying to do things at compile (constexpr) time.

I have been spending a lot of time the last few weeks working on the calendaring stuff in `<chrono>`, specifically the interface with the OS for getting time zone information. It is a surprisingly complicated task. Fortunately for me, I have a friend who has been down this road in the past, and is willing to answer questions. 

### LWG issues resolved in libc++ (almost certainly incomplete)

* [LWG3296](https://wg21.link/LWG3296)	Add a missing default parameter to `regex::assign`

### LLVM features implemented (almost certainly incomplete)

* [P1466](https://wg21.link/P1466)	Parts of P1466 "Misc Chrono fixes" more to come here.

### LLVM bugs resolved (definitely incomplete)

* [Bug 42918](https://llvm.org/PR42918)	Fix thread comparison by making sure we never pass our special 'not a thread' value to the underlying implementation

* [Bug 43063](https://llvm.org/PR43063)	Fix a couple of unguarded `operator,` calls in algorithm

* [Bug 43034](https://llvm.org/PR43034)	Add a missing `_VSTD::` before a call to `merge`.

* [Bug 43300](https://llvm.org/PR43300)	Add a missing `_VSTD::` Only initialize the streams `cout`/`wcout`/`cerr`/`wcerr` etc once, rather than any time `Init::Init` is called

### Other interesting LLVM bits from (certainly incomplete)

* [Revision 368299](https://llvm.org/r368299) Implement `hh_mm_ss` from [P1466](https://wg21.link/P1466). Part of the ongoing `<chrono>` implementation work.


The current status of libc++ can be found here:
* [C++20 status](https://libcxx.llvm.org/cxx2a_status.html)
* [C++17 status](https://libcxx.llvm.org/cxx1z_status.html)
* [C++14 status](https://libcxx.llvm.org/cxx1y_status.html) (Complete)
* [Libc++ open bugs](https://bugs.llvm.org/buglist.cgi?bug_status=__open__&product=libc%2B%2B)


# WG21

We shipped a CD out of Cologne in July. Now we wait for the National Bodies (members of ISO, aka "NBs") to review the draft and send us comments. When we've resolved all of these comments, we will send the revised draft out for balloting. If the NBs approve, then that draft will become C++20.

The next WG21 meeting will be November 2-8 in Belfast, Northern Ireland.
This will be the first of two meetings that are focused on resolving NB comments; the second one will be in Prague in February.

I have several "clean-up" papers for the Belfast mailing. The mailing deadline is a week from Monday (5-October), so I need to finish them up.

* [P1718R0: Mandating the Standard Library: Clause 25 - Algorithms library](https://wg21.link/P1718)
* [P1719R0: Mandating the Standard Library: Clause 26 - Numerics library](https://wg21.link/P1719)
* [P1720R0: Mandating the Standard Library: Clause 28 - Localization library](https://wg21.link/P1720)
* [P1721R0: Mandating the Standard Library: Clause 29 - Input/Output library](https://wg21.link/P1721)
* [P1722R0: Mandating the Standard Library: Clause 30 - Regular Expression library](https://wg21.link/P1722)
* [P1723R0: Mandating the Standard Library: Clause 31 - Atomics library](https://wg21.link/P1723)

We polled the NBs before Cologne, and they graciously agreed to have these changes made post-CD.

# Boost

[Boost 1.71.0](https://www.boost.org/users/history/version_1_71_0.html) was released on 19-August. Micheal Caisse was the release manager, with some help from me.

As part of the Boost Community maintenance team, I (and others) made many changes to libraries whose authors are no longer able (or interested) in maintaining them.

I have a couple of suggestions for additions to the Boost.Algorithms library that I will be working on in the near future.


# Conferences

I was a speaker at [CppCon](https://www.cppcon.com) last week. I gave a new talk "std::midpoint - How hard could it be?" (no link yet) which was quite well received. I got a few questions that will require additional research, and may improve my implementation.

I also participated in the "Committee Fireside Chat", at CppCon, where conference members get to ask questions of the committee members who are present.


Upcoming talks:
* [LLVM Developer's Conference](http://llvm.org/devmtg/2019-10/) is in San Jose in October. I will not be speaking, but I will be moderating the lightning talks.
* [C++ Russia](https://cppconf-piter.ru/en/) is at the end of October in St. Petersburg.
* [ACCU Autumn](https://conference.accu.org) is right after the WG21 meeting in early November.
* [Meeting C++](https://meetingcpp.com) is in mid-November in Berlin.

I will be making the "Fall 2019 C++ European Tour", going from St. Petersburg to Belfast to Berlin before heading home mid-November.
