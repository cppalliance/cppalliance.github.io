---
layout: post
nav-class: dark
categories: gennaro
title: "DynamicBitset Reimagined: A Quarter of Flexibility, Cleanup, and Modern C++"
author-id: gennaro
author-name: Gennaro Prota
---

Over the past three months, I've been immersed in a deep and wide-ranging
overhaul of the Boost.DynamicBitset library. What started as a few targeted
improvements quickly evolved into a full-scale modernization effort—touching
everything from the underlying container to iterator concepts, from test
coverage to documentation style. More than 170 commits later, the library is
leaner, more flexible, and better aligned with modern C++ practices.

## Making the core more flexible

The most transformative change this quarter was allowing users to choose the
underlying container type for `dynamic_bitset`. Until now, the implementation
assumed `std::vector`, which limited optimization opportunities and imposed
certain behaviors. By lifting that restriction, developers can now use
alternatives like `boost::container::small_vector`, enabling small buffer
optimization and more control over memory layout.

This change had ripple effects throughout the codebase. I had to revisit
assumptions about contiguous storage, update operators like `<<=`, `>>=`, and
ensure that reference stability and iterator behavior were correctly handled.

## Introducing C++20 iterators

One of the more exciting additions this quarter was support for C++20-style
iterators. These new iterators conform to the standard iterator concepts, making
`dynamic_bitset` more interoperable with modern algorithms and range-based
utilities.

I added assertions to ensure that both the underlying container and
`dynamic_bitset` itself meet the requirements for bidirectional iteration. These
checks are enabled only when compiling with C++20 or later, and they help catch
subtle mismatches early—especially when users plug in custom containers.

## Saying goodbye to legacy workarounds

With modern compilers and standard libraries, many old workarounds are no longer
needed. I removed the `max_size_workaround()` after confirming that major
implementations now correctly account for allocators in `max_size()`. I also
dropped support for obsolete compilers like MSVC 6 and CodeWarrior 8.3, and for
pre-standard iostreams, cleaned up outdated macros, and removed compatibility
layers for pre-C++11 environments.

These removals weren't just cosmetic—they simplified the code and made it easier
to reason about. In many places, I replaced legacy constructs with standard
features like `noexcept` and `std::move()`.

## constexpr support

When it is compiled as C++20 or later, almost all functions in DynamicBitset are
now `constexpr`.

## Dropping obsolete dependencies

As part of the cleanup effort, I also removed several outdated dependencies that
were no longer justified. These included Boost.Integer (previously used by
`lowest_bit()`), `core/allocator_access.hpp`, and various compatibility headers
tied to pre-C++11 environments. This not only reduces compile-time overhead and
cognitive load, but also makes the library easier to audit and maintain.


## Strengthening the test suite

A part of this quarter's work was expanding and refining the test coverage. I
added new tests for `flip()`, `resize()`, `swap()`, and `operator!=()`. I also
ensured that input iterators are properly supported in `append()`, and verified
that `std::hash` behaves correctly even when two bitsets share the same
underlying container but differ in size.

Along the way, I cleaned up misleading comments, shortened overly complex
conditions, and removed legacy test code that no longer reflected the current
behavior of the library. The result is a test suite that's more robust, more
meaningful, and easier to maintain.

## Documentation that speaks clearly

I've always believed that documentation should be treated as part of the design,
not an afterthought. This quarter, I ported the existing documentation to MrDocs
and Antora, while fixing and improving a few bits in the process. This uncovered
a few MrDocs bugs, some of which remain—but I'm hopeful.

I also spent time harmonizing the style and structure of the library's comments
and docstrings.

I chose to document iterator categories rather than exposing concrete types,
which keeps the interface clean and focused on behavior rather than
implementation details.

## New member functions and smarter implementations

This quarter also introduced several new member functions that expand the
expressiveness and utility of `dynamic_bitset`:

- `push_front()` and `pop_front()` allow bit-level manipulation at the front of
  the bitset, complementing the existing back-oriented operations.
- `find_first_off()` and `find_next_off()` provide symmetric functionality to
  their `find_first()` counterparts, making it easier to locate unset bits.
- A constructor from `basic_string_view` was added for C++17 and later,
  improving interoperability with modern string APIs.

Alongside these additions, I revisited the implementation of several existing
members to improve performance and clarity:

- `push_back()` and `pop_back()` were streamlined for better efficiency.
- `all()` and `lowest_bit()` were simplified and optimized, with the latter also
  shedding its dependency on Boost.Integer.
- `append()` was fixed to properly support input iterators and avoid redundant
  checks.

## Minor but impactful cleanups

A large number of small edits improved correctness, readability, and
maintainability:

- Fixed the stream inserter to set `badbit` if an exception is thrown during
  output.
- Changed the stream extractor to rethrow any exceptions coming from the
  underlying container.
- Reordered and cleaned up all #include sections to use the "" form for Boost
  includes where appropriate and to keep include groups sorted.
- Removed an example timing benchmark that was misleading and a number of
  unneeded comments and minor typos across code and docs.

These edits reduce noise and make code reviews and maintenance more pleasant.

## Reflections

Looking back, this quarter reminded me of the value of revisiting assumptions.
Many of the workarounds and constraints that once made sense are now obsolete.
By embracing modern C++ features and simplifying where possible, we can make
libraries like `dynamic_bitset` more powerful and more approachable.

It also reinforced the importance of clarity—both in code and in documentation.
Whether it's a test case, a comment, or a public API, precision and consistency
go a long way.

The work continues, but the foundation is stronger than ever. If you're using
`dynamic_bitset` or thinking about integrating it into your project, I'd love to
hear your feedback.
