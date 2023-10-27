---
layout: post
nav-class: dark
categories: joaquin
title: Joaquín's Q3 2023 Update
author-id: joaquin
author-name: Joaquín M López Muñoz
---

During Q3 2023, I've been working (mostly in collaboration wth Chris) in the following areas:

### Boost.Unordered

* Shipped [Boost.Unordered 1.83](https://www.boost.org/doc/libs/1_83_0/libs/unordered/doc/html/unordered.html#changes_release_1_83_0_major_update).
* I've written the article ["Inside boost::concurrent_flat_map"](https://bannalia.blogspot.com/2023/07/inside-boostconcurrentflatmap.html)
explaining the internal data structure and algorithms of this new container.
* I developed an improvement to concurrent containers for visit operations (branch [`feature/optimized_visit_access`](https://github.com/boostorg/unordered/tree/feature/optimized_visit_access))
that takes advantage of const-accepting visitation functions even when passed to a non-const
`visit` overload. For instance, the following:<br/><br/>
`m.visit(k, [](const auto& x){ res += x.second; });`<br/><br/>
uses non-const `visit` even though the visitation function does not modify `x`. The optimization
detects this circumstance and grants the visitation function _shared_ rather than
exclusive access to `x`, which potentially increases performance. At the end, we
decided not to include this optimization as it's hard to communicate to the
user and was deemed too smart --the simple alternative is to use `cvisit`.
* Added `[c]visit_while` operations to concurrent containers, with serial and parallel variants
(target Boost 1.84).
* Added debug-mode mechanisms for detecting illegal reentrancies into a concurrent
container from user code (target Boost 1.84).
* Added efficient move construction of `boost::unordered_flat_(map|set)` from
`boost::concurrent_flat_(map|set)` and vice versa (target Boost 1.84).
* Worked on supporting [Clang Thread Safety Analsysis](https://clang.llvm.org/docs/ThreadSafetyAnalysis.html)
(branch [`feature/clang_thread_safety_analysis`](https://github.com/boostorg/unordered/tree/feature/clang_thread_safety_analysis)).
This work was eventually abandoned because the analysis is rather limited --for instance,
it's strictly [intraprocedural](https://clang.llvm.org/docs/ThreadSafetyAnalysis.html#no-inlining)
and can't detect issues with user-provided visitation functions.
* Supported Chris in the addition of support for fancy pointers to open-addressing and
concurrent containers. This enables scenarios like the use of Boost.Interprocess allocators
to construct containers in shared memory (target Boost 1.84).
* Added Boost.Serialization support to all containers and their (non-local)
iterator types (target Boost 1.84).
* Solved issue [#205](https://github.com/boostorg/unordered/issues/205).
* Added `boost::concurrent_flat_set` (target Boost 1.84).
* Reviewed PR #215 (https://github.com/boostorg/unordered/pull/215) for
code clean-up after upgrading from C++03 to C++11 as our new minimum
for closed-addressing containers.

### CppCon 2023

* With the help and feedback of many, I've prepared a poster and a brochure
to help publicize the latest development of Boost a this event.
