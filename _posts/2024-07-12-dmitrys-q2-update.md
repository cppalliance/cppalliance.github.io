---
layout: post
nav-class: dark
categories: dmitry
title: Dmitry's Q2 2024 Update
author-id: dmitry
author-name: Dmitry Arkhipov
---

In the second quarter of 2024 implementing direct parsing for Boost.JSON has
finally been completed. Direct serialisation will support all the same types as
direct parsing, including recently-added `std::path`. After this addition,
Boost.JSON's set of conversion features is almost full. The only missing part
is the ability to use a sort of temporary proxy type for conversion. E.g.
converting from user type to `std::string`, then converting the string to JSON
string. This is not strictly needed for `value_to/from` set of functions, as
you can always fully customise their behaviour by extending them. But it can be
very useful for direct parsing, as it allows using an ancillary type that
matches the structure of the JSON, and can convert to/from the intended user
type.

A little more than a year ago it was argued in a Boost.JSON issue that
`object::if_contains` should return `optional<value&>` rather than `value*`.
I have experimented with that, but also went on to research whether there are
any projects on GitHub that would be broken due to such change. Turns out
there's a lot of such projects. Which is why I decided against that change. But
on the other hand, there are some benefits to having non-throwing accessors
that communicate their inability to produce a value in their return value. And
it's better to use a single kind of type for this. There is in fact an ideal
candidate for such return type: `boost::system::result`. And in fact Boost.URL
is using it in its return types extensively, eschewing the classic dual API
approach (where one overload throws, and another overload uses an `error_code&`
out parameter). If I could turn back time, I would have replaced the
out-parameter overloads with ones returning `boost::system::result`. But as
that would be way too significant API change now, I instead added those
accessors, giving them `try_` prefix (modelled after the already existing
`try_value_to`). As a tangentially-related change, I added a defaulted
`source_location` parameter to throwing accessor functions. This is a small
quality of life improvement, that (if supported by the compiler) stores the
location of the call site in the exception. The result is that the exception
stores both the line where the user calls a Boost.JSON function, and (inside
the `error_code`) the line where the error state was originally reached. This
information should greatly simplify investigating issues that occur when using
the library.

A significant amount of time these past few months was occupied by a somewhat
new project: Python-based reimplementation of
[Docca](https://github.com/boostorg/docca). Docca is a set of XSLT stylesheets
that converts [Doxygen](https://www.doxygen.nl) XML output into an API
reference written in [Quickbook](https://github.com/boostorg/quickbook) markup
language. Unfortunately, XSLT is both rather obscure, and rather cryptic, which
results in difficulty fixing its bugs. As my frustrations piled up, I decided
to write a new tool that would essentially do the same job, but in a more
popular language, and designed for higher genericity. I chose Python for
implementation largely due to its [Jinja](https://palletsprojects.com/p/jinja/)
text template engine (another reason is Python's availability on virtually all
platforms).

The core of the design is operating in two steps: 1) collecting
data from Doxygen XML output, organising it in a usable way, and sometimes even
fixing Doxygen's warts and 2) generating output using Jinja. This kind of
model/view separation isn't just philosophically more pleasant, but also makes
the tool more generally useful. As previously mentioned Docca produces a
specific style of API reference written in Quickbook. But this new
implementation can use a different Jinja template to produce a different style
of API reference: e.g. using another approach to sectioning, or having all
overloads on one page a-la
[Cppreference](https://en.cppreference.com/w/cpp/container/vector/vector). It
can also produce output in an entirely different format, and I intend to take
advantage of that in order to switch Boost.JSON's documentation to Asciidoc. I
am also experimenting with running the tool an additional time to generate
"macros" that expand into links to documented entities and could be used in the
narrative documentation that precedes the reference.

On the opposite side of this two phase arrangement is the ability to add
alternative data collection algorithms. While currently Doxygen reigns supreme
in the field of collecting documentation comments from C++ sources, there is a
very ambitious project from the C++ Alliance called
[Mr. Docs](https://github.com/cppalliance/mrdocs). As soon as it reaches enough
maturity, a new data collector could be added to Docca.

And finally, I wanted to tell about some changes I've contributed to Boost's
build infrastructure, but I need to start from a far. The build system
officially supported by Boost is called [b2](https://www.bfgroup.xyz/b2/)
(formally known as Boost.Build). Unlike most modern build systems it doesn't
use the 2 step configure-build approach championed by Autotools, and instead
does the whole build by itself. As a result, it's a fully multi-config build
system, that is a single invocation of the build system can request targets
built with different values for particular property, resulting in building of
multiple variations of those targets. For example, you can request a target to
be built by different compilers, targeting different OSes and architectures,
using different C++ standards and dialects, and so on. b2 would calculate the
Cartesian product of all requested options, and create the resulting binaries
for each of the variations. For historical reasons, there was no good support
for this multi-config paradigm with installation. `install` targets explicitly
specified their intended installation location, which resulted in build errors
if a multi-config installation was attempted. The issue wasn't fundamental to
the build system, and Boost had employed a particular mitigation to that issue.
But I wasn't satisfied with the status quo, so a few years ago I added explicit
support for named installation directories to the `install` rule, with those
directories' configuration being a part of the build variation. After the
change a project could do something like

```
exe app : app.cpp ; # executable target app
install install : app : <location>(bindir) ; # install target install
```

And then with `b2 install-prefix=/usr/local` install `app` into
`/usr/local/bin`, and with `b2 install-prefix=/opt/myapp` install `app` into
`/opt/myapp/bin`. You could then go with a conditional property configuration,
where e.g. target OS `a` implies location 1, and OS `b` requires location 2,
and so on.

The feature did require changing build scripts, and so at the time Boost
remained with the set up it already had. But this spring, inspired by other
needs I finally got around to changing Boost.Install (an ancillary project used
by Boost's build scripts) to use this functionality. One thing led to another,
and now not only users can configure per-config installation directories, but
finally Boost has staging directory support via `staging-prefix`. E.g.
`b2 --prefix=/opt/Boost/ staging-prefix=/var/tmp/1` installs into `/var/tmp/1`,
but files are created with the intention to be later moved to `/opt/Boost/`.
