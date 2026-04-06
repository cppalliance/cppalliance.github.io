---
layout: post
nav-class: dark
categories: gennaro
title: "Mr.Docs: Niebloids, Reflection, Code Removal, New XML Generator"
author-id: gennaro
author-name: Gennaro Prota
---

This quarter, I focused on two areas of Mr.Docs: adding first-class support for
function objects, the pattern behind C++20 Niebloids and Ranges CPOs, and
overhauling how the tool turns C++ metadata into documentation output (the
reflection layer).

## Function objects: documenting what users actually call

In modern C++ libraries, many "functions" are actually global objects whose type
has `operator()` overloads. The Ranges library, for instance, defines
`std::ranges::sort()` not as a function template but as a variable of some
unspecified callable type. Users call it like a function and expect it to be
documented like one. Before this quarter, Mr.Docs didn't know the difference: it
would document the variable and its cryptic implementation type.

The new function-object support (roughly 4,600 lines across 38 files) bridges
this gap. When Mr.Docs encounters a variable whose type is a record with no
public members but `operator()` overloads and special member functions, it now
synthesizes free-function documentation entries named after the variable. The
underlying type is marked implementation-defined and hidden from the output.
Multi-overload function objects are naturally grouped by the existing overload
machinery. So, given:

```cpp
struct abs_fn {
    double operator()(double x) const noexcept;
};
inline constexpr abs_fn abs = {};
```

Mr.Docs documents it as simply:

```
double abs(double x) noexcept;
```

For cases where auto-detection isn't quite right — for example, when the type
has extra public members — library authors can use the new `@functionobject` or
`@functor` doc commands. There is also an `auto-function-objects` config option
to control the behavior globally. The feature comes with a comprehensive test
fixture covering single and multi-overload function objects, templated types,
and types that live in nested `detail` namespaces.

## Reflection: from boilerplate to a single generic template

The bigger effort — and the one that kept surprising me with its scope — was the
reflection refactoring. Mr.Docs converts its internal C++ metadata into a DOM (a
tree of lazy objects) that drives the Handlebars template engine. Before this
quarter, every type in the system required a hand-written `tag_invoke()`
overload: one function to map the type's fields to DOM properties, another to
convert it to a `dom::Value`. Adding a new symbol kind meant touching half a
dozen files and following a pattern that was easy to get wrong.

The goal was simple to state: replace all of that with a single generic template
that works for any type carrying a describe macro.

### Phase 1: Boost.Describe

The first attempt used Boost.Describe. I added `BOOST_DESCRIBE_STRUCT()`
annotations to every metadata type and wrote generic `merge()` and
`mapReflectedType()` templates that iterated over the described members. This
proved the concept and eliminated a great deal of boilerplate. However, we
didn't want a public dependency on Boost.Describe, which meant the dependency
was hidden in .cpp files and couldn't be used in templates living in public
heades,

### Phase 2: custom reflection macros

So I wrote our own. `MRDOCS_DESCRIBE_STRUCT()` and `MRDOCS_DESCRIBE_CLASS()`
provide the same compile-time member and base-class iteration as Boost.Describe,
but with no external dependency. The macros live in `Describe.hpp` and produce
`constexpr` descriptor lists that the rest of the system iterates with
`describe::for_each()`.

### Phase 3: removing the overloads

With the describe macros in place, I could write generic implementations of
`tag_invoke()` for both `LazyObjectMapTag` (DOM mapping) and `ValueFromTag`
(value conversion), plus a generic `merge()`. Each one replaces dozens of
per-type overloads with a single constrained template. The `mapMember()`
function handles the dispatch: optionals are unwrapped, vectors become lazy
arrays, described enums become kebab-case strings, and compound described types
become lazy objects — all automatically.

Removing the overloads was not as straightforward as I had hoped. The old
overloads were entangled with:

- **The Handlebars templates**, which assumed specific DOM property names.
  Renaming `symbol` to `id`, `type` to `underlyingType`, and `description` to
  `document` required updating templates and golden tests in lockstep.
- **The XML generator**, which silently skipped types that weren't described.
  Adding `MRDOCS_DESCRIBE_STRUCT()` to `TemplateInfo` and `MemberPointerType`
  made the XML output more complete, requiring schema updates and golden-test
  regeneration.

### The result

Out of the original 39 custom `tag_invoke(LazyObjectMapTag)` overloads, only 7
remain — each with genuinely non-reflectable logic (computed properties,
polymorphic dispatch, or member decomposition). Roughly 60
`tag_invoke(ValueFromTag)` boilerplate overloads were also removed. Adding a new
metadata type to Mr.Docs now requires nothing beyond `MRDOCS_DESCRIBE_STRUCT()`
at the point of definition.

## The XML Generator: a full rewrite in 350 lines

The XML generator was the first major payoff of the reflection work (although it
was initially done when we were using Boost.Describe). The old generator had its
own hand-written serialization for every metadata type, completely independent
of the DOM layer. It was a parallel set of per-type functions that had to be
kept in sync with every schema change.

I replaced it with a generic implementation built entirely on the describe
macros. The core is about 350 lines: `writeMembers()` walks `describe_bases` and
`describe_members`, `writeElement()` dispatches on type traits for primitives,
optionals, vectors, and enums, and `writePolymorphic()` handles the handful of
type hierarchies (`Type`, `TParam`, `TArg`, `Block`, `Inline`) via
.inc-generated switches. The old generator needed a new function for every type;
the new one handles them all, and the 241 files changed in that commit were
almost entirely golden-test updates reflecting the now-more-complete and totally
changed output.

## Smaller fixes

Alongside the two main efforts, I fixed several bugs that came up during
development or were reported by users:

- Markdown inline formatting (bold, italic, code) and bullet lists were not
  rendering correctly in certain combinations.
- `<pre>` tags were missing around HTML code blocks.
- `bottomUpTraverse()` was silently skipping `ListBlock` items, causing
  doc-comment content to be lost.
- Several CI improvements: faster PR demos, better failure detection, increased
  test coverage for the XML generator.

## Looking ahead

The reflection infrastructure is now in good shape, and most of the mechanical
boilerplate is gone. The remaining `tag_invoke()` overloads are genuinely custom
— they compute properties that don't exist as C++ members, or they dispatch
polymorphically across type hierarchies. Those are worth keeping. Going forward,
I'd like to explore whether the describe macros can replace more of the manual
visitor code throughout the codebase.

As always, feedback and suggestions are welcome — feel free to open an issue or
reach out on Slack.
