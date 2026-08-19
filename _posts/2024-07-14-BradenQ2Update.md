---
layout: post
nav-class: dark
categories: braden
title: Braden's Q2 2024 Update
author-id: braden
author-name: Braden Ganetsky
---

## Speaking at C++Now

At C++Now 2024, I gave my first full-length conference talk, titled "Unit testing an expression template library in C++20". The slides are up at [this link](https://ganets.ky/slides/2024-cppnow/). As of the time of writing, the talk has not yet been uploaded to YouTube.

In this talk, I explored the current state of compile-time unit testing in C++ in the well-known unit testing libraries. I also discussed my own methods for unit testing at compile-time. This talk especially focuses on giving helpful diagnostics when encountering an error at compile-time. I used my [tok3n](https://github.com/k3DW/tok3n) library (a personal project) as a backdrop for the testing, which has been the driving force behind exploring this area in the first place.

I had an enjoyable time preparing and giving this talk, and I certainly learned a lot. I appreciate the support from the others at the C++ Alliance, for helping me to grow as a speaker and to have this amazing opportunity to speak at C++Now 2024.

## Boost.Unordered Visual Studio Natvis support

In Q2 2024, I created the "boost_unordered.natvis" file, to give user-friendly visualizations for all Boost.Unordered containers in the Visual Studio debugger. In doing this, I learned quite a lot about Natvis files, which I wrote about in [this article](https://blog.ganets.ky/NatvisForUnordered/), titled "Natvis for boost::unordered_map, and how to use <Intrinsic> elements".

Unfortunately, I wasn't initially able to support *all* Boost.Unordered containers. I thought I had to exclude the containers with allocators that use fancy pointers (like `boost::interprocess::offset_ptr`), but I consulted with Joaquín to eventually find a solution. It didn't technically make it for Q2, but it's close enough. I wrote [a 2nd article](https://blog.ganets.ky/NatvisForUnordered2/) explaining this whole process.

I am excited to continue improving the user experience for Boost.Unordered. Next up, I'll be tackling GDB pretty-printers for the containers.
