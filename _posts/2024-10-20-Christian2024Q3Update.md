---
layout: post
nav-class: dark
categories: christian
title: "The Safe C++ Saga"
author-id: christian
author-name: Christian
---

## The Safe C++ Saga

I've spent the last quarter developing a successor to the C++ stdlib in Safe C++, the
proposal from Sean Baxter to add borrow-checking semantics to C++.

I've been an avid Rust fan since I started messing around with it in my spare time a few
years ago so hopping on this project was an incredibly exciting opportunity. Getting to
evolve a standard library in tandem with a language that attempts to do the nigh-on-impossible
is a once-in-a-lifetime opportunity, really.

Public reception, however, hasn't always been great. Most people viewed a new stdlib as a huge
mark _against_ Safe C++.

Many C++ developers aren't aware of the shift in object model that borrow-checking brings. It
brings the long-fabled destructive move to C++ and its objects. Initialization analysis and the
other components of borrow-checking enable the compiler to permit true relocation. Objects can be
freely memcpy'd back and forth and this is well-defined because the language guarantees that objects
are not accessed post-destruction and that their destructors are _not_ run. Borrow checking also
protects against relocating self-referential structs as well, because a move cannot be done through a borrow.

Out of this naturally falls alternative ways of creating library components. The current stdlib components
are coded against the original object model of C++: that there's no such thing as relocation, there's only
move and copy construtors. Object lifetime can begin using a view of an existing object. There's no notion
of an object being destroyed after move or copy and if there were, the semantics for how this would work in C++
is unclear because non-trivial destructors would still need to get run and what's more, there's no language
mechanism to prevent accesses to the moved-from or relocated-from object.

Borrow checking is such a fundamental shift to systems languages that a new standard library is a natural consequence.
It's a change so fundamental that many want to outright reject it, as it would appear to steer the language's direction
too radically. I can empathize with this and I agree with it on some level. But by the same token, I view it as
a dramatic simplification and reification of everything we've worked towards and built since C++'s inception.

One thing that always got lost in translation was that Rust isn't really that original. Most of its ideas have already
been discussed and thought about for awhile. It's just the only systems language we have that applied these ideas and
it's shown that it's a successful endeavor. Safe C++ is then an experiment to do the same for C++ and it's working equally
well. Safe C++ has proven that you can use exclusive mutability and borrow checking in C++ and it works.

I love systems programming and I love C++ and I love Rust and I think the world is a better place when we do steal ideas
from each other. In college, I took some creative writing/poetry courses and my professor mentioned an old adage that
all the best writers steal and that's only proven itself true as times goes on for me. Shamelessly stealing the good ideas
from other sources is where true innovation comes in because it creates novel ideas made from currently-working ones.

I'm optimistic about the eventual future of C++ because we've proven that a truly safe C++ is possible. The only thing
standing in the way is ourselves but that is a much more difficult problem to solve.

- Christian
