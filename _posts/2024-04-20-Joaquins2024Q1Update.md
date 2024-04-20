---
layout: post
nav-class: dark
categories: joaquin
title: Joaquín's Q1 2024 Update
author-id: joaquin
author-name: Joaquín M López Muñoz
---

During Q1 2024, I've been working in the following areas:

### Boost.Unordered

* Reviewed Braden's work on optimization of `emplace(k, v)` calls ([PR#230](https://github.com/boostorg/unordered/pull/230),
released in [Boost 1.85.0](https://www.boost.org/doc/libs/1_85_0/libs/unordered/doc/html/unordered.html#changes_release_1_85_0)).
With this optimization, statements such as:
<pre>m.emplace(0,"zero");</pre>
won't create a temporary `(0, "zero")` value if the element with key 0 already exists. This is particularly relevant
when dynamic memory allocation is involved (for instance, if `mapped_type` is `std::string` in the example above).
The implementation of this feature is surprisingly tricky and Braden has done a superb job at coming up with an elegant and concise formulation.
* Fixed support for allocators with explicit copy constructors ([PR#234](https://github.com/boostorg/unordered/pull/234),
released in [Boost 1.85.0](https://www.boost.org/doc/libs/1_85_0/libs/unordered/doc/html/unordered.html#changes_release_1_85_0)).
* Fixed bug in the const version of `unordered_multimap::find(k, hash, eq)` ([PR#238](https://github.com/boostorg/unordered/pull/238),
released in [Boost 1.85.0](https://www.boost.org/doc/libs/1_85_0/libs/unordered/doc/html/unordered.html#changes_release_1_85_0)).
* Reviewed Braden's work on addition of `boost::unordered::pmr aliases` for Boost.Unordered containers using
`std::pmr::polymorphic_allocator` ([PR#239](https://github.com/boostorg/unordered/pull/239), to be released in Boost 1.86.0).
* I've continued working on learning about advanced concurrency techniques implemented by
[ParlayHash](https://github.com/cmuparlay/parlayhash) with a view towards leveraging them for the
improvement of `boost::concurrent_flat_map` in massively parallel scenarios. Latest research has
focused on implementing (emulated) [load-link/store-conditional techniques](https://github.com/boostorg/unordered/compare/687a446784da8592f8795f1068328e9de041f63b...a4a5a3e12790df7236f1e38b3ec29cdc0463b6cc),
but results are still well below those achieved by ParlayHash. Advance is hampered by the need to
access a many-core machine for benchmarking, which slows down turnaround times.
* On April 25, I'm giving a talk on perfect hashing at [using std::cpp 2024](https://eventos.uc3m.es/105614/programme/using-std-cpp-2024.html).
I've been preparing the presentation and associated material, which will be made public shortly after the talk.

### Boost.Bimap

* Fixed heterogeneous lookup for side collections ([PR#42](https://github.com/boostorg/bimap/pull/42),
released in [Boost 1.85.0](https://www.boost.org/doc/libs/1_85_0/libs/bimap/doc/html/boost_bimap/release_notes.html#boost_bimap.release_notes.boost_1_85_release)).
Boost.Bimap is in need of a maintainer, if you'd like to take over this role please step in!

### Boost promotion and new website

As of lately, I'm devoting more time to Boost-related tasks outside of actual programming:

* I've authored several promotional tweets such as [this](https://x.com/Boost_Libraries/status/1750559787220099577),
[this](https://x.com/Boost_Libraries/status/1755277784824344943) and
[this](https://x.com/Boost_Libraries/status/1768833941341896756): the art was commisioned to
the amazing [Bob Ostrom](https://www.bobostrom.com/).
* Starting in late March, I'm managing the project to complete the proposed [new website for Boost](https://www.boost.io/).
We should be ready for launch early in Q2 2024. If you're curious, you can take a look at
the project backlogs [here](https://github.com/boostorg/website-v2/issues) and [here](https://github.com/boostorg/website-v2-docs/issues).

### A new golden era for Boost?

I've been a contributor and keen observer of Boost for more than 20 years, back from the day when
the project was spearheading the community initiatives to provide high-quality libraries for
eventual standardization. After crucially contributing to the watershed upgrade of the
standard library in C++11, Boost popularity waned, partially because of its success
in getting many of its key components standardized, but also due to external and internal
factors (appearance of excellent, lighter alternatives to some of its libraries,
lack of modernization, monolithicity, etc.) In the last couple of years or so, however,
I've noticed a resurgence in the interest for Boost: I can't provide hard data yet (I
will eventually), but I'm following some proxy signs (presence and feedback on social media,
mainly) that may indicate we're back on track towards better serving the C++ community. Some concrete
initiatives that I think are helping improve the public perception of the project are:
* Better package management support from Conan and vcpkg.
* Modularization efforts both with [CMake](https://github.com/boostorg/cmake) and [B2](https://github.com/grafikrobot/boostorg.boost).
* Deprecation of C++03 support by many Boost libraries.
* Ongoing work and conversations around the proposed new website and potential [module support](https://anarthal.github.io/cppblog/modules).

I'm no postmodernist, but I recognize the power of narratives and good PR strategies
even in the supposedly objetive world of software development. Backed by its diverse
catalog of high-quality libraries and resources,
I'd like to contribute what little I can to communicating the current and future benefits of
Boost to the C++ community.
