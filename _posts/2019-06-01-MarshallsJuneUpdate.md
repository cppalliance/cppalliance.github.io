---
layout: post
nav-class: dark
categories: marshall
title: Marshall's May Update
---

There are four main areas where I spend my time.

* Libc++, where I am the "code owner"
* WG21, where I am the chair of the Library Working Group (LWG)
* Boost
* Speaking at conferences

# Libc++

The next big milestone for libc++ is the LLVM 9.0 release this summer. We're working towards that, implementing new features and fixing bugs.

As the "code owner" for libc++, I also have to review the contributions of other people to libc++, and evaluate and fix bugs that are reported. That's a never-ending task; there are new contributions ever day.

This month was spent concentrating on code reviews and bug reports; so I implemented very little "new code".

There was a lot of "infrastructure work" done on libc++ this month; a large cleanup of the test suite (still in progress), a bunch of work on debug mode for the library (also still in progress)

### LWG issues resolved this month in libc++

* [2960](https://wg21.link/lwg3204) `sub_match::swap` only swaps the base class

### LLVM features implemented this month (certainly incomplete)

* Improved the behavior of the compiler intrinsic `__is_base_of`. Clang no longer generates an error when you ask about inheritance relationships with unions, even if the non-union class is incomplete. This intrinsic is used by libc++ to implement `std::is_base_of`.

* Fixed a few `regex` bugs, and improved the `regex` tests in C++03. 

### LLVM bugs resolved this month (probably incomplete)

* [Bug 42037](https://llvm.org/PR42037) C++2a `std::midpoint``'s "Constraints" are not implemented
* [Bug 41876](https://llvm.org/PR41876) `std::hash` should not accept `std::basic_strings` with custom character traits


The current status of libc++ can be found here:
* [C++20 status](https://libcxx.llvm.org/cxx2a_status.html)
* [C++17 status](https://libcxx.llvm.org/cxx1z_status.html)
* [C++14 status](https://libcxx.llvm.org/cxx1y_status.html) (Complete)
* [Libc++ open bugs](https://bugs.llvm.org/buglist.cgi?bug_status=__open__&product=libc%2B%2B)



# WG21

There were no WG21 meetings in April. However, LWG held one teleconference this month, reviewing papers in advance of the July meeting.  We'll have more teleconferences in June.

I am working on more "cleanup" papers similar to [P1458 - Mandating the Standard Library: Clause 16 - Language support library](https://wg21.link/P1458), and my [P0805 - Comparing Containers](https://wg21.link/P0805) needs an update.

The goal of the July meeting is to have a "Committee Draft" (CD) of the proposed C++20 standard that can be sent out for review. 

Also on my TODO list is to attempt to implement some of the proposals that are coming up for a vote in July (`flat_map`, text formatting, etc).

# Boost

It's been a quiet month for boost (except for C++ Now, the conference formerly known as BoostCon). 

There are a couple of good trip reports for C++Now:
* [Matthew Butler](https://maddphysics.com/2019/05/13/cnow-2019-trip-report/)
* [JeanHeyd Meneide](https://thephd.github.io/c++now-2019-trip-report)

The next [Boost release cycle](https://www.boost.org/development/index.html) is starting soon; with the deadline for new libraries coming up later this month. I'm hoping to mentor a new release manager with this release.


# Conferences

Another travel month.  I spent a bunch of time away from home, but only one conference:

* At [C++ Now](http://www.cppnow.org) in Aspen, CO, I presented "The View from a C++ Standard Library Implementor", which was voted the runner-up for "Most Engaging" talk.

I have submitted a talk for [CppCon](https://www.cppcon.com) in September, but I will not hear back about this for a month or two.

I have submitted talks for [C++ Russia](https://cppconf-piter.ru/en/) and [Meeting C++](https://meetingcpp.com), which are both very close (timewise) to the Belfast WG21 meeting, but I haven't heard back yet.

I am looking forward to being at home for the entire month of June.
