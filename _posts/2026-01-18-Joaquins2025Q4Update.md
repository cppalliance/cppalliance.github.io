---
layout: post
nav-class: dark
categories: joaquin
title: Containers galore
author-id: joaquin
author-name: Joaquín M López Muñoz
---

During Q4 2025, I've been working in the following areas:

### Boost.Bloom

* Written [an article](https://bannalia.blogspot.com/2025/10/bulk-operations-in-boostbloom.html) explaining
the usage and implementation of the recently introduced bulk operations.

### Boost.Unordered

* Written maintenance fixes
[PR#320](https://github.com/boostorg/unordered/pull/320),
[PR#321](https://github.com/boostorg/unordered/pull/321),
[PR#326](https://github.com/boostorg/unordered/pull/326),
[PR#327](https://github.com/boostorg/unordered/pull/327),
[PR#328](https://github.com/boostorg/unordered/pull/328),
[PR#335](https://github.com/boostorg/unordered/pull/335).

### Boost.MultiIndex

* Refactored the library to use Boost.Mp11 instead of Boost.MPL ([PR#87](https://github.com/boostorg/multi_index/pull/87)),
remove pre-C++11 variadic argument emulation ([PR#88](https://github.com/boostorg/multi_index/pull/88))
and remove all sorts of pre-C++11 polyfills ([PR#90](https://github.com/boostorg/multi_index/pull/90)).
These changes are explained in [an article](https://bannalia.blogspot.com/2025/12/boostmultiindex-refactored.html)
and will be shipped in Boost 1.91. Transition is expected to be mostly backwards
compatible, though two Boost libraries needed adjustments as they use MultiIndex
in rather advanced ways (see below).

### Boost.Flyweight

* Adapted the library to work with Boost.MultiIndex 1.91
([PR#25](https://github.com/boostorg/flyweight/pull/25)).

### Boost.Bimap

* Adapted the library to work with Boost.MultiIndex 1.91
([PR#50](https://github.com/boostorg/bimap/pull/50)).

### Other Boost libraries

* Helped set up the Antora-based doc build chain for DynamicBitset
([PR#96](https://github.com/boostorg/dynamic_bitset/pull/96),
[PR#97](https://github.com/boostorg/dynamic_bitset/pull/97),
[PR#98](https://github.com/boostorg/dynamic_bitset/pull/98)).
* Same with OpenMethod
([PR#40](https://github.com/boostorg/openmethod/pull/40)).
* Fixed concept compliance of iterators provided by Spirit
([PR#840](https://github.com/boostorg/spirit/pull/840),
[PR#841](https://github.com/boostorg/spirit/pull/841)).

### Experiments with Fil-C

[Fil-C](https://fil-c.org/) is a C and C++ compiler built on top of LLVM that adds run-time
memory-safety mechanisms preventing out-of-bounds and use-after-free accesses. 
I've been experimenting with compiling Boost.Unordered test suite with Fil-C and running
some benchmarks to measure the resulting degradation in execution times and memory usage.
Results follow:

* Articles
  *  [Some experiments with Boost.Unordered on Fil-C](https://bannalia.blogspot.com/2025/11/some-experiments-with-boostunordered-on.html)
  *  [Comparing the run-time performance of Fil-C and ASAN](https://bannalia.blogspot.com/2025/11/comparing-run-time-performance-of-fil-c.html)
* Repos
  *  [Compiling Boost.Unordered test suite with Fil-C](https://github.com/joaquintides/fil-c_boost_unordered)
  *  [Benchmarks of Fil-C and ASAN against baseline](https://github.com/boostorg/boost_unordered_benchmarks/tree/boost_unordered_flat_map_fil-c)
  *  [Memory consumption of Fil-C and ASAN with respect to baseline](https://github.com/boostorg/boost_unordered_benchmarks/tree/boost_unordered_flat_map_fil-c_memory)

### Proof of concept of a semistable vector

By "semistable vector" I mean that pointers to the elements may be invalidated
upon insertion and erasure (just like a regular `std::vector`) but iterators
to non-erased elements remain valid throughout.
I've written a small [proof of concept](https://github.com/joaquintides/semistable_vector/)
of this idea and measured its performance against non-stable `std::vector` and fully
stable `std::list`. It is dubious that such container could be of interest for production
use, but the techniques explored are mildly interesting and could be adapted, for
instance, to write powerful safe iterator facilities.

### Teaser: exploring the `std::hive` space

In short, `std::hive` (coming in C++26) is a container with stable references/iterators
and fast insertion and erasure. The [reference implementation](https://github.com/mattreecebentley/plf_hive)
for this container relies on a rather convoluted data structure, and I started to wonder
if something simpler could deliver superior performance. Expect to see the results of
my experiments in Q1 2026.

### Website

* Filed issues
[#1936](https://github.com/boostorg/website-v2/issues/1936),
[#1937](https://github.com/boostorg/website-v2/issues/1937),
[#1984](https://github.com/boostorg/website-v2/issues/1984).

### Support to the community

* I've been part of a task force with the C++ Alliance to review the entire
catalog of Boost libraries (170+) and categorize them according to their
maintainance status and relevance in light of additions to the C++
standard library over the years.
* Supporting the community as a member of the Fiscal Sponsorship Committee (FSC).
