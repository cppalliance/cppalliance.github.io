---
layout: post
nav-class: dark
categories: christian
title: Christian's Q2 2024 Update
author-id: christian
author-name: Christian Mazakas
---

# Boost.Http.Proto

This last quarter I worked primarily in the http-proto library, this time extending
serialization to include chunking and zlib compression routines: deflate and gzip.

This is the first time I've ever used zlib so it was definitely a learning experience
but it's given me valuable insights into how other libraries of this nature work.

More importantly was reifying the application of such dynamic code with the existing
code which supports many possible permutations.

Serialization in http-proto enables users to consume output in myriad different ways
and the output itself can be framed and transformed as well. This forms a product
space, in all actuality, so it was quite a feat to unify the core logic. The secret
was operating in terms of distinct input and output buffer spaces, which could
sometimes alias.

# Boost.Compat

I also dedicated some time into working on Boost's Compat module, which is home
to several different kinds of polyfills of C++ constructs introduced in later
C++ standards.

This time I worked on `function_ref` and as far as I'm aware, I'm the first
implementor of such a facility. The class seems very simple on the surface. Just
a simple non-owning type-erased view of a Callable object but the devil is always
in the details.

`const` and `noexcept` each change the actual type of the function signature used
so again, I had to test another proudct space. The testing burden for many of these
components is quite high and while there are some, it'll be interesting to see if
anyone actually uses this facility and how well it fares.

Interestingly, `function_ref` actually has a form of currying with regards to member
access and objects. This doesn't seem well-known and actually came as a surprise to
me.

---

There's a lot more to look forward to later in the year and I'll be excited to
write the next update.

- Christian
