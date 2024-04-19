---
layout: post
nav-class: dark
categories: christian
title: Christian's Q1 2024 Update
author-id: christian
author-name: Christian Mazakas
---

In the past few months, I've been busy getting up to speed on the slate of proposed-for-Boost libraries:
Boost.Buffers and Boost.Http.Proto.

The first real task was getting the CI setup for that and we chose to use an in-house solution. I was never really an
expert in GitHub Actions nor CI so there was a definite learning curve in how to debug CI issues and what's an effective
use of time versus not.

But more importantly I was able to discern what was and what wasn't important to automate in the CI pipeline. The actual
actions you can define in GHA are incredibly powerful and as someone who's well-versed in JavaScript, I find them quite
nice and easy to use.

The in-house tools we use are called cpp-actions, available [here](https://github.com/alandefreitas/cpp-actions) if
one is interested or wants to try them out. I'd say they're all good except for the one that generates the actual
build matrix. This is something I learned via trial by fire.

This gist of actions is that they're essentially functions with inputs and outputs. An action that generates your inputs
for you such as compiler and compiler flags inverts the benefits and turns actions into a burden instead of a boon. This
is because not every project will aim to support the same compilers and the same flags. Some entries of the build matrix
will have even more special requirements than others so being able to edit the matrix and add flags or other configuration
options becomes paramount.

The action can attempt to accomodate these use-cases but the resulting syntax is likely to be poor and more trouble than
it's worth. I noted a stark improvement in my CI experience once I was fully in control of the inputs and simply treated
actions like an opaque functional pipeline. The ability to just add a new field to a matrix entry was a huge convenience
in comparison to the process it took to update the matrix-building action which requires updating a separate repo and then
a SHA in the repo actually being tested.

But CI is worth it. We introduce all this complexity in our development pipelines because taking some C++ and compiling
it on as many platforms as we can is the best way to root out undefined behavior and other bugs. I found GitHub Actions
to be an enjoyable experience but there's caveats. Most Boost libraries use ad hoc CI configuration so I laud the work
that's been done to abstract all this. The wisdom here is that not all forms of automation are free and there's
different requirements and costs to be considered. Sometimes, rote copy-paste with inline editing just wins out and it's
only through experience that we get a sense of when this is the case.

As for buffer operations and HTTP, they're still being actively developed and worked on. Good progress has been made on
that front. The container types and serialization routines have received a lot of love and are that much closer to being
fully production-ready. CI took a long time to understand and setup so the next quarter will be more focused on actual
C++ and the pedantry of HTTP RFCs.
