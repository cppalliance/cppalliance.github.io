---
layout: post
nav-class: dark
categories: marshall
title: Marshall's April Update
---

There are four main areas where I spend my time.

* Libc++, where I am the "code owner"
* WG21, where I am the chair of the Library Working Group (LWG)
* Boost
* Speaking at conferences

# Libc++

The next big milestone for libc++ is the LLVM 9.0 release this summer. We're working towards that, implementing new features and fixing bugs.

As the "code owner" for libc++, I also have to review the contributions of other people to libc++, and evaluate and fix bugs that are reported. That's a never-ending task; there are new contributions ever day.

### LWG papers implemented this month.

* [P0811](https://wg21.link/P0811) Add `std::midpoint` and `std::lerp` for C++20


### LWG issues resolved this month

* [2960](https://wg21.link/lwg2960) nonesuch is insufficiently useless
* [2977](https://wg21.link/lwg2977) unordered_meow::merge() has incorrect Throws: clause
* [2164](https://wg21.link/lwg2164) What are the semantics of `vector.emplace(vector.begin(), vector.back())`?


### LLVM features implemented this month (certainly incomplete)

* Fixed the implementations of `list::remove_if` and `list::unique` to deal with values or predicates that are elements in the list. Same for `forward_list`. We did this for `remove` already, but now we do it for the other operations as well.

* Added a bunch of new tests for things that we were missing
** `list::sort` and `forward_list::sort` are required to be stable. 
** You can't use `match_results` until you've done a regex search. Our tests did this in several places; now we have assertions to prevent that.
`

### LLVM bugs resolved this month (probably incomplete)


* [Bug 41323](https://llvm.org/PR41323) Race condition in `steady_clock::now` for `_LIBCPP_WIN32API`
* [Bug 41130](https://llvm.org/PR41130) `operator/` of `std::chrono::duration` and custom type.
* [Bug 41577](https://llvm.org/PR41577) test/std/utilities/optional/optional.object/optional.object.ctor/move.fail.cpp has wrong assumption.
* I spent a fair amount of time on [Bug 39696](https://llvm.org/PR39696) "Workaround "error: '(9.223372036854775807e+18 / 1.0e+9)' is not a constant expression"; which turned out to be a GCC bug on PowerPC machines.


Also, there was a series of general cleanups in the libc++ tests to improve portability and readability. I added a bunch of updates for debug-mode, and there were several places where we assumed that `string::compare` returned `-1/0/1` instead of what was specified, which is `\<0/0/\>0`. Also, I added tests for `std::any_cast` and array types.


The current status of libc++ can be found here:
* [C++20 status](https://libcxx.llvm.org/cxx2a_status.html)
* [C++17 status](https://libcxx.llvm.org/cxx1z_status.html)
* [C++14 status](https://libcxx.llvm.org/cxx1y_status.html) (Complete)
* [Libc++ open bugs](https://bugs.llvm.org/buglist.cgi?bug_status=__open__&product=libc%2B%2B)



# WG21

There were no WG21 meetings in April. However, LWG held three teleconferences this month, reviewing papers in advance of the July meeting.  We'll have more teleconferences in May.

I am working on more "cleanup" papers similar to [P1458 - Mandating the Standard Library: Clause 16 - Language support library](https://wg21.link/P1458), and my [P0805 - Comparing Containers](https://wg21.link/P0805) needs an update.

The goal of the July meeting is to have a "Committee Draft" (CD) of the proposed C++20 standard that can be sent out for review. 

Also on my TODO list is to attempt to implement some of the proposals that are coming up for a vote in July (`flat_map`, text formatting, etc).

# Boost

We released [Boost 1.70](https://www.boost.org/users/history/version_1_70_0.html) on the 12th of April. 

Once again, I was the release manager, which involved a bunch of "process management"; things like assembling the release candidates, packaging up release notes, deciding which problems that came up would be fixed (and which ones would not), and updating the web site (and so on, and so on).



# Conferences

This was a big travel month.  I gave two presentations:

* At the [LLVM European Developer's conference](https://llvm.org/devmtg/2019-04/) in Brussels, I gave a 30 minute overview of the changes that were coming to the standard library for C++20. 

* At [ACCU](https://conference.accu.org/) in Bristol, England, I gave a talk titled ["Navigating the development and evolution of a library"](https://conference.accu.org/2019/sessions.html#XNavigatingthedevelopmentandevolutionofalibrary)


In May, I will be speaking at:
* [CppNow](http://www.cppnow.org), May 5-10 in Aspen, CO

I have submitted a talk for [CppCon](https://www.cppcon.com) in September, but I will not hear back about this for a month or two.
