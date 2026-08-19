---
layout: post
nav-class: dark
categories: dmitry
title: Dmitry's January Update
author-id: dmitry
---

# Dmitry's January Update

In January 2021 I started working on improving Boost.JSON for The C++ Alliance.
The time during this first month was mostly spent on getting familiar with the
project, particularly with its list of issues on GitHub.

It turns out, half of the open issues are related to documentation. For
example, the section about conversions might need a rewrite, and related
entries in the reference need to provide more information. There should be more
examples for parsing customizations. There also needs to be a separate section
dedicated to library's named requirements. There was also a bug in coversion
customization logic that was fixed by me this month.

The next two large blocks are issues related to optimization opportunities and
dealing with floating point numbers (some issues are present in both groups).
The next group is issues related to build and continuous integration. A couple
of build bugs were fixed in January.

The final group consists of feature requests, mostly for convenient ways to
access items inside `json::value`. And this month I started implementing one
such feature -- Json.Pointer support. The work is still in the early stages,
though.
