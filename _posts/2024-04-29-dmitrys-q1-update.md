---
layout: post
nav-class: dark
categories: dmitry
title: Dmitry's Q1 2024 Update
author-id: dmitry
author-name: Dmitry Arkhipov
---

In the first quarter of 2024 I mostly continued with work on direct
serialization, cleanup work in Boost.JSON, and experiments with its JSON parser
and serialiser. The experiments have resulted in discovery of a significant
performance pessimization in the parser. The fix will soon be merged into the
project.

Another experiment that will eventually bring significant performance
improvement is replacing JSON's number serialisation code with usage of
the Charconv library, which was recently accepted into Boost. That library has
functions for efficient parsing and serialisation of numbers, but Boost.JSON
can't use the parsing code for its default number parsing mode due to several
requirements, the main one being streaming parsing. The precise number parsing
mode, on the other hand, is already using an earlier embedded version of
Charconv. The addition of dependency on Charconv has been delayed, though, due
to it not supporting a few old compilers which are supported by JSON. This
summer a major user of those compilers (an old Red Hat version) goes EOL, and I
decided to wait until that point to deprecate support for those compilers.

One small but important change was replacing internal configuration for
endianness and instead relying on Boost.Endian for that. The original reason
Boost.JSON had such internal configuration to begin with was the standalone
mode, which was removed a while ago. But other changes were of higher priority
and thus, I only got around to this now.

One interesting JSON issue fixed was related to conversion of
`filesystem::path` objects (https://github.com/boostorg/json/issues/975). Due
to unfortunate decisions made many years ago a `path` is a sequence of itself.
Treating paths as sequences thus results in infinite recursion. The fix added
dedicated handling for paths and just in case forbade recursive sequences
altogether.
