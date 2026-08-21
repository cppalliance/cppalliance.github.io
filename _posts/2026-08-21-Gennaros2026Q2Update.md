---
layout: post
nav-class: dark
categories: gennaro
title: "Reflection All the Way Down"
author-id: gennaro
author-name: Gennaro Prota
---

MrDocs models everything it extracts (namespaces, records, functions, types, doc
comments, and so on) as a tree of C++ structs. Every one of those structs has to
be compared, serialized, and exposed to Handlebars templates as a DOM object.
Historically, each of those jobs meant another hand-written function or function
template per type, and each new field meant touching all of them. Miss one and
nothing breaks loudly; the field just quietly fails to appear in the output.
Much of what follows comes from attacking that problem at the root, and then
spending the room it freed up on letting users extend MrDocs without building
it.

## MrDocs.Describe

The starting point was issue
[#1149](https://github.com/cppalliance/mrdocs/issues/1149): Alan wondered
whether the `BOOST_DESCRIBE_xxx()` invocations we relied on were hurting compile
times for translation units that pulled in Reflection.hpp. The honest answer was
that compile times weren't actually a problem, but investigating it made clear
how much we were bending Boost.Describe and Boost.Mp11 to fit a job they were
never designed for, and how much implementation knowledge that bending required.

So [#1171](https://github.com/cppalliance/mrdocs/pull/1171) replaced them with
our own public reflection facilities, MrDocs.Describe. It is a large change, a
little over four hundred files, but the point of it was subtraction: with
metadata we control, the per-type boilerplate can be written once, generically,
instead of once per type. There are now something like a hundred and thirty
described types in the tree, a hundred and eleven of them in the metadata model
alone, so "once per type" was never going to scale.

The first dividend was [#1177](https://github.com/cppalliance/mrdocs/pull/1177).
Comparison operators for the metadata types had accumulated as a long tail of
near-identical overloads: compare the bases, then compare the members, in order,
for type after type. That is now a single generic `operator<=>()`, plus an
`operator==()` that delegates to it, in
Support/Reflection/CompareReflectedType.hpp. It walks the described bases first,
in description order, then the described members, short-circuiting as soon as it
finds an inequality. Almost every per-type overload went away, and it is no
longer possible to add a field to a metadata struct and forget to compare it.

The one wrinkle worth recording is that the constraint on those operators is
spelled as a `requires`-expression rather than the obvious trait, because MSVC
has a bug where a constrained `operator<=>()` in the same namespace breaks
constraint evaluation for an unrelated `merge()` template. Writing it as a
distinct atomic constraint works around it. Generic code is a fine thing right
up to the point where three compilers have to agree on it.

## Three ways to extend MrDocs without a compiler

The other half of the quarter went to extensibility, on a simple principle: a
user who wants a different output format, or a small transformation of the
corpus, should not have to build MrDocs to get it.

That arrived in three rungs, and the shape it finally took is joint work with
Alan. My first cut exposed a narrower, more rigid interface; the registration
API and the single context object that replaced it are his design, and they are
better than what I had. The discovery walk and the output sink are mine, and the
language bindings, the registry, and the script generator we wrote between us.

**Scripts** ([#1196](https://github.com/cppalliance/mrdocs/pull/1196)). Lua
joins JavaScript as a first-class language for Handlebars helpers, and both can
now host extensions proper. Any .lua or .js file directly under an addon's
extensions/ directory is an extension; the discovery walk sorts by full path,
interleaving the two languages, so behaviour depends only on file names and
never on which language you happened to pick.

Running a script's top level registers things rather than doing them:
`mrdocs.register_transform(id, fn)` for a corpus transform,
`mrdocs.register_generator(id, fn)` for an output generator, any number of each
per file. Nothing is applied at load time: the host collects the registrations
and invokes them later. Each one is called with a single context object carrying
`ctx.corpus`, `ctx.config`, and `ctx.params` (that last being the script's own
options block from `transform-options.<id>`), so new extension kinds can be
added later without changing the signature. A transform mutates the corpus in
place; reads go through the same DOM the generators already see, so scripts and
templates have one shape to learn rather than two.

The reflection work pays for itself a second time here. Rather than a
hand-maintained binding table that would drift from the C++ model the moment
anyone added a type, the bridge is driven by the metadata: a
`MRDOCS_DESCRIBE_KINDS` macro registers the closed set of concrete derived
classes of a polymorphic base, and each per-base list is `#include`d straight
from the existing \*Nodes.inc X-macro files. One source of truth for what kinds
exist, shared by the visitors and the script bindings.

**Data-driven generators**
([#1197](https://github.com/cppalliance/mrdocs/pull/1197)). Any directory under
an addon's generator/ directory, named after the generator it defines, is now
discovered at config-resolve time and installed as a generator, described by a
mrdocs-generator.yml alongside its templates. The manifest is small on purpose,
just two keys: an `escape` table of per-character replacements, and an `extends`
key that inherits another generator's templates so a new format only has to
state its differences. The directory name does the rest, serving as the
generator's id, its file extension, and its display name. The Markdown example's
manifest is eight lines of YAML: `extends: html`, plus the six characters
Markdown needs backslash-escaped. The LaTeX one then extends the Markdown one,
so the key chains: `tex` inherits from `md`, which inherits from `html`, and
each link states only what it changes.

Making that work meant making the generator subsystem data-driven, and the
built-in generators are what shows it: `AdocGenerator` and `HTMLGenerator` are
now about forty lines each, a constructor and an `escape()` override over a
shared `HandlebarsGenerator`. Three data-driven examples ship in the tree
(`jsonl`, `md`, and `tex`), none of which needs a line of C++ to work.

**Script-driven generators**
([#1218](https://github.com/cppalliance/mrdocs/pull/1218)). The third rung hands
the whole emit loop to a registered script function, which owns every decision
about what files to write. Because it owns the loop, it can produce output
shapes the per-page generators structurally cannot, such as a single artifact
aggregated over every symbol, and the two shipped examples are exactly that: a
whole-corpus `json` dump and a `search-index`.

Two details I liked building. First, the host has no idea which language it is
running: a script generator is a `dom::Function` that self-owns its scripting
VM, so one implementation drives a Lua generator and a JavaScript one without
branching. Second, the file-writing API, bound into the script as
`output.write`, resolves every path under the output directory and rejects
anything absolute or escaping, so a generator cannot write anywhere on disk; and
it takes an `append` flag, so a script assembling something large can stream it
in chunks instead of holding the whole artifact in memory.

## Macros

[#1192](https://github.com/cppalliance/mrdocs/pull/1192) taught MrDocs about the
preprocessor. A `clang::PPCallbacks` subclass records each `MacroDefined` event,
skipping builtins and system headers, and the visitor turns what survives into a
`MacroSymbol`. Include guards are dropped by asking Clang
(`MacroInfo::isUsedForHeaderGuard()`) rather than by pattern-matching names,
because nobody wants a reference page for `MY_LIBRARY_DETAIL_FOO_HPP`. Variadic
macros get their synthetic trailing `__VA_ARGS__` parameter removed and a flag
set instead, mirroring how a function symbol handles a C-style `...`.

Macros needed their own filters rather than reusing the symbol ones, and the
reason is a nice illustration of how little a macro resembles a C++ symbol.
Macro names are unqualified, so a namespace-scoped `include-symbols` pattern can
never match one; hence `include-macros` and `exclude-macros`. Whether an
undocumented macro is kept is its own question too, so `extract-all-macros` sits
beside `extract-all` and defaults to off. And the `implementation-defined` and
`see-below` modes have no macro equivalent at all: both keep a symbol in the
corpus while hiding its scope or eliding its synopsis, and a macro has no
members to hide and, since the preprocessor runs before anything else is
extracted, never appears in another symbol's synopsis anyway. A macro is only
ever included or excluded.

The last piece is about a special case: a feature-test or configuration macro is
often not defined in the build MrDocs runs against, so the preprocessor never
reports it at all. For such macros, the always-defined `__MRDOCS__` can guard a
definition (with a doc-comment) that only affects MrDocs.

## Bumping LLVM, and why it mattered here

Which brings me to what looks like the most routine item of the quarter.
[#1241](https://github.com/cppalliance/mrdocs/pull/1241) moved the LLVM pin to
`77e43ec1`, and it is in this article because of one upstream change it picks
up:
[llvm/llvm-project#198452](https://github.com/llvm/llvm-project/pull/198452),
which attaches documentation comments to macro definitions. Until then, the
macro support above had no way to ask Clang for a macro's doc comment, so #1192
was scanning the source text for it. With the new pin the comment comes from
Clang, through a `getRawCommentForAnyRedecl()` overload that accepts a
`MacroInfo`, and a pile of ad-hoc text handling goes away.

The pin had drifted about six months, so collecting that one feature meant
paying six months of API churn at once: USRGeneration.h moved namespaces,
`DiagnosticConsumer::finish()` was removed, the driver option table moved,
`cl::getRegisteredOptions()` started returning a `DenseMap`, and the
per-declaration comment lookup we rely on was renamed from
`getRawCommentForDeclNoCache()` to `getRawCommentNoCache()`. Parsing the newer
libc++ also wanted a vcruntime\_new.h stub and guards to stop stdbool.h,
stdalign.h, and threads.h from redefining `bool`, `alignas`, and `thread_local`,
which are keywords rather than macros in C++. The regenerated goldens changed
only where Clang's own output had drifted.

The moral, which I'll be repeating to myself next time: a toolchain pin is
cheapest to move when you don't need anything from moving it.

## Specializations move in with their primary

Class template specializations, function template specializations, and deduction
guides used to share the enclosing scope's listing with their primary template,
so `A` and `A<int>` appeared side by side in the namespace index, reading like
independent siblings, while the primary's own page said nothing about its
variants. Users reported this repeatedly.

[#1199](https://github.com/cppalliance/mrdocs/pull/1199) moves them: each
primary's page gains a "Specializations" section, each deduced class's page
gains a "Deduction Guides" section, and the parent scope lists only the primary.
An orphan specialization (one whose primary was excluded from extraction) stays
in the parent's listing so the index can still reach it. The primary-to-variant
link is corpus-resident: records and functions carry `Specializations` lists,
records carry `DeductionGuides`, and an `IsListedOnPrimary` flag decides
suppression, all populated by a new `SpecializationFinalizer` pass. Because
those fields are described like everything else, every template and every
downstream consumer of the corpus sees the new shape automatically. That is the
infrastructure work paying rent.

## Field reports

The rest of the quarter was the ordinary, indispensable business of fixing what
users hit.

A partial specialization on an array type rendered as `array_trait<T [,void,
void>]`, because dependent array bounds were being dropped
([#1172](https://github.com/cppalliance/mrdocs/issues/1172)). `task<>` rendered
as `task`, losing the empty argument list that distinguishes a specialization
from its primary ([#1184](https://github.com/cppalliance/mrdocs/issues/1184)).
Inline markup (`<em>`, `<mark>`, `<sub>`, `<sup>`, `<del>`) produced no HTML
tags at all, because a single shared partial conflated five semantically
distinct kinds and the HTML side of it didn't exist; each kind now has its own
partial and its own element
([#1185](https://github.com/cppalliance/mrdocs/issues/1185)). A `@par` block
with no prose before it rendered upside down
([#1162](https://github.com/cppalliance/mrdocs/issues/1162)). An HTML table in a
doc comment produced a warning and then a fatal error
([#1146](https://github.com/cppalliance/mrdocs/issues/1146)). Inherited members
went missing from derived classes when the base was a dependent specialization
([#1176](https://github.com/cppalliance/mrdocs/issues/1176)). Setting
`extract-all: false` crashed outright
([#1195](https://github.com/cppalliance/mrdocs/issues/1195)), and an assertion
failure took down extraction on an Antora test project
([#1145](https://github.com/cppalliance/mrdocs/issues/1145)). Every source link
in every Synopsis section pointed at `#Lundefined`, because the template asked
for `dcl.line` where the DOM field is `dcl.lineNumber`
([#1182](https://github.com/cppalliance/mrdocs/pull/1182)). A one-word fix, and
a reminder that a template author programming against the object model has no
compiler to catch a misspelled field.

Long `noexcept` conditions used to be dumped into the declaration, where they
were unreadable. They now collapse to `noexcept(/* see-below */)` with the
condition moved into its own section, past a per-generator
`noexcept-see-below-limit`
([#1103](https://github.com/cppalliance/mrdocs/issues/1103)). And mp-units
surfaced a lovely one
([#1238](https://github.com/cppalliance/mrdocs/issues/1238)):
default-constructed variables were shown with an initializer that doesn't exist
in the source, so the synopsis cheerfully claimed `inline constexpr one one =
one;`.

I take this list as a good sign. Bugs like these arrive because people are
pointing MrDocs at real libraries (Boost.Multi, mp-units, Boost.OpenMethod,
Corosio), and real libraries are where a documentation tool finds out what it
doesn't yet handle.

## Boost.StaticString

Away from MrDocs, Boost.StaticString got a round of maintenance. In the library
proper I added `basic_static_string::available()`, which reports how much room
is left before the string hits its capacity. That is the natural question to ask
a fixed-capacity string before appending to it, and previously one you had to
work out yourself. The rest went to `basic_static_cstring`, the experimental
fixed-capacity string that lives under example/: its comparison operators were
fixed, as were `compare(const CharT*)` for over-long inputs and the array
constructor, which wasn't respecting the type's own no-embedded-NULs invariant.

## Housekeeping

For a while, anyone installing MrDocs from a rolling release was at risk of
downloading an older build than the one they asked for. The install page picks
an asset per platform by matching a filename suffix through the GitHub API, and
every push to develop published its packages under the current project version,
giving names like "MrDocs-0.8.0-Linux.tar.gz". A version bump therefore produced
a *new* filename and left the previous one sitting on the same rolling release
as a stale asset, which the first-match lookup would then find and serve.
[#1181](https://github.com/cppalliance/mrdocs/pull/1181) renames non-tag
packages after the branch before upload, so successive pushes produce identical
filenames that the release action overwrites in place. Tag releases are
immutable per version and keep their versioned names. Twenty-two lines of CI
configuration, and a class of confusing bug reports that will never be filed.

Next up: turning the scripting extensions into proper plugins, which is the
rung above the three described here, and where the interesting question stops
being "what can a script reach?" and starts being "what should it be allowed
to?".

