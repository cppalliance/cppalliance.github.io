---
layout: post
nav-class: dark
categories: matt
title: Matt's Q3 2023 Update
author-id: matt
author-name: Matt Borland
---

Over the past few months I have primarily been working on two libraries: charconv and decimal.

Charconv (https://github.com/cppalliance/charconv) is now complete.
The library received endorsement on the Mailing List this month, and is now waiting to be scheduled for formal review.
In the meantime feel free to test it.
Directions for use with B2, VCPKG, and Conan are provided.
All feedback is welcome and appreciated.

Decimal (https://github.com/cppalliance/decimal) is a ground-up implementation of the IEEE 754 Decimal Floating Point types in C++14, and is co-authored by Chris Kormanyos.
Our goal with this library is for it to be indistinguishable from the built-in types you are used to.
This includes complete support for normal standard library functions in cmath, cstdlib, etc. as well as interoperability with Boost.Math for higher level support.
The working basis for the library is IEEE 754-2019 and TR 24733 with our changes to modern C++.
The library is still in early development stages, and discussion can be found on the cpp-lang slack under #boost-decimal.


