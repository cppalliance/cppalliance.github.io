---
layout: post
nav-class: dark
categories: joaquin
title: Working on Boost.Bloom roadmap
author-id: joaquin
author-name: Joaquín M López Muñoz
---

During Q3 2025, I've been working in the following areas:

### Boost.Bloom

[Boost.Bloom](https://www.boost.org/doc/libs/latest/libs/bloom/doc/html/bloom.html) has been officially
released in Boost 1.89. I've continued working on a number of roadmap features:

* Originally, some subfilters (`block`, `fast_multiblock32` and `fast_multiblock64)`
implemented lookup in a branchful or early-exit way: as soon as a bit checks to zero, lookup
terminates (with result `false`). After extensive benchmarks, I've changed these subfilters
to branchless execution for somewhat better performance ([PR#42](https://github.com/boostorg/bloom/pull/42)).
Note that `boost::bloom::filter<T, K, ...>` is still
branchful for `K` (the number of subfilter operations per element): in this case, branchless
execution involves too much extra work and does not compensate for the removed branch speculation.
Ivan Matek helped with this investigation.
* Added [bulk-mode operations](https://www.boost.org/doc/libs/develop/libs/bloom/doc/html/bloom.html#tutorial_bulk_operations)
following a similar approach to what we did with Boost.Unordered concurrent containers
([PR#42](https://github.com/boostorg/bloom/pull/43)).
* I've been also working on a proof of concept for a dynamic filter where the _k_ and/or _k'_ values
can be specified at run time. As expected, the dynamic filter is slower than its static
counterpart, but benchmarks show that execution times can increase by up to 2x for lookup and
even more for insertion, which makes me undecided as to whether to launch this feature.
An alternative approach is to have a `dynamic_filter<T>` be a wrapper over a virtual interface
whose implementation is selected at run time from a static table of implementations
based on static `filter<T, K>` with
`K` between 1 and some maximum value (this type erasure technique is described, among
other places, in slides 157-205 of Sean Parent's
[C++ Seasoning](https://raw.githubusercontent.com/wiki/sean-parent/sean-parent.github.io/presentations/2013-09-11-cpp-seasoning/cpp-seasoning.pdf)
talk): performance is much better, but this approach also has drawbacks of its own.
* Reviewed a contribution fom Braden Ganetsky to make the project's `CMakeLists.txt`
more Visual Studio-friendly ([PR#33](https://github.com/boostorg/bloom/pull/33)).

### Boost.Unordered

* Reviewed [PR#316](https://github.com/boostorg/unordered/pull/316).

### Boost.MultiIndex

* Reviewed [PR#83](https://github.com/boostorg/multi_index/pull/83), [PR#84](https://github.com/boostorg/multi_index/pull/84).

### Boost.Flyweight

* Fixed an internal compile error that manifested with newer compilers implementing
[P0522R0](https://wg21.link/p0522r0)
([PR#23](https://github.com/boostorg/flyweight/pull/23)).
* Reviewed [PR#22](https://github.com/boostorg/flyweight/pull/22).

### Boost.PolyCollection

* Reviewed [PR#32](https://github.com/boostorg/poly_collection/pull/32).

### Boost website

* Filed issues
[#1845](https://github.com/boostorg/website-v2/issues/1845),
[#1846](https://github.com/boostorg/website-v2/issues/1846),
[#1851](https://github.com/boostorg/website-v2/issues/1851),
[#1858](https://github.com/boostorg/website-v2/issues/1858),
[#1900](https://github.com/boostorg/website-v2/issues/1900),
[#1927](https://github.com/boostorg/website-v2/issues/1927),
[#1936](https://github.com/boostorg/website-v2/issues/1936),
[#1937](https://github.com/boostorg/website-v2/issues/1937).
* Helped with the transition of the global release notes procedure to one
based on the new website repo exclusively
([PR#508](https://github.com/boostorg/website-v2-docs/pull/508),
[PR#510](https://github.com/boostorg/website-v2-docs/pull/510)). This procedure is
expected to launch in time for the upcoming Boost 1.90 release.

### Boost promotion

* Prepared and posted around 10 messages on Boost's X account and Reddit.
The activity on social media has grown considerably thanks to the dedication of
Rob Beeston and others.

### Support to the community

* Helped Jean-Louis Leroy get Drone support for the upcoming
Boost.OpenMethod library ([PR#39](https://github.com/boostorg/openmethod/pull/39)).
* Supporting the community as a member of the Fiscal Sponsorhip Committee (FSC).
