---
layout: post
nav-class: dark
categories: joaquin
title: Joaquín's Q3 2024 Update
author-id: joaquin
author-name: Joaquín M López Muñoz
---

During Q3 2024, I've been working in the following areas:

### Boost.Unordered

* Made visitation exclusive-locked within certain
`boost::concurrent_flat_set` operations to allow for safe mutable modification of elements
([PR#265](https://github.com/boostorg/unordered/pull/265), to be released in Boost 1.87.0).
This is relevant for the work on Boost.Flyweight discussed below.
* Added new concurrent, node-based containers `boost::concurrent_node_map` and
`boost::concurrent_node_set` ([PR#271](https://github.com/boostorg/unordered/pull/271),
to be released in Boost 1.87.0). These containers are, expectedly, slower than their flat
counterparts, but provide pointer stability, which can be critical in some scenarios.
* Fixed `std::initializer_list` assignment issues for open-addressing containers
([PR#277](https://github.com/boostorg/unordered/pull/277), to be released in Boost 1.87.0).
* Added `insert_and_visit` and related operations to concurrent containers
([PR#283](https://github.com/boostorg/unordered/pull/283), to be released in Boost 1.87.0).
`insert_or_visit(x, f)` invokes the visitation function `f` only if the element is _not_
inserted (that is, it already existed). By contrast, `insert_and_visit(x, f1, f2)` invokes
`f1` when the element is newly inserted, or `f2` otherwise. This operation can't be
easily (or at all) emulated by user code, so it made sense that it be provided natively.
* Reviewed Braden's work on [PR#269](https://github.com/boostorg/unordered/pull/269)
and [PR#274](https://github.com/boostorg/unordered/pull/274)
(to be released in Boost 1.87.0).

### Boost.Flyweight

* Marked the interface of `boost::flyweight` as `noexcept` where appropriate
([PR#16](https://github.com/boostorg/flyweight/pull/16), to be released in Boost 1.87.0).
* In response to a request from user Romain on Slack, added `concurrent_factory` 
([PR#17](https://github.com/boostorg/flyweight/pull/17), to be released in Boost 1.87.0).
This factory, which is built on top of `boost::concurrent_node_set`,
provides [excellent performance](https://www.boost.org/doc/libs/master/libs/flyweight/doc/examples.html#example9)
in multithreaded population scenarios as it does not require any external locking policy.

### Boost.MultiIndex

* Updated CI support  for this library ([PR#75](https://github.com/boostorg/multi_index/pull/75)).
Although nominally C++03 compliant, Boost.MultiIndex has been brought to require
C++11 by way of its internal dependencies; this opens the possibility of eventually
modernizing the code base, and in particular getting rid of its usage of Boost.MPL
in favor of Boost.Mp11. Stay tuned.

### Boost.Bimap

* Reviewed and merged [PR#45](https://github.com/boostorg/bimap/pull/45)
(to be released in Boost 1.87.0).

### Boost promotion and new website

* Authored the Boost 1.86 announcement [tweet](https://x.com/BoostLibraries/status/1823783597792485433).
* I've served as the PM for the new Boost website project (preview at [boost.io](https://boost.io)).
On September 24 I transferred PM responsibilities to Rob Beeston, who's been doing
an awesome job at it since. I'll be keeping an eye to this project, though, and will
help any way I can.

### Support to the community

* I've proofread the excellent articles by Braden Ganetsky on
[Natvis](https://blog.ganets.ky/NatvisForUnordered2/) and
[GDB](https://blog.ganets.ky/PrettyPrinter/) debugging support for Boost.Unordered.
* Reviewed and provided feedback for an early reference section of
Alfredo Correa's [Boost.Multi](https://gitlab.com/correaa/boost-multi) upcoming proposal.
* The Boost Asset Stewardship Review that took place on September [determined](https://lists.boost.org/boost-announce/2024/09/0630.php)
that a Fiscal Sponsorhip Committee (FSC) be created in charge of representing the
Boost community in its relationship with the C++ Alliance as the newly elected
fiscal sponsor for the project. I was appointed as a member of the FSC alongside
Ion Gaztañaga and René Rivera, and will do my best to serve the community
from that position.
