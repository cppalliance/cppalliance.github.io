---
layout: post
nav-class: dark
categories: joaquin
title: Unordered polymorphic collections
author-id: joaquin
author-name: Joaquín M López Muñoz
---

During Q3 2026, I've been working in the following areas:

### Unordered polymorphic collections

The preexisting containers offered by Boost.PolyCollection
(`boost::base_collection`, `boost::function_collection`, `boost::any_collection`,
`boost::variant_collection`) do not provide full control over the global positioning
of an element, for the simple reason that each element goes to its dedicated,
type-specific segment. At the segment level, though, users can decide where an
element is inserted much as they would with a `std::vector`, which is, ultimately,
the data structure these segments are based on.

If the user can dispense with intra-segment positioning, segments can be implemented
with a different internal data structure.
[_Unordered polymorphic collections_](https://www.boost.org/doc/libs/develop/doc/html/poly_collection/tutorial.html#poly_collection.tutorial.unordered_collections)
(`boost::base_unordered_collection`, `boost::function_unordered_collection`,
`boost::any_unordered_collection`, `boost::variant_unordered_collection`) internally
use [`boost::container::hub`](https://www.boost.org/doc/libs/latest/doc/html/container/non_standard_containers.html#container.non_standard_containers.hub)-based
segments, giving these collections iterator and reference stability. Their performance
profile relative to the existing ordered collections is different: insertion is on
par or even faster, whereas iteration is definitely slower (nothing beats iterating
over a vector). My hypothesis is that iterator stability is a very desirable property
in the kind of scenarios targeted by Boost.PolyCollection — time will tell.
Unordered polymorphic collections will ship with Boost 1.93.

The internal design of Boost.PolyCollection is interesting: all eight collections
are instantiations of the same internal `poly_collection` class template,
parameterized by a so-called _model_ that encodes:

* The type of runtime polymorphism used (OOP, function wrapping, duck typing,
  `std::variant`-like).
* Whether the collection is ordered or unordered.
* Whether the collection is closed (`boost::variant_[unordered]_collection`) or
  open (the rest).

The result is a rich internal structure in which interoperable parts are combined
across three independent dimensions. As a reference for interested readers (and
for my future self) I've written the article
["Inside Boost.PolyCollection"](https://bannalia.blogspot.com/2026/09/inside-boostpolycollection.html),
which explains the design in some detail.

#### Boost.PolyCollection maintenance

* [PR#33](https://github.com/boostorg/poly_collection/pull/33),
[PR#34](https://github.com/boostorg/poly_collection/pull/34).

### `boost::container::hub`

* Optimized range insertion ([PR#339](https://github.com/boostorg/container/pull/339)).
* Written maintenance fix [PR#340](https://github.com/boostorg/container/pull/340).

### Boost.MultiIndex

* Written maintenance fixes
[PR#102](https://github.com/boostorg/multi_index/pull/102),
[PR#104](https://github.com/boostorg/multi_index/pull/104).

### Papergate

(Not related to Boost.) Papergate is an AI tool that takes any WG21 proposal and determines
whether _the paper itself_ answers a simple question: why is this worth standardizing?
Papergate looks at things such as the presentation of alternatives, cost/benefit analysis,
availability of a reference implementation, etc. The goal is not to assess the merits of a
proposal, but merely to check whether the paper addresses the basic questions a human reviewer
will ask before digging into the details. I've been working on the `md` prompt powering Papergate.
Papergate is integrated into [wg21.org](https://wg21.org/).

### Support to the community

* I've been helping a bit with Mark Cooper's very successful
[Boost Blueprint](https://x.com/search?q=%22Boost%20Blueprint%22&src=typed_query&f=live)
series on X.
* Working on a classification of Boost libraries according to their maintenance status
(work in progress). This will help us point new volunteers toward those
libraries most in need of attention.
* Supporting the community as a member of the Fiscal Sponsorship Committee (FSC).
