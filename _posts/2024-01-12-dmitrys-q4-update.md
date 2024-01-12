---
layout: post
nav-class: dark
categories: dmitry
title: Dmitry's Q4 2023 Update
author-id: dmitry
author-name: Dmitry Arkhipov
---

In the fourth quarter of 2023 the functionality for direct parsing in JSON was
finalised and the code was merged into the mainline and then released in
Boost 1.84.0. Thus, I've moved to the natural opposite of direct parsing:
direct serialisation. Boost.JSON's serialisation is less customisable then
parsing, since the demand for custom serialisation is significantly lower. As
a result, the design of the serialiser is quite different from that of the
parser, and hence a different approach had to be taken to implement direct
serialisation. That approach, in my opinion, has a big benefit for the user:
there's no need for a dedicated direct serializer type, it can be done with
the regular `boost::json::serializer`. On the other hand, it presents a
different challenge: making changes to `serializer` in a way that does not
negatively affect its performance too much.

This fight for performance has occupied most of my time in the last quarter.
And it also provided me an opportunity to experiment with different potential
optimisations to the serializer. I would also like to comment that different
C++ implementations sometimes have directly opposite view on what's better or
worse for performance, which poses quite a conundrum in such line of work. And
finally, this work was greatly influenced by the availability of continous
integration infrastructure set up by the C++ Alliance, and automatic
benchmarking in particular.

Another positive effect of C++ Alliance's CI is due to coverage reporting.
As I was striving to never decrease the rate of code coverage, I've discovered
code in the serializer that used to perform a function, but have since become
unnecessary due to refactoring.

Overall the work on serializer has vastly increased my understanding on how
JSON's serializer works under the hood. I plan to finish the feature of direct
serialization before the next Boost release.
