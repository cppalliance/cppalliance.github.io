---
layout: post
nav-class: dark
categories: christian
title: Unordered's New Look
author-id: christian
author-name: Christian Mazakas
---

## Boost.Unordered

When I'm not busy eternally grinding on implementing hashing algorithms, I'll sometimes take a moment and help other Boost libraries.
I enjoy being a kind of soldier of Boost. Deploy me to any library in the project and I'll dive in and get results. This is actually
how my involvement with Regex started and I've done this a couple of other times to fix some bugs in both Serialization and Optional.

This time around, it was a library I've worked on previously: Unordered. Because hash tables are such an important data structure and
because Boost has the currently-reigning implementation, the library matters a lot. As important as the code is, the documentation for it
matters just as much and for the longest of times Unordered has had terrible documentation.

In its earliest forms, the Unordered docs were a PHP template file that was dynamically templated based on the container. I came in and
chose a more brutish approach, just creating hard-coded files where everything was manually transliterated to [AsciiDoc](https://docs.asciidoctor.org/asciidoc/latest/).
From here, the HTML was generated as a single-page using the [Asciidoctor](https://asciidoctor.org/) tool.

Many Boost libraries have started using this and if you ever open a library's docs and you see it as a single page with a table-of-contents on
the left, it's a safe bet that the page is an asciidoctor product.

The problem though is that this doesn't really scale well as your documentation grows. In the case of Unordered, we were by far the worst offendors here.
We had full reference docs for all the containers along with all the sets of images showing the benchmarking results. This meant that page load was impressively
long and even worse, the docs were a nightmare to navigate. Trying to search the page for something like `emplace` would yield several unrelated results and would
bounce you around the page randomly.

Luckily, the Asciidoctor developers seem to recognize the limitations of their tooling but still recognize the tremendous value AsciiDoc has as a markup language.
AsciiDoc is basically just a more powerful version of markdown, something most developers enjoy and know well. Antora fixes the previous problems with Asciidoctor
and can output its HTML as a series of disparate files. This now means that Unordered's docs are officially multi-page and that they're actually useful and readable now.

The change wasn't entirely straight-forward and there were some difficulties in setting it all up. Nothing that couldn't be overcome, however.

Hopefully Antora becomes more of a standard default in the Boost developer's toolchain. Asciidoctor has served us well for a little while but it's clear that Antora is
an eventuality all library docs will eventually gravitate towards.

### The Future of Boost's Tools

Far and away the most difficult aspect in dealing with Antora was actually getting it to work reliably with b2, Boost's home-grown build tool. b2 is fantastic at silently
just not doing things. What's even worse, building Boost docs for a release is something that's not readily done with a simple command or two after an `apt install`.
Instead, it essentially _requires_ a Docker container which holds the plethora of tools required to build the docs.

b2 will typically only run something if it's been defined as a target it can understand but this is seldom as straight-forward as something like `add_custom_target()`
or `add_custom_command()`. This ultimately proved not to be a blocker for the documentation updates because I received some fantastic help from a colleague but at the same
time it made me concerned because genuinely, only one person in the entire Boost project really understands. Or at least, that's my perception of the situation after I asked
for code review from other Boosters. The purpose of the Jamfile was to simply ensure that b2 understood certain builds artifcacts _needed_ to be generated when `b2 doc` gets run.

When Boost started, CMake didn't technically exist. It came out a couple of years after and what's more, it would've been incredibly immature and unusable for the project. But now
in 2025, things are quite different. We live in a world where now no one outside Boost really seems to use b2 or write Jamfiles anymore. Most developers aren't exactly CMake experts
either but it's possible to actually google CMake issues and find dedicated forums and outside experts.

Not using this as a soap box to simply rant about a build tool but the whole experience did make me reflect on the future of the project. What if my colleague wasn't there to help me out?
I maybe could've worked with the release managers to update the requisite scripts for Unordered but it would've been a divergent path from the other libraries, which is almost always a net
negative. What if the Alliance wasn't there to fund paid staff engineers to sit there and sift through a now-niche build system with relatively bare docs?

Packagers themselves have migrated to relying on Boost's CMake support. vcpkg builds Boost libraries using the CMake workflow and CMake itself has obsoleted their FindBoost.cmake in favor
of the BoostConfig.cmake that gets generated by both `b2 install` and the CMake workflow.

Projects live and die by their communities. On a technical level, I really don't think CMake is much better than b2. The syntax in CMake is somehow better and things are a lot less runic as well.
Jamfiles are very good at looking like an arcane incantation. But when it comes down to it, b2 has way more flexibility and power for what Boost needs which is to be able to build tests with
multiple compilers and multiple standards and flags with a single invocation. The real problem is the lack of robust documentation and things like StackOverflow answers. There's no dedicated slack
channel like #cmake on the C++ slack (which everyone should join) for b2. Even if there, it'd be the only two people in the project today answering any questions.

I think Boost is slowly approaching a fork in the road where it needs to get realistic about its future. Or maybe it doesn't matter. Maybe we'll just slap everything in a docker container and if we
need to gradually hack into the build scripts with custom exceptions and carveouts, so be it. It'll be interesting to see how right or wrong I am in the future. Luckily for most, I have a tendency
towards being wrong.

-- Christian
