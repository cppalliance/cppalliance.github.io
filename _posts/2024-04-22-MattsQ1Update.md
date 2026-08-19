---
layout: post
nav-class: dark
categories: matt
title: Matt's Q1 2024 Update
author-id: matt
author-name: Matt Borland
---

Over the past few months I have been working on libraries that are in various stages of the boost lifecycle:

## Newly Accepted Libraries

### Charconv

Charconv (https://github.com/boostorg/charconv) had it's review period from 15 - 25 Jan 2024.
The review manager for this review was Chris Kormanyos, and he did an excellent job.
I want to thank the boost community because I received a lot of good feedback during the review period, and a number of bugs were squashed.
The first release of the library was Boost 1.85, and it seems like a number of boost libraries will use it internally in coming releases.
Discussion of this library can be found on the Cpplang slack at `#boost-charconv`.

## Libraries for Proposal

### Decimal

Decimal (https://github.com/cppalliance/decimal) is a ground-up implementation of the IEEE 754 Decimal Floating Point types in C++14, and is co-authored by Chris Kormanyos.
The library continued to make progress this quarter with most of the heavy machinery of `<cmath>` and `<charconv>` being added.
We have also started optimizing portions of the library such as as completely replacing the basis for `decimal128` which increased performance by up to a factor of 100.
While not totally feature complete Chris and I believe the library is in a good position for a beta, so look forward to that announcement early in the first-half of Q2.
Discussion of this library can be found on the Cpplang slack at `#boost-decimal`.

### Multi

Multi (https://github.com/correaa/Boost-Multi) is a modern C++ library that provides access and manipulation of data in multidimensional arrays, for both CPU and GPU memory.
This is a high-quality library developed by Alfredo Correa (https://github.com/correaa).
I will be serving as the review manager, and helping Alfredo to "boostify" the library beforehand.
Look for an announcement for the review of this exciting library during Q2 and don't hesitate to start investigating the library now.
The author can be found on the Cpplang slack at `#boost`.

## Existing Libraries

### Math

New in Boost 1.85 is a number of optimization algorithms (https://www.boost.org/doc/libs/1_85_0/libs/math/doc/html/optimization.html) developed by Nick Thompson.
This sub-library contains both classical (random_search), and novel (jSO) algorithms.
I was able to assist him in the development and debugging of multi-threaded code which is never an easy task.
