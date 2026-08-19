---
layout: post
nav-class: dark
categories: richard
title: Richard's February Update
author-id: richard
---

# The Lesser HTTP Refactor

Aside from the normal answering of queries and [issues](https://github.com/boostorg/beast/issues), February has been a
month dominated by the difference between the `asio::DynamicBuffer_v1` and `asio::DynamicBuffer_v2` concepts.

As I understand things, both Beast and Asio libraries developed the idea of the `DynamicBuffer` concept (or more
correctly, Named Type Requirement \[NTR\]) at roughly the same time, but with slightly different needs.

The original Asio `DyanmicBuffer` describes a move-only type, designed to be a short-lived wrapper over storage which
would allow a composed operation to easily manage data insertions or retrievals from that storage through models of the
`MutableBufferSequence` and `ConstBufferSequence` NTRs.

In Beast, it was found that `DynamicBuffer` objects being move-only caused a difficultly, because the necessarily
complex composed operations in Beast need to create a `DynamicBuffer`, perform operations on it, pass it to a
sub-operation for further manipulation and then continue performing operations on the same buffer.

If the `DynamicBuffer` as been passed by move to a sub operation, then before the buffer can be used again, it will
have to be moved back to the caller by the callee.

Rather than complicate algorithms, Beast's authors took a slightly different track - Beast `DynamicBuffer`s were specified
to be pass-by-reference. That is, the caller is responsible for the lifetime of the `DynamicBuffer` and the callee is
passed a reference.

This satisfied Beast's needs but created an incompatibility with Asio and Net.TS.

Vinnie Falco wrote a [paper](http://www.open-std.org/jtc1/sc22/wg21/docs/papers/2018/p1100r0.html) on the problem
offering a solution to enabling complex composed operations involving `DynamicBuffer`s. On reflection, LEWG took a
different view and solved the problem by
[re-engineering](http://www.open-std.org/jtc1/sc22/wg21/docs/papers/2020/p1790r1.html) the `DynamicBuffer` NTR.

The result is that Boost.Beast objects are now likely to encounter three versions of `DynamicBuffer` objects in the wild
and needs to be able to cope gracefully.

Boost.Asio now has the NTRs `DynamicBuffer_v1` and `DynamicBuffer_v2`, with the NTR `DynamicBuffer` being a synonym for
either depending on configuration flags (defaulting to `DynamicBuffer_v2`).

We have had to go a little further and add a new NTR in Beast, `DynamicBuffer_v0`. The meanings of these NTRs are:

| NTR              | Mapping in Asio      | Mapping in previous Beast | Overview |
| ---              | ---------------      | ------------------------- | -------- |
| DynamicBuffer_v0 | none                 | DynamicBuffer             | A dynamic buffer with a version 1 interface which must be passed by reference |
| DynamicBuffer_v1 | DynamicBuffer_v1     | Asio DynamicBuffer (v1)   | A dynamic buffer with a version 1 interface which must be passed by move |
| DynamicBuffer_v2 | DynamicBuffer_v2     | none                      | A dynamic buffer with a version 2 interface which is passed by copy |

My intention this month was to migrate the entire Beast code base to use Asio's (and current net.ts's) `DynamicBuffer_v2`
concepts while still remaining fully compatible with `DynamicBuffer_v0` objects (which will be in existing user code).

The first attempt sought to change as little of the Beast code as possible, by writing `DynamicBuffer_v0` wrappers for
DynamicBuffer_v[1|2] objects, with those wrappers automatically created on demand in the initiating function of Beast IO
operations. The problem with this approach is that it penalised the use of DynamicBuffer_v2 with an additional memory
allocation (in order to manage a proxy of DynamicBuffer_v1's input and output regions). On reflection, it became
apparent that in the future, use of `DynamicBuffer_v2` will be the norm, so it would be inappropriate for Beast to
punish its use.

Therefore, we have chosen to take the harder road of refactoring Beast to use `DynamicBuffer_v2` in all composed
operations involving dynamic buffers, and refactor the existing `DynamicBuffer_v0` types in order to allow them to
act as storage providers for `DynamicBuffer_v2` proxies while still retaining their `DynamicBuffer_v0` public
interfaces.

I had hoped to get all this done during February, but alas - in terms of released code - I only got as far as the
refactoring of existing types.

The code has been released into the [develop](https://github.com/boostorg/beast/tree/develop) branch as part of
[Version 286](https://github.com/boostorg/beast/commit/c8a726f962b2fbf77d00b273b3c6fb0dd975a6b5).


The refactor of HTTP operations and Websocket Streams in terms of `DynamicBuffer_v2` is underway and indeed mostly
complete, but there was not sufficient time to release a sufficiently robust, reviewed and tested version this month.

I plan to finish off this work in the first part of March, which will hopefully leave time for more interesting
challenges ahead.

# What's Next

Well, the Beast [Issue Tracker](https://github.com/boostorg/beast/issues) is far from clear, so there is plenty of
work to do.

At some point though, I'd like to make a start on a fully featured higher level HTTP client library built on
Boost.Beast.

We'll have to see what unfolds.
