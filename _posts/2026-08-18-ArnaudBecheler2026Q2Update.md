---
layout: post
nav-class: dark
categories: arnaud
title: The Return of the Graph
author-id: arnaud
author-name: Arnaud Becheler
---

Q1 was all about identifying Boost.Graph user community and implementing a community detection algorithm.
Q2 has been focusing on making Boost.Graph a comfy place where our community can thrive by exorcising the old legacy shadows that a 30-year-old project inevitably summons.

### Where the Shadows Lie

Over its 30 years of existence, Boost.Graph naturally accumulated technical debt and quite a few ghosts.
Some of those are invisible to users, like an outdated C++ style, internal const-correctness or constexpr-ness.
But most are more concerning because they impact metrics users care about:
- documentation accessibility
- warning counts
- undefined behaviors
- code coverage
- compile time
- runtime performance
- memory usage
- transitive dependency count.

### One Doc to Find Them All

If you can't find a feature in the doc, does it really exist?
I was particularly happy to see the [new Boost.Graph documentation](https://www.boost.org/doc/libs/latest/libs/graph/doc/html/graph/index.html) shipping with Boost 1.92.

A modernized documentation that lowers the bar for newcomers has been a major focus of my work with the C++ Alliance
over the last six months. The previous doc infrastructure was written as pure HTML and was tedious to read,
scan and update: it's now easier than ever!

Numerous examples built and run in CI have been brought. And look at the [cool animations](https://www.boost.org/doc/libs/latest/libs/graph/doc/html/graph/primitives.html#_traversal) to make graph semantics crystal clear.

### One Bot to Warn them All

It began with creating a CI bot that, for each PR, counts the number of warnings across the build matrix
and compares it to the last develop build.
This delta to baseline gives an easy metric and dashboard to review PRs (preventing creep to grow back) 
and orient refactors (identifying low-hanging fruits where a small fix removes many warnings).
Hundreds of warnings have been fixed so far, bringing non-msvc builds close to zero
(with `-Wall -Wextra` disabled; but they are now enabled and work is on the way).

### One Bot to Test them All

Code coverage PR bots were enabled for the repository, leading to some unit test modernization.
Numerous unit tests seemed to have been historically developed as examples: writing to the output,
always passing, never checking for correctness, often not seeding random number generators.
I opened a series of PRs to tie them to the test framework, testing hard expectations
where possible and statistical properties where required.

### Seventy Two Deps for Mortified Users, Doomed to Die

Boost.Graph is among the heaviest libraries in the ecosystem (72 dependencies). 
So another bot was created that, for each PR, reports any change in dependency weight
(included headers) and number of transitive dependencies.
This helps orient dependency-reduction operations and will prevent future contributors
from bringing back heavy weights. After removing the Boost dependencies
that C++14 made outdated (Boost.SmartPtr, Boost.Math, Boost.TTI, Boost.Move,
Boost.Foreach, Boost.Conversion, Boost.Typeof, Boost.Bind, Boost.Lambda, Boost.MPL, ...),
I opened a number of PRs to drop the mammoth culprits: Boost.Spirit, Boost.Bimap, Boost.PropertyTree,
Boost.Serialization. When merged, they will considerably lighten the transitive dependency chain.
In local benchmarks I could already measure considerable performance gains both in memory and speed
when dropping PropertyTree (3x better in speed and memory), while dropping Xpressive brings ~3600 fewer warnings in CI with `-Wall -Wextra` enabled.

### One Process to Bring Them All (with love)

Contributors are essential to open-source projects, even more so for Boost.Graph because implementing graph algorithms requires both
deep theoretical knowledge of the field and solid technical mastery over C++ and Boost. Which is a (highly) unusual skillset: where
skills are fragmented, collaboration thrives!

So I continued my way through the backlog of unsolved issues and stale/unmerged PRs, contacting authors and supporting new contributors.
Notably, a coming PR for a very popular Personalized PageRank algorithm by a new contributor (Emmanouil Manios Krasanakis) is close to acceptance.
This is a very exciting moment because the entire PR will be used as a reference for testing our [new Algorithm Submission Process](https://github.com/boostorg/graph/discussions/495).

In short, this is our response to user complaints about unresponsive review process. It has been designed in 3 phases to avoid monolithic PRs that are hard or impossible to review, and to favor quick iteration and collaboration between graph theorists and Boost.Graph maintainers:

- Phase A: Design. Discussion in the issue, sketches in Compiler Explorer, until a minimum viable signature is agreed upon. Output is a Compiler Explorer link that compiles and runs.
- Phase B: Working code. The signature is implemented in the BGL idiom, lives in the right place in the source tree, and passes a minimal test. Output is a Pull Request marked as Draft.
- Phase C: Production polish. Concept checks, broader test coverage, documentation, and (when relevant) performance benchmarks. Output is a Pull Request marked as Ready for Review. This is what gets merged.

### Forging a New Shiny Thing

And of course, because bringing in new features is an essential part of library maintenance, I have used the Boost.Graph 2026 workshop output (part of Joaquin's proposal) to implement a C++14 proof of concept for a unified semantics of graph property map manipulation based on operator overloading. It may be part of the next release if it is proven to avoid the pitfalls of named parameters (this feature began as syntactic sugar and ended up as one of the most costly and confusing features, and is planned for deprecation).

### Side Quests in Loath-lorien

I also had the pleasure to manage Boost.Int128's review for Matt Borland (Accepted!) and to review his Boost.Decimal paper in the Journal of Open Source Software (Accepted!).

