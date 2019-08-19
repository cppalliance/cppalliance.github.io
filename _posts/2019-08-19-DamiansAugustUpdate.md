---
layout: post
nav-class: dark
categories: company, damian
title: Damian's July Update
---

# Boost.Beast

I've started working on improvements to the zlib part of Beast. There are some gaps
in the test harness of these components, so I've decided to increase coverage.
As a first step, I started porting test cases from the original zlib library's tests,
to verify that existing code matches the expected behavior of the original library.
Fortunately, I've not found any significant discrepancies, there's only one issue
where Beast rejects malformed input for the wrong reason (I'm still looking into it
whether it's actually an issue at the time of writing this).

I've also looked into providing more meaningful feedback from test failures in Beast,
especially when they're run in CI. While the current test framework does print
a line number on failure, the line number is often in a function template that's called
by multiple test cases, which makes it quite hard to determine which test failed
just from the log, often requiring the use of a debugger. Doing that locally
may not be a problem, but it's significantly harder in CI, so I've decided to
try to use Boost Stacktrace to provide a callstack on each failure in Beast tests.
Additionally, I've also worked on running the test suite without OpenSSL installed,
to hopefully fix some of the failures in the official Boost test matrix.

# The question of Networking TS and TLS

There's recently been quite a bit of discussion of networking being useless
without "secure by default" sockets. Since this is a recurring topic and I expect it to return in the future,
so I've decided to write up an analysis of this issue.

First of all, I believe that an attempt to deliver a "secure by default" socket
within the current networking proposal right now will result in something like
`std::async` - not really practically useful.

What kind of TLS facilities I'd consider useful for the average user of the standard library?
A reasonable guideline, I think, are ones I could trust to be used in a distributed
system that handles money (in any form).
Note, that TLS is not only a protocol that provides confidentiality (i.e. encryption),
but also allows verification of the identity either the server by the client, or both.
Remember, doesn't matter if 3rd parties can't see what you're sending,
if you're sending your data to the wrong peer in the first place!

While it may seem simple at first look, just verifying the identity of a peer
is an extremely complex process, as my experience with Certify has shown.
Doing it portably and efficiently with the same interface and effects is extremely difficult.
Browsers resort to all kinds of workarounds and custom solutions to be able
to securely implement just this one aspect of TLS. I attempted to implement
a library (intended for inclusion into Boost) that would perform this one aspect,
however, I found it to be impossible to provide a practical solution with
the current state of the networking ecosystem in Boost. In fact, one method
of certificate verification (via the OCSP protocol) requires a (very) basic
HTTP client. Yes, in order to perform a TLS handshake and verify the peer's
certificate status using OCSP, you need an HTTP client.

This is just one aspect of the TLS protocol that needs to be addressed.
There are others as well - what about the basic cryptographic building blocks,
like ciphers, hashing algorithms, PRFs and so on - they are bound to be used
in a hypothetical implementation in a standard library, should they be exposed? If yes then with what interface?.
Considering that there are no standard networking facilities and not even a proposal for standard TLS,
this is a discussion that would essentially postpone standard networking indefinitely.

Finally, there's also an opposite position that no networking should be
in the standard at all. I disagree with this position - networking has become a very important
part of many C++ projects (in my career, all C++ projects I dealt with, touched
some sort of network in one way or another).
At the very least we need standard named requirements for library compatibility, since that is
severely lacking in the ecosystem at this point.
