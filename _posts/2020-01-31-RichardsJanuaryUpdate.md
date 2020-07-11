---
layout: post
nav-class: dark
categories: richard
title: Richard's January Update
author-id: richard
---

# History

This is my first entry on the C++ Alliance web site. I'm very happy to say that I was invited to join the organisation
at the end of December last year.

I first met Vinnie on Slack when I chose to use [Boost.Beast](https://github.com/boostorg/beast) in a
greenfield project - a highly scalable market data distribution system and quoting gateway for the Japanese
cryptocurrency exchange [liquid.com](http://liquid.com).

There were a number of candidates for C++ HTTP frameworks and it is interesting for me to examine the decision-making
process I went through in choosing one.

If I am honest, there are two main factors that influenced me towards Boost.Beast:

1. I am a long-time fanboi of [Boost.Asio](https://github.com/boostorg/asio). I find it's paradigm very pleasing.
Once you decipher the (extremely terse!) documentation it becomes obvious that it was written by a hyper-intelligent
extraterrestrial masquerading as a human being.

2. I have used the [Boost Library](https://www.boost.org/) (or more correctly, libraries) for many years.
Boost has become synonymous with trust, quality and dependability. As far as I have always been concerned,
boost is *the* standard. The standard library has always been a pale shadow of it.

When I started the new project there was an expectation that I would have a team to work with. In the end, I found
myself writing the entire system alone from scratch.

Liquid Tap contains two fully-featured web servers (one facing the organisation and one facing the outside world),
supports inbound and outbound websocket connectivity (with per-fqdn keepalive connection pooling) and multi-threaded
operation. The project took me 3 months from writing the first line of code to full production readiness.

I was personally impressed by the speed with which I was able to assimilate a new library and create a fairly complex
service infrastructure using nothing more than boost, nlohmann_json, openssl and a c++17 compiler. In my view
this would not have been possible without the excellent documentation and careful attention to detail in Boost.Beast.

During the development, I reached out to Vinnie and Damian on Slack a number of times. Both were always helpful
and attentive. Without a doubt they were instrumental in the success of my project.

So here I am in January 2020. Just like the old TV advert where Victor Kayam was so impressed with his electric
shaver that, "I bought the company".

I was so impressed with Boost.Beast and its creators that when given the chance, I chose to join the company.

# First Month

I have spent my first month with the firm going through Vinnie's Boot Camp. It's been an interesting and invigorating
experience.

I have many years of experience writing code for production environments, from embedded systems like slot machines
and video games to defence to banking and trading systems. I'm fairly confident that if you can describe it, I can
write it.

But maintaining a publicly-facing library is a new and very different challenge.

## Controlling the Maintenance Burden

C++ is a language in which types are cheap. So cheap in fact that many people (including me) recommend describing any
concept in a program as its own type. This is a great way to cause logic errors to fail to compile, rather than fail
to impress your customers.

But in a library such as Boost.Beast, every public type you create is a type you must document and maintain. If you
discover that your type has a design flaw, you're a little stuck. Any future changes need to be source-compatible
with previous versions of the library. Dangerous or incorrect elements in the design must be deprecated gracefully.
All this requires careful management.

Management takes time.

Something I learned from Vinnie very quickly is that for this reason, interfaces to public objects should provide
the bare minimum functionality that users can demonstrate a need for. Adding a new public method or class should only
happen after careful consideration of the consequences.

## Supporting all Toolchains

Another consideration I have never had to encounter before is that Boost.Beast is designed to work on every compiler
that "robustly supports" C++11.

In my career as a software engineer I have always demanded (and mostly had) autonomy over the choice of toolset. Of
course I have always chosen the very latest versions of gcc, clang and msvc and used the very latest standard of
c++ available. Why wouldn't I? It improves productivity, and who wants to be stuck in the Dark Ages when all your
friends are using the new cool stuff?

I wrote Liquid Tap in C++17. If C++2a had been more advanced and supported by all compilers at the time I'd have used
that, because compiler-supported coroutines would have shortened the code and made debugging and reasoning about
sequencing a whole lot easier.

Now I find myself thinking about how to support the latest features of the language, while ensuring that the library
will continue to function for the many C++11 and 14 users who have not been as fortunate as me and are still
constrained by company policy, or indeed are simply happy not to have to learn the new features available in more
recent standards.

## Attention to Detail

Boost.Beast strives for 100% (or as close to it as possble) coverage in testing. This is only logical. Users are not
going to be happy if they have to continually decipher bugs in their programs caused by us, file bug reports and
either patch their Boost source or wait up to three months for another release.

In addition, documentation matters. You know how it is in a production system. More effort is spent on content and
utility than documentation. Developers are often expected to read the code or ask someone if there's something they
don't understand. Not so when maintaining a library for public consumption.

One of the reasons I chose Boost.Beast was the quality, completeness and accuracy of its documentation. This is no
accident. Vinnie and his team have put a lot of time into it. Only now am I becoming aware of what an Herculean
task this is.

Users will hold you to your word, so your word had better be the _Truth, the Whole Truth and Nothing But the Truth_.

# Activities

## Issue Maintenance

This month I have been working through some of the Issue backlog in Boost.Beast. It's satisfying to see PRs getting
accepted and the list of open issues being whittled away. At the moment it's interesting to see new issues and
queries being raised too. I'll revisit this in next month's blog and report as to whether it's still interesting
then :)

I have also been taking time to liaise with users of the library when they raise queries via the
[Issue Tracker](https://github.com/boostorg/beast/issues), email or the
[Slack Channel](https://cpplang.slack.com/archives/CD7BDP8AX). I think staying in touch with the users is an excellent
way to get feedback on the quality of documentation and design. It's also nice to be able to help people. Not something
you get time to do very often when working on an FX-options desk in an investment bank.

## Boost.Json

I have been providing some support to the upcoming [Boost.JSON](https://github.com/vinniefalco/json) library.
This library focusses on:
* Absolute correctness in reference to [RFC8259](https://datatracker.ietf.org/doc/rfc8259/).
* Seeking to match or exceed the performance of other c++ JSON libraries such as [RapidJSON](https://rapidjson.org/).
* Providing a clean, unsurprising programming interface and impeccable documentation.

This is a fascinating project for me. Various JSON libraries employ various tricks for improving performance.
Performance can be gained at the expense of rigorous syntax checking, use of buffers and so on. Achieving the Holy
Grail of full correctness, minimal state and absolute performance will be an interesting challenge.

## Boost.URL

Vinnie is also working on [Boost.URL](https://github.com/vinniefalco/url). While I have not contributed any code,
spending my time in the `#beast` Slack channel has meant that I've been able to keep up to speed with the various
design choices being made. Again, there has been much to learn about a design rationale that focuses heavily on
the potential maintenance burden.

There is actually a lot that could be learned by developers in industry from taking part in or observing this
discourse.

# Work Schedule

The C++ Alliance is based on the West Coast of the USA, while I live and work in the tiny Principality of
[Andorra](https://en.wikipedia.org/wiki/Andorra) in mainland Europe. This puts me some nine hours ahead of my
colleagues across the Pond.

It turns out that this is a perfect way of working for me. I can get up at 8am, nip out for a couple of hours skiing or
hiking, enjoy lunch and then get to work - before anyone else in the firm is even awake.

I'm a bit of a night-owl anyway, so working later in order to engage in "lively debate" with my colleagues on Slack
is no problem. It also means I have a legitmate excuse to get out of any social engagments I don't want to be bothered
with.

So for me it's all win.

# Summary

I've really enjoyed my first month. I think Vinnie worries that he'll nag me too much about seemingly unimportant
details like commit message wording and achieving a certain tone in code documentation, but I don't mind it.

Boost.Beast is a fantastic piece of work. It's Vinnie's baby, and I am privileged to be asked to hold it in my
hands.

I'm never going to take issue with a mother looking to protect her cubs.

Furthermore, having a legitimate excuse to interact with the other maintainers of Boost on Slack is a pleasure.
These people are some of the brightest minds on the planet. I live in hope that some of this brilliance will
rub off.

If you work with C++, I highly recommend that you join the [Cpplang](http://slack.cpp.al) Slack channel.

If you'd like to contact me to discuss my experiences I'd be happy to receive a message on Slack.

Thanks for reading.

Richard Hodges
