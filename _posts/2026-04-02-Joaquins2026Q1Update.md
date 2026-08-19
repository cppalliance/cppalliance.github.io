---
layout: post
nav-class: dark
categories: joaquin
title: Hubs, intervals and math
author-id: joaquin
author-name: Joaquín M López Muñoz
---

During Q1 2026, I've been working in the following areas:

### `boost::container::hub`

[`boost::container::hub`](https://github.com/joaquintides/hub) is a nearly drop-in replacement of
C++26 [`std::hive`](https://eel.is/c++draft/sequences#hive) sporting a simpler data structure and
providing competitive performance with respect to the de facto reference implementation
[`plf::hive`](https://github.com/mattreecebentley/plf_hive). When I first read about `std::hive`,
I couldn't help thinking how complex the internal design of the container is, and wondered
if something leaner could in fact be more effective. `boost::container::hub` critically relies
on two realizations:

* Identification of empty slots by way of [`std::countr_zero`](https://en.cppreference.com/w/cpp/numeric/countr_zero.html)
operations on a bitmask is extremely fast.
* Modern allocators are very fast, too: `boost::container::hub` does many more allocations
than `plf::hive`, but this doesn't degrade its performance significantly (although it affects
cache locality).

`boost::container::hub` is formally proposed for inclusion in Boost.Container and will be
officially reviewed April 16-26. Ion Gaztañaga serves as the review manager.

### using std::cpp 2026

I gave my talk ["The Mathematical Mind of a C++ Programmer"](https://github.com/joaquintides/usingstdcpp2026)
at the [using std::cpp 2026](https://eventos.uc3m.es/141471/detail/using-std-cpp-2026.html) conference
taking place in Madrid during March 16-19. I had a lot of fun preparing the presentation and
delivering the actual talk, and some interesting discussions  were had around it.
This is a subject I've been wanting to talk about for decades, so I'm somewhat relieved I finally
got it over with this year. Always happy to discuss C++ and math, so if you have feedback
or want to continue the conversation, please reach out to me.

### Boost.Unordered

* Written maintenance fixes
[PR#328](https://github.com/boostorg/unordered/pull/328),
[PR#335](https://github.com/boostorg/unordered/pull/335),
[PR#336](https://github.com/boostorg/unordered/pull/336),
[PR#337](https://github.com/boostorg/unordered/pull/337),
[PR#339](https://github.com/boostorg/unordered/pull/339),
[PR#344](https://github.com/boostorg/unordered/pull/344),
[PR#345](https://github.com/boostorg/unordered/pull/345). Some of these fixes are related
to Node.js vulnerabilities in the Antora setup used for doc building: as the number
of Boost libraries using Antora is bound to grow, maybe we should think of an automated
way to get these vulnerabilities automatically fixed for the whole project.
* Reviewed and merged
[PR#317](https://github.com/boostorg/unordered/pull/317),
[PR#332](https://github.com/boostorg/unordered/pull/332),
[PR#334](https://github.com/boostorg/unordered/pull/334),
[PR#341](https://github.com/boostorg/unordered/pull/341),
[PR#342](https://github.com/boostorg/unordered/pull/342). Many thanks to
Sam Darwin, Braden Ganetsky and Andrey Semashev for their contributions.

### Boost.Bimap

Merged
[PR#31](https://github.com/boostorg/bimap/pull/31) (`std::initializer_list`
constructor) and provided testing and documentation for this new
feature ([PR#54](https://github.com/boostorg/bimap/pull/54)). The original
PR was silently sitting on the queue for more than four years and it
was only when it was brought to my attention in a Reddit conversation that
I got to take a look at it. Boost.Bimap needs an active mantainer,
I guess I could become this person.

### Boost.ICL

[Recent changes](https://github.com/llvm/llvm-project/pull/161366) in libc++ v22
code for associative container lookup have resulted in the 
[breakage of Boost.ICL](https://github.com/boostorg/icl/issues/51). 
My understanding is that the changes in libc++ are not
standards conformant, and there's an [ongoing discussion](https://github.com/llvm/llvm-project/issues/187667)
on that; in the meantime, I wrote and proposed a [PR](https://github.com/boostorg/icl/pull/54)
to Boost.ICL that fixes the problem (pending acceptance).

### Support to the community

* I've been helping a bit with Mark Cooper's very successful
[Boost Blueprint](https://x.com/search?q=%22Boost%20Blueprint%22&src=typed_query&f=live)
series on X. 
* Supporting the community as a member of the Fiscal Sponsorship Committee (FSC).



