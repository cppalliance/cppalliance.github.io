---
layout: post
nav-class: dark
categories: marshall
title: Marshall's March Update
---

Monthly update (or, what Marshall did in January and February)

There are four main areas where I spend my time.

* Libc++, where I am the "code owner"
* WG21, where I am the chair of the Library Working Group (LWG)
* Boost
* Speaking at conferences

# Libc++

The LLVM "branch for release" occurred in January, and there was a bit of a rush to get things into the LLVM 8 release. Now that is over, and we're just watching the test results, seeing if anyone finds any problems with the release. I don't anticipate any, but you never know.

As the "code owner" for libc++, I also have to review the contributions of other people to libc++, and evaluate and fix bugs that are reported. That's a never-ending task; there are new contributions ever day.

After the branch, I started working on new features for the LLVM 9 release (for this summer). More calendaring stuff, new C++20 features, and some C++17 features that haven't been done yet.

### LWG papers implemented in Jan/Feb

* P0355: Extending <chrono> to Calendars and Time Zones. You may remember this from last month's update; this is a huge paper, and I am landing it in stages.
* P1024: tuple-like interface to span
* P1227: Signed ssize() functions
* P1357: Traits for [Un]bounded Arrays

### LWG issues implemented in Jan/Feb (certainly incomplete)

* LWG3101: span's Container constructors need another constraint
* LWG3144: span does not have a const_pointer typedef
* Enabled a `memcpy` optimization for const vectors that was surprisingly missing

### LLVM bugs resolved in Jan/Feb (probably incomplete)

* [Bug 28412](https://llvm.org/PR28412) `std::vector` incorrectly requires CopyConstructible, Destructible and other concepts
* [Bug 39183](https://llvm.org/PR39183) tuple comparison operators return true for tuples of different sizes
* [Bug 24411](https://llvm.org/PR24411) libFuzzer outputs that crash libc++'s regex engine
* [Bug 34330](https://llvm.org/PR34330) error: use of undeclared identifier 'isascii' while compiling strstream.cpp
* [Bug 38606](https://llvm.org/PR38606) no_sanitize("unsigned-integer-overflow") annotation for decremented size_type in `__hash_table`
* [Bug 40533](https://llvm.org/PR40533) `std::minmax_element` is 3 times slower than hand written loop
* [Bug 18584](https://llvm.org/PR18584) SD-6 Feature Test Recommendations
* [Bug 40566](https://llvm.org/PR40566) Libc++ is not Implicit Integer Truncation Sanitizer clean
* [Bug 21715](https://llvm.org/PR21715) 128-bit integers printing not supported in stl implementation
* [Bug 38844](https://llvm.org/PR38844) `__cpp_lib_make_unique` not defined in &lt;memory&gt;
* [Bug 40495](https://llvm.org/PR40495) `is_invokable_v<void>` does not compile
* [Bug 40270](https://llvm.org/PR40270) `std::basic_stringstream` is not working with `std::byte`
* [Bug 39871](https://llvm.org/PR39871) `std::tuple_size` should be a struct
* [Bug 38052](https://llvm.org/PR38052) `std::fstream` still good after closing and updating content

Also, there was a series of general cleanups in the libc++ tests to improve portability.


The current status of libc++ can be found here:
* [C++20 status](https://libcxx.llvm.org/cxx2a_status.html)
* [C++17 status](https://libcxx.llvm.org/cxx1z_status.html)
* [C++14 status](https://libcxx.llvm.org/cxx1y_status.html) (Complete)
* [Libc++ open bugs](https://bugs.llvm.org/buglist.cgi?bug_status=__open__&product=libc%2B%2B)



# WG21

The "winter" WG21 meeting was held in Kona, HI on February 18-24. This was the last meeting for new features for C++20, and as such, it was both contentious and very busy.

The Modules TS and the Coroutines TS were both adopted for C++20, along with a slew of language features.

Here are some trip reports:
* [Herb Sutter](https://herbsutter.com/2019/02/23/trip-report-winter-iso-c-standards-meeting-kona/)
* [Bryce Adelstein Lelbach](https://www.reddit.com/r/cpp/comments/au0c4x/201902_kona_iso_c_committee_trip_report_c20/)
* [Guy Davidson](https://hatcat.com/?p=69)


My part in this was (as always) to chair the Library Working Group (LWG), the group responsible for the description of the library features in the standard (~1000 pages).
We adopted several new features for C++20:

* P0339R6 polymorphic_allocator<> as a vocabulary type
* P0340R3 Making std::underlying\_type SFINAE-friendly
* P0738R2 I Stream, You Stream, We All Stream for istream_iterator
* P0811R3 Well-behaved interpolation for numbers and pointers
* P0920R2 Precalculated hash values in lookup
* P1001R2 Target Vectorization Policies from Parallelism V2 TS to C++20
* P1024R3 Usability Enhancements for std::span
* P1164R1 Make create_directory() Intuitive
* P1227R2 Signed ssize() functions, unsigned size() functions
* P1252R2 Ranges Design Cleanup
* P1357R1 Traits for [Un]bounded Arrays	

I wrote five substantive papers for the Kona meeting, all were adopted. Five of them were very similar, all about improving the wording in the standard, rather than proposing new features.

* [P1458](https://wg21.link/P1458) Mandating the Standard Library: Clause 16 - Language support library
* [P1459](https://wg21.link/P1459) Mandating the Standard Library: Clause 18 - Diagnostics library
* [P1462](https://wg21.link/P1462) Mandating the Standard Library: Clause 20 - Strings library
* [P1463](https://wg21.link/P1463) Mandating the Standard Library: Clause 21 - Containers library
* [P1464](https://wg21.link/P1464) Mandating the Standard Library: Clause 22 - Iterators library

I was also the nominal author of [P1457](https://wg21.link/P1457) "C++ Standard Library Issues to be moved in Kona", but that was just a list of issues whose resolutions we adopted.

Between now and the next meeting (July), LWG will be working on reviewing papers and issues to be adopted in July. I'm planning regular teleconferences (in fact, we had the first one on 1-March). 

The goal of the July meeting is to have a "Committee Draft" (CD) of the proposed C++20 standard that can be sent out for review. 


# Boost

It's been a quiet couple of months for Boost, since we're between releases, and I have been busy with libc++ and WG21 activities. There have been a few bugs to chase down, and the dealing with change requests for the libraries whose maintainers have "moved on" takes some time.

However, it's time for another Boost release (1.70), and I will be acting as the release manager again. The release calendar is available (as always) on [the Boost website](https://www.boost.org/development). 

The beta release is schedule for March 13th, and the final release for 10-April.

# Conferences

I had submitted talk proposals to three conferences, and all three were accepted. Hence, I will be speaking at:

* [LLVM European Developer's Conference](https://llvm.org/devmtg/2019-04), April 8-9 in Brussels
* [ACCU](https://conference.accu.org), April 10-13 in Bristol
* [CppNow](http://www.cppnow.org), May 5-10 in Aspen, CO

