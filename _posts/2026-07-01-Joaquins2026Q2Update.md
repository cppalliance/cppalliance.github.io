---
layout: post
nav-class: dark
categories: joaquin
title: Hub is here
author-id: joaquin
author-name: Joaquín M López Muñoz
---

During Q2 2026, I've been working in the following areas:

### `boost::container::hub`

The Boost official review took place April 16-26. The library
[was accepted](https://lists.boost.org/archives/list/boost@lists.boost.org/thread/7WZ7QTPE2YDYD5OYCKXKKV2N74JHJRZL/)
as part of Boost.Container. Many thanks to the review manager, Ion Gaztañaga, and all the people who participated:
Arnaud Becheler, Matt Bentley, Matt Borland, Dominique Devienne, Peter Dimov, Emil Dotchevski,
Amlal El Mahrouss, Alexander Grund, Seth Heeren, Andrzej Krzemieński, Christian Mazakas, Andrey Semashev, Peter Turcan. 
During April-June I implemented the feedback received ([PR#20](https://github.com/joaquintides/hub/pull/20)),
and after that Ion took over and migrated the code and 
[documentation](https://www.boost.org/doc/libs/develop/doc/html/container/non_standard_containers.html#container.non_standard_containers.hub)
to Boost.Container (adding some interesting performance improvements
that I helped a bit with). `boost::container::hub` will be released in Boost 1.92
(August 2026), after which the [original repo](https://github.com/joaquintides/hub) will be
deprecated or removed.

### Boost.Unordered

* Added interoperability with C++20 ranges to all the containers in the library
([PR#355](https://github.com/boostorg/unordered/pull/355)).
* Reviewed and merged [PR#348](https://github.com/boostorg/unordered/pull/348)
from Daniel Král (performance issue with closed-addressing containers when rehashing
at very large container sizes).
* Written maintenance fixes
[PR#346](https://github.com/boostorg/unordered/pull/346),
[PR#351](https://github.com/boostorg/unordered/pull/351),
[PR#352](https://github.com/boostorg/unordered/pull/352),
[PR#353](https://github.com/boostorg/unordered/pull/353),
[PR#354](https://github.com/boostorg/unordered/pull/354).
* Addressed documentation issues
[#349](https://github.com/boostorg/unordered/issues/349),
[#350](https://github.com/boostorg/unordered/issues/350).
 
### Boost.MultiIndex

* Fancy pointer support has been extended so that `multi_index_container`
iterators now store references to the elements through the allocator's pointer type
([PR#100](https://github.com/boostorg/multi_index/pull/100)).
In particular, this means that iterators can now be placed in shared memory using
Boost.Interprocess allocators.
* Reviewed and merged [PR#94](https://github.com/boostorg/multi_index/pull/94)
from Daniel Král (performance issue when rehashing at very large container sizes).
* Reviewed and merged [PR#98](https://github.com/boostorg/multi_index/pull/98)
from Jonathan Wakely.
* Written maintenance fixes
[PR#97](https://github.com/boostorg/multi_index/pull/97),
[PR#99](https://github.com/boostorg/multi_index/pull/99).

### Boost.ICL

As discussed in a [previous entry](https://cppalliance.org/joaquin/2026/04/02/Joaquins2026Q1Update.html#boosticl),
recent changes in libc++ v22 broke this library. These changes are related to the fact
that non-heterogeneous lookup for associative containers is poorly specified in
the C++ standard. I filed a [LWG issue](https://cplusplus.github.io/LWG/issue4572) and
defended a resolution with the LEWG that was consistent with the original semantic
assumptions of Boost.ICL, but this resolution was not accepted (Brno, May 10).
There was a fix on hold ([PR#54](https://github.com/boostorg/icl/pull/54)) pending
acceptance from ICL's maintainer, but he's been unavailable and in the end I requested
write permission to the repo and merged the PR so that it makes it in time for
Boost 1.92. The PR includes some additional fixes not related to the core issue.

### Boost.Bloom

* Reviewed and merged [PR#46](https://github.com/boostorg/bloom/pull/46)
from Jonathan Wakely.
* Written maintenance fix
[PR#47](https://github.com/boostorg/bloom/pull/47).

### Boost.Graph

I had the honor to participate remotely in the [Boost.Graph Workshop](https://github.com/boostorg/graph/discussions/466)
held in Paris, May 6, where I presented some simple ideas towards
[modernization of BGL API](https://github.com/user-attachments/files/28546328/JoaquinMunozLopez-BGL.API.pain.points.and.modernization.ideas.pdf).

### Support to the community

* I've been helping a bit with Mark Cooper's very successful
[Boost Blueprint](https://x.com/search?q=%22Boost%20Blueprint%22&src=typed_query&f=live)
series on X. 
* Supporting the community as a member of the Fiscal Sponsorship Committee (FSC).
