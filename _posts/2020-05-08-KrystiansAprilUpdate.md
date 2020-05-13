---
layout: post
nav-class: dark
categories: krystian
title: Krystian's April Update
---

# Overview

Boost 1.73.0 has been released! Save for some minor documentation issues, Boost.StaticString enjoyed a bug-free release, so most of this month was spent working on Boost.JSON getting it ready for review. Unfortunately, I could not spend too much time working due to school and final exams, but now that those have passed I'll be able to put in significantly more time working on projects such as Boost.JSON.

# Boost.JSON

A good portion of my work on Boost.JSON was spent updating the documentation to reflect the replacement of the `storage` allocator model with `boost::container::pmr::memory_resource` (or `std::pmr::memory_resource` in standalone). The old model wasn't necessarily bad, but using `memory_resource` permits the use of existing allocators found in Boost.Container/the standard library, eliminating the need for writing proprietary allocators that only work with Boost.JSON.

Even though `storage` will be going away, `storage_ptr` will remain to support shared ownership of a `memory_resource` -- something that `polymorphic_allocator` lacks. As with `polymorphic_allocator`, `storage_ptr` will still support non-owning reference semantics in contexts where the lifetime of a `memory_resource` is bound to a scope, giving users more flexibility.

I also worked on `monotonic_resource`, the `memory_resource` counterpart to `pool`. This allocator has one goal: to be *fast*. I ended up adding the following features to facilitate this (mostly from `monotonic_buffer_resource`):

- Construction from an initial buffer,
- The ability to reset the allocator without releasing memory, and
- The ability to set a limit on the number of bytes that can be dynamically allocated.

The implementations of these features are pretty trivial, but they provide significant opportunities to cut down on dynamic allocations. For example, when parsing a large number of JSON documents, a single `monotonic_resource` can be used and reset in between the parsing of each document without releasing any dynamically allocated storage. While care should be taken to destroy objects that occupy the storage before the allocator is reset, this can substantially reduce the number of allocations required and thus result in non-trivial performance gains.

The other major thing I worked on was fixing an overload resolution bug on clang-cl involving `json::value`. This was originally brought to my attention by Vinnie when the CI build for clang-cl started reporting that overload resolution for `value({false, 1, "2"})` was ambiguous. After a few hours of investigating, I found that `false` was being treated as a null pointer constant -- something that was certainly annoying, but it also didn't fully explain why this error was happening. 

After this unfortunate discovery, I tried again with `value({0, 1, "2"})`, this time on clang, and it turns out this was a problem here as well. After *many* hours of testing, I found that the constructor in `storage_ptr` taking a parameter of type `memory_resource` had a small problem: its constraint was missing `::type` after the `enable_if`, allowing `storage_ptr` to be constructed from any pointer type, including `const char*`. This somewhat helped to alleviate the problem, but `value({false, false, false})` was still failing. After many more hours of groking the standard and trying to reproduce the error, I finally came upon the following `json::string` constructors:

```
string(string const& other, std::size_t pos, std::size_t count = npos, storage_ptr sp = {})

string(string_view other, std::size_t pos, std::size_t count = npos, storage_ptr sp = {})
``` 

See the problem here? Since the first parameter of both constructors can be constructed from null pointer constants, overload resolution for `string(0, 0, 0)` would be ambiguous. However, this isn't the full story. Consider the following constructors for `value`:

```
value(std::initializer_list<value_ref> init)

value(string str)
```

For the initialization of `value({0, 0, 0})` the implicit conversion sequence to `str` would be ambiguous, but the one to `value_ref` can be formed. There is a special rule for overload resolution (separate from two-stage overload resolution during list-initialization) that considers any list-initialization sequence that converts to `std::initializer_list` to be a better conversion sequence than one that does not, with the exception to this rule being that it only applies when the two conversion sequences are otherwise identical.

This rule *should* apply here, however, I found that clang has a small bug that prevents this rule from going into effect if any of the candidates have an ambiguous conversion sequence for the same parameter. We solve this pretty trivially by removing some of the redundant constructor overloads in `json::string` and all was well. It was a fun little puzzle to solve (the explanation was a bit of an oversimplification; if you have questions please let me know).

If you want to get in touch with me, you can message me on the [Cpplang slack](http://slack.cpp.al/), or [shoot me an email](mailto:sdkrystian@gmail.com).