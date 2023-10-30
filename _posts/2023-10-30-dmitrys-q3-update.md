---
layout: post
nav-class: dark
categories: dmitry
title: Dmitry's Q3 2023 Update
author-id: dmitry
author-name: Dmitry Arkhipov
---

In the third quarter my work was mostly focused on improvements to JSON's
conversion features. In Boost.JSON conversion between user types and library
containers is done with `value_to` and `value_from` functions. Conversions of
composite types are attempted recursively. The library provides conversions for
several common groups of types, including sequences, associative containers,
tuples, numbers, and strings. Users also have the option to implement
conversion for other types. The function `value_to` can fail at runtime, when
the structure of JSON value differs from the one expected by conversion
implementation. The function can report those errors in two separate ways:
exceptions and error codes. This is not only expressed in the
front-end—available overloads for `value_to`—but is also supported on the
back-end. In other words, users can report errors from their conversions using
either exceptions or error codes. And the library turns error codes into
exceptions if on the front-end exceptions were requested, and even attempts the
opposite conversion where possible.

There was a problem though, when on the front-end exceptions were requested,
and conversion of the deepest types are using exceptions too, but higher up
errors are reported via error codes, there is a likelihood that the exception
will be swallowed, and then a non-discriminate "some error has occurred"
exception will be thrown instead. In order to fix this, I implemented a
mechanism that communicates user's choice of error reporting to the back-end.

Another change to the `value_to/from` functions was the addition of
`is_optional_like` and `is_variant_like` traits. They determine if a type can
be classified as optional or variant correspondingly. Previously the library
explicitly handled `std::optional` and `std::variant`, and
support for `boost::variant2::variant` was provided in its own library. With
these new traits all types that are sufficiently close to the standard optional
and variant are handled. In the case of optional it has an additional benefit:
conversion for described classes does not treat missing members as an error, if
their types are optionals.

But the biggest amount of time was spent on the new feature: direct parsing.
Even during the Boost review of Boost.JSON some people have complained that
they would prefer to avoid going through JSON containers entirely and parse
directly into their types. This is now possible with the function `parse_into`.
Benchmarks also show that it can potentially double the performance. The design
and most of implementation was provided by Peter Dimov a while ago. So,
I mostly only had to refactor it to reduce code duplication, and change
behaviour of some functions, so that the result is to that of `value_to/from`.
I also added an implementation for optionals, and provided a different
implementation for variants.

That last one deserves some explanation. Back when we were discussing different
ways to convert to and from variants, we chose a seamless approach, where the
variant itself doesn't add anything to representation, but its current
alternative is represented directly. This is what most JSON files use in
practice, but it does complicate conversion back from JSON into variant.
`value_to` attempts conversions for each alternative and picks the first one
which succeeds. This approach is not immediately possible for direct parsing,
though, as the choice of alternative has to be made before the full source of
the value is available. Peter's solution was to only support variants for
which it was easy to discriminate between alternatives. This does eliminate
whole classes of JSON documents, though, in which variants of very similar
alternatives (usually objects) are used. So, I've dealt with variants
differently: the implementation instead records parser events and replays them
for the next alternative if the current one fails.

That approach has a consequence: for variants we need to dynamically allocate
and keep a sequence of events. This can potentially eliminate all performance
benefits, if the variant is the topmost container. To mitigate this I also
implemented a way to limit the amount of parser events variant conversion can
replay. For some variants a fairly small limit would be enough and completely
eliminate the need for additional allocations. Ultimately, I decided not to
merge that customisation, and wait for user feedback.

Finally, there was one notable change to Boost.JSON unrelated to conversion.
Different C++ implementations disagreed whether `value jv{ value() }`
copy-constructs `jv` or uses construction from `initializer_list`. This
resulted in code that behaves differently for different implementations.
Unfortunately we couldn't fix it on our end, this is just a discrepancy between
how implementations treat this syntax. But eventually I came to realisation
that it can be handled explicitly to be a copy by the `initializer_list`
constructor. The constructor now treats `initializer_list`s of size 1 as an
attempt to copy. If you do want an array of size 1, you can use `value jv{
array{x} }`.
