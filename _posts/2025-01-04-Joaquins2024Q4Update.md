---
layout: post
nav-class: dark
categories: joaquin
title: Joaquín's Q4 2024 Update
author-id: joaquin
author-name: Joaquín M López Muñoz
---

During Q4 2024, I've been working in the following areas:

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

### Boost.PolyCollection

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
