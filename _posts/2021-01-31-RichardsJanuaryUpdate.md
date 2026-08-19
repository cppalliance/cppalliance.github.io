---
layout: post
nav-class: dark
categories: richard
title: Richard's January Update
author-id: richard
---

# A year in the C++ Alliance

January marks one year since I joined the C++ Alliance and started maintaining the Boost.Beast library.

It's a pleasure to work with interesting and fun people who are passionate about writing C++, and in particular good 
C++.

During the past year I have spent some time attending ISO WG21 meetings online as an alternate representative of the 
C++ Alliance. Prior to joining the organisation, during my life as a developer I always felt that the standards 
committee did the developer community a disservice. Without knowing much about the inner workings, it seemed to me that 
the committee lived in an Ivory Tower. So my intention was to see if there was a way to bring something useful to the table 
as a keen a prolific writer of C++ in the financial sector. In particular I had a personal interest in the 
standardisation of asynchronous networking, forked from the wonderful Asio library.

I ended the year feeling no less jaded with the entire standards process, concluding that there is not much I can do to 
help. 

I feel it's important to say that the committee is attended by very bright, passionate people who clearly enjoy the C++
language as much as I do. 

What I think does not work, at least from the point of view of delivering useful progress, is the process of committee 
itself. During my commercial life there has been one fundamental truth, which is that things go well when there is focus
of attention and the taking of personal responsibility. It seems to me that committees in general undermine these
important fundamentals. The upshot of this is that in my mind, C++ developers are not going to get the tools they need, 
in the timescales they need, if they wait for the slow grind of WG21's wheels of stone.

It is to me noteworthy that many of the libraries I actually use (fmt, spdlog, boost, jwt, openssl, and so on) have been 
in some way standardised or are in the process of being standardised, but always in a lesser form than the original, 
created by a small, passionate team of individuals who enjoyed autonomy and freedom of design.

Even now, if a feature is available in the standard and as a 3rd party library, I will almost always choose the third 
party version. It will generally have more features and a design undamaged by a process that externalises costs.

Which brings me back to my old C++ mantra, proven true for me over the past 15 years or so, *Boost is the 
Standard*. Having said this, I must in fairness mention the wonderful fmtlib and spdlog libraries, and the gargantuan
Qt, without which a back-end developer like me would never be able to get anything to display on a screen in a cross-
platform manner.

In the end I find myself in the same place I was a year ago: My view is that the only thing C++ needs is a credible 
dependency management tool. Given that, the developer community will produce and distribute all needed libraries, and 
the most popular will naturally become the standard ones.

# The Year Ahead

Therefore, it is my intention this year to do what I can to bring more utility to the Boost ecosystem, where one 
person can make a useful impact on the lives of developers, and taking personal responsibility for libraries is the 
norm.

## The Big Three

It is my view that there are a number of areas where common use cases have not been well served in Boost. These are of 
course JSON, Databases and HTTP clients.

### JSON

At the end of 2020, Vinnie and the team finally brought a very credible JSON library to Boost, which I have used to
write some cryptocurrency exchange connectors. On the whole, it's proven to be a very pleasant and 
intuitive API. In particular the methods to simultaneously query the presence of a value and return a pointer on success
with `if_contains`, `if_string` etc. have seen a lot of use and result in code that is readable and neat.

Currently, Boost.JSON favours performance over accuracy with respect to parsing floating point numbers (sometimes a 
number is 1 ULP different to that which you'd expect from `std::strtod`). I had a little look to see if there was 
a way to address this easily. It transpired not. Parsing decimal representations of floating point numbers into a binary
representation that will round-trip correctly is a hard problem, and beyond my level of mathematical skill. 
There is currently work underway to address this in the JSON repo.

There is also work in progress to provide JSON-pointer lookups. This will be a welcome addition as it will mean I can
throw away my jury-rigged "path" code and use something robust.

### MySQL

A very common database in use in the web world is of course MySQL. I have always found the official connectors somewhat
uninteresting, particularly as there is no asynchronous connector compatible with Asio.

That was until a certain Rubén Pérez decided to write an asio-compatible mysql connector from scratch, using 
none of the code in the Oracle connector. Rubén has started the arduous journey of getting his 
[library](https://anarthal.github.io/boost-mysql/index.html) ready for Boost review.

I have been asked to be the review manager for this work, something I am happy to do as, whether or not the admission is
ultimately accepted, I think the general principle of producing simple, self-contained libraries that meet a 
common requirement is to be encouraged.

If this library is successful, I would hope that others will rise to the challenge and provide native connectors for
other common database systems.

### HTTP Client

I mentioned in an earlier blog that an HTTP Client with a similar interface to Python's Requests library woudl be worked 
on. As it happens, other priorities took over last year. This year I will be focussing efforts on getting this library 
in shape for a proof of concept.

### I mean Big Four

Redis is ubiquitous in server environments. A quick search for Redis C++ clients turned up this 
[little gem](https://github.com/basiliscos/cpp-bredis). I'd like to find time to give this a try at some point.

