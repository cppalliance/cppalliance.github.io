---
layout: post
nav-class: dark
categories: marshall
title: Marshall's March Update
---

There are four main areas where I spend my time.

* Libc++, where I am the "code owner"
* WG21, where I am the chair of the Library Working Group (LWG)
* Boost
* Speaking at conferences

This month, I spent far more time reviewing other people's code and preparing talks for conferences than the previous few months. The Boost release process consumed a fair chunk of time as well.

# Libc++

The big news is: we released LLVM 8 this month! (March 20th). You can get the sources and pre-built binaries from the [LLVM download page](http://releases.llvm.org/download.html#8.0.0), or wait for your system vendor to provide you with an update. 

As the "code owner" for libc++, I also have to review the contributions of other people to libc++, and evaluate and fix bugs that are reported. That's a never-ending task; there are new contributions ever day.

### LWG papers implemented this month.

* [P0811](https://wg21.link/P0811) `std::midpoint` for integral and pointer types. This turned out to be *quite* involved, and spawned a [clang bug report](https://bugs.llvm.org/show_bug.cgi?id=40965). On the plus side, now I have a topic for a talk for CppCon this fall.

Still to do, `std::midpoint` for floating point types. This is done, but it needs better tests.

### LWG issues implemented this month

* I didn't actually commit any LWG issue fixes this month. I worked with others on several bug fixes that landed, but not under my name.

### LLVM features implemented this month (certainly incomplete)

* Add noexcept to `operator[]` for `array` and `deque`
* Mark `vector::operator[]` and `front`/`back` as noexcept
* Mark `front()` and `back()` as noexcept for `array`/`deque`/`string`/`string_view`
* Make `to_chars`/`from_chars` work back to C++11. This lets us use them in `to_string`.


### LLVM bugs resolved this month (probably incomplete)

* [Bug 35967](https://llvm.org/35967) &lt;regex&gt; `syntax_option_type` is not a proper bitmask
* _No bug #_ Fix a minor bug with `std::next` and `prev` not handling negative numbers.
* _No bug #_ Cleanup of requirements for `optional` - we no longer allow `optional<const in_place_t>`
* [Bug 41130](https://llvm.org/41130) `operator/` of `std::chrono::duration` and custom type.

Also, there was a series of general cleanups in the libc++ tests to improve portability and readability. Eric and I (mostly Eric) revamped the debug-mode support, and there will be more activity there in the future. Also, we're moving towards using more of the `ASSERT_XXXX` macros for readability, and I revamped about 30 of the tests to use them. Only several thousand to go!


The current status of libc++ can be found here:
* [C++20 status](https://libcxx.llvm.org/cxx2a_status.html)
* [C++17 status](https://libcxx.llvm.org/cxx1z_status.html)
* [C++14 status](https://libcxx.llvm.org/cxx1y_status.html) (Complete)
* [Libc++ open bugs](https://bugs.llvm.org/buglist.cgi?bug_status=__open__&product=libc%2B%2B)



# WG21

The "winter" WG21 meeting was held in Kona, HI on February 18-24. This was the last meeting for new features for C++20, and as such, it was both contentious and very busy.

Between now and the next meeting (July), LWG will be working on reviewing papers and issues to be adopted in July. We have had three teleconferences since Kona, and a fourth is scheduled for mid-April.

I am working on more "cleanup" papers similar to [P1458 - Mandating the Standard Library: Clause 16 - Language support library](https://wg21.link/P1458), and my [P0805 - Comparing Containers](https://wg21.link/P0805) needs an update.

The goal of the July meeting is to have a "Committee Draft" (CD) of the proposed C++20 standard that can be sent out for review. 


# Boost

It's time for another Boost release (1.70), and I am acting as the release manager again. The release calendar is available (as always) on [the Boost website](https://www.boost.org/development). 

The cut-off for contributions for the release is 3-April, with a release candidate to follow close behind, and the actual release to happen on the 10th.

Once the release is over, I'll be putting some serious time into Boost.Algorithm; there are a bunch of C++17/20 algorithms that can be added to the library (among other things).

# Conferences

I had submitted talk proposals to three conferences, and all three were accepted. 

I will be speaking at:

* [LLVM European Developer's Conference](https://llvm.org/devmtg/2019-04), April 8-9 in Brussels
* [ACCU](https://conference.accu.org), April 10-13 in Bristol
* [CppNow](http://www.cppnow.org), May 5-10 in Aspen, CO

