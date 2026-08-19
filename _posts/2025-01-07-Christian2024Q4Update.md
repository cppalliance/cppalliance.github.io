---
layout: post
nav-class: dark
categories: christian
title: "Hashing and Matching"
author-id: christian
author-name: Christian Mazakas
---

## Boost.Hash2

I'm happy to report that the library I helped Peter Dimov develop, [Hash2](https://github.com/pdimov/hash2), was accepted
after probably one of the most thorough Boost reviews to have happened in recent history.

I can't claim to have contributed all too much to the design. After all, Hash2 was an implementation of
[Types Don't Know #](https://open-std.org/jtc1/sc22/wg21/docs/papers/2014/n3980.html).
But I did come along and help implement myriad algorithms and help with the absolutely massive testing burden.
Interestingly, I think people who don't sit and write/maintain Boost libraries all day underestimate just how much testing
even something like 10 extra lines of source can require. When you write software with a certain minimum bar of quality,
almost all your effort and time go into testing it than anything else. This is because if a Boost library gets it wrong,
there's really no good way to unwind that. Bad versions of `libboost-dev` will have already gone out and then packagers
need to re-package and the whole thing is a huge debacle for users and packagers.

Working on Hash2 is fun and engaging and more importantly, it finally gives C++ developers something reputable and makes
hashing as easy as it should be. The only problem with Hash2 that I can think of as a user of Boost would be that it took
until 2024 (and now basically 2025) for Boost to have simple and effective hashing routines.

For example,
```cpp
std::string get_digest(std::vector<char> const& buf)
{
    boost::hash2::sha2_256 h;
    h.update(buf.data(), buf.size());
    return to_string(h.result());
}
```

Very simple, very nice and clean and does what it says on the box.

The version of the library that was accepted is also far from the final version as well. The library will continue to evolve
and quality of implementation will be iterated on and the interfaces will naturally be refined. It's good for reviewers and
authors of Boost libraries to keep in mind that libraries aren't some static thing that are carved out of stone. The accepted
version of a Boost library is very seldom similar to the version 4 releases down the line. Boost.Asio is probably the most
emblematic of this, having undergone dramatic refactors over the years.

One thing I'm particularly looking forward to is experimenting with sha-256 intrinsics available on certain Intel CPUs but
that'll come later once the base sha2 family has had a nice performance overhaul and maybe a few new algorithms are also added
to the collection.

## Boost.Regex

I've also started working with Boost.Regex author John Maddock to squash CVEs filed against Boost.Regex found by Google's oss-fuzz
project, which is a wonderful contribution to the world of open-source.

While as developers we may use regexes in our day-to-day lives, it's an entirely different world to actually implement a regex engine.
Learning what goes into this has been fascinating and I do have to admit, I'm tremendously humbled by John's prowess and ability
to navigate the complexities of the state machine construction. In a similar vein, I'm equally impressed at just how effective fuzzing is
at crafting input. I've known about fuzzing for a good bit of time now as most modern software developers do but I've never stopped to
sit down and truly appreciate just how valuable these tools are.

One of the first things I essentially had to do for the repo was get it to a place where clangd could handle the generated compiled_commands.json.
clangd is one of the better developer tools to come out but has caveats in that it can't handle non-self-contained header files and old school Boost
libraries like to `#include` various implementation headers at the bottom. Fixing this for clangd normally requires recursive `#include`s or just not
using implementation headers. In most cases, it's easiest to deal with the recursion and solve it by simply just adding `#pragma once`. Because this is
Boost, the Config module even has all the macros that help detect when `#pragma once` is available so we can support all the compilers and all the
toolchains no matter what.

I look forward to continuing to work with John on Regex but in the interim, I'm having fun taking a Hash2 break.

-- Christian
