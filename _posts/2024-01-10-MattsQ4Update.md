---
layout: post
nav-class: dark
categories: matt
title: Matt's Q4 2023 Update
author-id: matt
author-name: Matt Borland
---

Over the past few months I have been working on a number of libraries both for proposal to, and currently in Boost.

## New Libraries

### Charconv

The Charconv (https://github.com/cppalliance/charconv) review period is scheduled for 15 - 25 Jan 2024.
Directions for use with B2, VCPKG, and Conan are provided to allow for testing, and evaluation of the library.
All feedback is welcome and appreciated.
Reviews can be submitted to the mailing list or the Review Manager, Chris Kormanyos at e_float@yahoo.com. 
Discussion of this library can be found on the Cpplang slack at `#boost-charconv`.

### Decimal

Decimal (https://github.com/cppalliance/decimal) is a ground-up implementation of the IEEE 754 Decimal Floating Point types in C++14, and is co-authored by Chris Kormanyos.
The library has made significant progress this quarter with most of the features from IEEE 754-2019 and TR 24733 being implemented.
Looking to next quarter we will continue to implement more features, and begin working on optimization as we have been focusing first on correctness.
Discussion of this library can be found on the Cpplang slack at `#boost-decimal`.

## Existing Libraries

### Math

A recent RFC in Scipy has led to the decision to begin replacing their existing Special Function implementations with C++ to enable CUDA support.
They will be using the existing code from Boost.Math and in return contribute bugfixes and CUDA implementations as needed.
This continues to deepen our mutually beneficial relationship with them.

### Random

An implementation of Vigna's Splitmix64 (https://prng.di.unimi.it/index.php) has been merged recently.
The next step is to complete the implementation of the xoshiro / xoroshiro PRNGs.
These new PRNGs are can be faster, and have fewer BigCrush failures than the PRNGs defined in the C++ Standard. 

### Numeric.Odeint

As of a few weeks ago Nick Thompson and I have been added as primary maintainers of Boost.Numeric.Odeint.
Our immediate goal is to modernize the library (e.g. remove unneeded dependencies for C++03), and fix existing issues to support both the Boost and R communities.

## A year in review at the C++ Alliance

As of writing I have now worked at the C++ Alliance for a full year.
This is my first job working in Open Source Software, and first remote position.
I have thoroughly enjoyed collaborating with and meeting other developers from around the world.
I look forward to continuing development of Boost Libraries in the future!
