---
layout: post
nav-class: dark
categories: marshall
title: Marshall's June Update
---

There are four main areas where I spend my time.

* Libc++, where I am the "code owner"
* WG21, where I am the chair of the Library Working Group (LWG)
* Boost
* Speaking at conferences

# Libc++

The next big milestone for libc++ is the LLVM 9.0 release this summer. We're working towards that, implementing new features and fixing bugs. The "Branch for release" is currently scheduled for July 18th.

As the "code owner" for libc++, I also have to review the contributions of other people to libc++, and evaluate and fix bugs that are reported. That's a never-ending task; there are new contributions ever day.

I created a [status page](https://libcxx.llvm.org/upcoming_meeting.html) for the LWG issues and papers that are already set up for a vote at the Cologne WG21 meeting.


### LWG issues resolved this month in libc++ (almost certainly incomplete)

* [LWG2221](https://wg21.link/LWG2221)	No formatted output operator for `nullptr`
* [LWG3206](https://wg21.link/LWG3206)	`year_month_day` conversion to `sys_days` uses not-existing member function


### LLVM features implemented this month (almost certainly incomplete)

* [P0553](https://wg21.link/P0553)	Bit operations
* [P0556](https://wg21.link/P0556)	Integral power-of-2 operations
* [P1355](https://wg21.link/P1355)	Exposing a narrow contract for `ceil2`
* [P0646](https://wg21.link/P0646)	Improving the Return Value of Erase-Like Algorithms I


### LLVM bugs resolved this month (probably incomplete)

* [Bug 41843](https://llvm.org/PR41843)	`std::is_base_of` should give correct result for incomplete unions
* [Bug 38638](https://llvm.org/PR38638)	Wrong constraint for `std::optional<T>::operator=(U&&)`
* [Bug 30589](https://llvm.org/PR30589)	`std::complex` with a custom type does not work because of how std::__promote is defined
* [Bug 42396](https://llvm.org/PR42396)	Alignment not respected in containers for over-aligned enumeration types
* [Bug 28704](https://llvm.org/PR28704)	`num_get::do_get` incorrect digit grouping check
* [Bug 18074](https://llvm.org/PR18074)	Undefined references when using pointer to member functions
* [Bug 26503](https://llvm.org/PR26503)	`std::quoted` doesn't work with `char16_t` or `char32_t` strings.
* [Bug 41714](https://llvm.org/PR41714)	`std::tuple<>` is not trivially constructible
* [Bug 36863](https://llvm.org/PR36863)	`basic_string_view(const CharT*, size_type)` constructor shouldn't comment out assert of nullptr and length checks
* [Bug 42166](https://llvm.org/PR42166)	`to_chars` can puts leading zeros on numbers


### Other LLVM bits from this month (certainly incomplete)

* [Revision 364545](https://llvm.org/r364545)	Provide hashers for `string_view` only if they are using the default `char_traits`. Reported on [StackOverflow](https://stackoverflow.com/questions/56784597/is-libc-providing-hash-specialization-for-too-many-basic-string-views/56792608#56792608)

* Reworked `to_string` to use `to_chars`. Much faster, and avoids having multiple implementations. This involved reworking `to_chars` so that it was available back to C++03. _I did all of the `to_chars` refactoring, but not the `to_string` rework._


The current status of libc++ can be found here:
* [C++20 status](https://libcxx.llvm.org/cxx2a_status.html)
* [C++17 status](https://libcxx.llvm.org/cxx1z_status.html)
* [C++14 status](https://libcxx.llvm.org/cxx1y_status.html) (Complete)
* [Libc++ open bugs](https://bugs.llvm.org/buglist.cgi?bug_status=__open__&product=libc%2B%2B)


# WG21

The next WG21 meeting is July 15-20 in Cologne, Germany.

There were no WG21 meetings in June. We (LWG) held four teleconference this month, reviewing papers in advance of the July meeting, and will have another one next week.

I had seven papers in the pre-Cologne mailing:
* [P1718R0: Mandating the Standard Library: Clause 25 - Algorithms library](https://wg21.link/P1718)
* [P1719R0: Mandating the Standard Library: Clause 26 - Numerics library](https://wg21.link/P1719)
* [P1720R0: Mandating the Standard Library: Clause 28 - Localization library](https://wg21.link/P1720)
* [P1721R0: Mandating the Standard Library: Clause 29 - Input/Output library](https://wg21.link/P1721)
* [P1722R0: Mandating the Standard Library: Clause 30 - Regular Expression library](https://wg21.link/P1722)
* [P1723R0: Mandating the Standard Library: Clause 31 - Atomics library](https://wg21.link/P1723)
* [P1724R0: C++ Standard Library Issues to be moved in Cologne](https://wg21.link/P1724)

The goal of the July meeting is to have a "Committee Draft" (CD) of the proposed C++20 standard that can be sent out for review. 

Also on my TODO list is to attempt to implement some of the proposals that are coming up for a vote in July (`flat_map`, text formatting, etc).

# Boost

The next [Boost release cycle](https://www.boost.org/development/index.html) is in process; I am helping Michael Caisse as release manager with this release.


# Conferences

Upcoming talks:
* [C++ Russia](https://cppconf-piter.ru/en/) is at the end of October in St. Petersburg.
* [Meeting C++](https://meetingcpp.com) is in mid-November in Berlin.

I have submitted a talk for [CppCon](https://www.cppcon.com) in September, but I will not hear back about this for a month or two.

I submitted a talk for [ACCU Autumn](https://conference.accu.org), which is in Belfast right after the WG21 meeting, but I haven't heard back about that yet. In any case, I will be attending this conference, since it's in the same hotel as the WG21 meeting, and starts two days after the WG21 meeting, and concludes right before Meeting C++.
