---
layout: post
nav-class: dark
categories: joaquin
title: Joaquín's Q4 2024 Update
author-id: joaquin
author-name: Joaquín M López Muñoz
---

During Q4 2024, I've been working in the following areas:

### Boost.Unordered

* Updated CI support ([PR#293](https://github.com/boostorg/unordered/pull/293),
[PR#296](https://github.com/boostorg/unordered/pull/296),
[PR#297](https://github.com/boostorg/unordered/pull/297),
[PR#298](https://github.com/boostorg/unordered/pull/298)).
* Prepared a private document for Peter Dimov and Braden Ganetsky discussing
massively parallel scenarios where [ParlayHash](https://github.com/cmuparlay/parlayhash)
has better performance than `boost::concurrent_flat_map`. We haven't been able
to progress much further than that in Q4 2024, mainly because of my lack
of availablity for this specific task.
* I've set up and run [benchmarks](https://github.com/boostorg/boost_unordered_benchmarks/tree/boost_unordered_aggregate_indivi)
comparing [`indivi::flat_umap`](https://github.com/gaujay/indivi_collection)
with `boost::unordered_flat_map`. Although Indivi is generally slower,
a [conversation](https://www.reddit.com/r/cpp/comments/1g2oso8/introducing_flat_umap_a_fast_simdbased_unordered/lrqqsi7/)
with the author led to some interesting design aspects that may be worth exploring further.
* After the last [major update in Boost 1.87.0](https://www.boost.org/libs/unordered/doc/html/unordered.html#changes_release_1_87_0_major_update),
the backlog for Boost.Unordered is basically cleared. This means that the library
will likely enter into maintenance mode, except if new requests show up
—do you have any?

### Boost.PolyCollection

* Updated CI support ([PR#22](https://github.com/boostorg/poly_collection/pull/22),
[PR#23](https://github.com/boostorg/poly_collection/pull/23)).
* Added the new [`boost::variant_collection`](https://www.boost.org/doc/libs/develop/doc/html/poly_collection/reference.html#poly_collection.reference.header_boost_poly_collection_va0)
container (to be released in Boost 1.88.0).
`boost::variant_collection_of<Ts...>` is similar to
`std::vector<std::variant<Ts...>>`, with the crucial difference that elements
storing the same alternative type are grouped together. For instance, the following:
```cpp
boost::variant_collection_of<int, double, std::string> c;
// ...
for(const auto& x:c) {
  visit(
    [](const auto& x) { std::cout << x << "\n"; },
    x);
}
```
will print first the `int`s in the collection, then the `double`s, and finally
the `std::string`s. In exchange for this restriction, important
[processing speedups](https://www.boost.org/doc/libs/develop/doc/html/poly_collection/performance.html#poly_collection.performance.processing_tests.results_for_boost_variant_collec)
can be obtained.

### Boost.Mp11

* Implemented [`mp_lambda`](https://www.boost.org/libs/mp11/doc/html/mp11.html#lambda)
(released in Boost 1.87.0), a metaprogramming utility inspired by the venerable
[_placeholder expressions_ from Boost.MPL](https://live.boost.org/libs/mpl/doc/refmanual/placeholder-expression.html).
`mp_lambda` allows us to generate complex types specified with a rather natural syntax
in terms of elementary input types indicated by
[Boost.Mp11 _placeholder types_](https://www.boost.org/libs/mp11/doc/html/mp11.html#1_9).
For instance, `std::pair<_1*, _2*>` can be regarded as a type template with
two placeholder positions, and `mp_lambda<std::pair<_1*, _2*>>::fn<int, char>` is,
unsurprisingly enough, the type `std::pair<int*, char*>`. My original motivation
for writing this utility is to provide a Boost.Mp11 equivalent to Boost.MPL lambda
expressions that can pave the way for an eventual modernization of
Boost.Flyweight, which [relies heavily](https://www.boost.org/libs/flyweight/doc/tutorial/configuration.html#factory_types)
on this functionality from Boost.MPL.
* Rewritten the implementation of `mp_is_set`
([PR#100](https://github.com/boostorg/mp11/pull/100), released in Boost 1.87.0) to
achieve some rather noticeable compile-time improvements.

### Boost.MultiIndex, Boost.Flyweight

* Updated CI support ([PR#75](https://github.com/boostorg/multi_index/pull/75),
[PR#78](https://github.com/boostorg/multi_index/pull/78),
[PR#20](https://github.com/boostorg/flyweight/pull/20)).
* Investigated issue with Boost.Interprocess
([#236](https://github.com/boostorg/interprocess/issues/236)) that was
causing Boost.Flyweight tests to fail in GCC/MinGW.

### Boost promotion and new website

* Authored the Boost 1.87 announcement [tweet](https://x.com/Boost_Libraries/status/1867161745661583556), and
the Boost.Hash2 acceptance [tweet](https://x.com/Boost_Libraries/status/1873826841653633076).
* Held some meetings with Rob's team on Asciidoc display problems and a new `latest` URL scheme for
doc publication. I'm very excited about the latter, as this addition will likely help
us improve SEO and fight outdated archived links to the libraries docs: for instance, the
link [https://www.boost.io/doc/libs/latest/doc/html/boost_asio.html](https://www.boost.io/doc/libs/latest/doc/html/boost_asio.html)
will _always_ point to the latest published version of Boost.Asio documentation,
unlike version-specific links such as
[https://www.boost.io/doc/libs/1_87_0/doc/html/boost_asio.html](https://www.boost.io/doc/libs/1_87_0/doc/html/boost_asio.html).
* Filed some issues ([#1549](https://github.com/boostorg/website-v2/issues/1549),
[#1576](https://github.com/boostorg/website-v2/issues/1576),
[#1577](https://github.com/boostorg/website-v2/issues/1577)).

### Support to the community

* I've proofread Braden Ganetsky's article on [Natvis testing](https://blog.ganets.ky/NatvisTesting/).
* As a member of the Fiscal Sponsorhip Committee (FSC), we're having conversations with
[For Purpose Law Group](https://www.fplglaw.com/) to finalize the writing of the Boost/C++ Alliance Fiscal Sponsor Agreement (FSA),
and with the Boost Foundation to help them complete the transfer of
the assets to be controlled by such FSA, most importantly the ownership of the
boost.org domain. Both tracks are making progress, albeit at a lower pace than desired.
