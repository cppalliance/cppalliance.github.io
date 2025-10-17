---
layout: post
nav-class: dark
categories: mizvekov, clang
title: Making the Clang AST Leaner and Faster
author-id: mizvekov
author-name: Matheus Izvekov
---

Modern C++ codebases — from browsers to GPU frameworks — rely heavily on templates, and that often means *massive* abstract syntax trees. Even small inefficiencies in Clang’s AST representation can add up to noticeable compile-time overhead.

This post walks through a set of structural improvements I recently made to Clang’s AST that make type representation smaller, simpler, and faster to create — leading to measurable build-time gains in real-world projects.

---

A couple of months ago, I landed [a large patch](https://github.com/llvm/llvm-project/pull/147835) in Clang that brought substantial compile-time improvements for heavily templated C++ code.

For example, in [stdexec](https://github.com/NVIDIA/stdexec) — the reference implementation of the `std::execution` [feature slated for C++26](http://wg21.link/p2300) — the slowest test ([`test_on2.cpp`](https://github.com/NVIDIA/stdexec/blob/main/test/stdexec/algos/adaptors/test_on2.cpp)) saw a **7% reduction in build time**.

Also the [Chromium](https://www.chromium.org/Home/) build showed a **5% improvement** ([source](https://github.com/llvm/llvm-project/pull/147835#issuecomment-3278893447)).

At a high level, the patch makes the Clang AST *leaner*: it reduces the memory footprint of type representations and lowers the cost of creating and uniquing them.

These improvements will ship with **Clang 22**, expected in the next few months.

---

## How elaboration and qualified names used to work

Consider this simple snippet:

```cpp
namespace NS {
  struct A {};
}
using T = struct NS::A;
```

The type of `T` (`struct NS::A`) carries two pieces of information:

1. It’s *elaborated* — the `struct` keyword appears.
2. It’s *qualified* — `NS::` acts as a [*nested-name-specifier*](https://eel.is/c++draft/expr.prim.id.qual#:nested-name-specifier).

Here’s how the [AST dump](https://compiler-explorer.com/z/WEWc4817x) looked before this patch:

```
ElaboratedType 'struct NS::A' sugar
`-RecordType 'test::NS::A'
  `-CXXRecord 'A'
```

The `RecordType` represents a direct reference to the previously declared `struct A` — a kind of *canonical* view of the type, stripped of syntactic details like `struct` or namespace qualifiers.

Those syntactic details were stored separately in an `ElaboratedType` node that wrapped the `RecordType`.

Interestingly, an `ElaboratedType` node existed even when no elaboration or qualification appeared in the source ([example](https://compiler-explorer.com/z/ncW5bzWrc)). This was needed to distinguish between an explicitly unqualified type and one that lost its qualifiers through template substitution.

However, this design was expensive: every `ElaboratedType` node consumed **48 bytes**, and creating one required extra work to uniquify it — an important step for Clang’s fast type comparisons.

---

## A more compact representation

The new approach removes `ElaboratedType` entirely. Instead, elaboration and qualifiers are now stored **directly inside `RecordType`**.

The [new AST dump](https://compiler-explorer.com/z/asz5q5YGj) for the same example looks like this:

```cpp
RecordType 'struct NS::A' struct
|-NestedNameSpecifier Namespace 'NS'
`-CXXRecord 'A'
```

The `struct` elaboration now fits into previously unused bits within `RecordType`, while the qualifier is *tail-allocated* when present — making the node variably sized.

This change both shrinks the memory footprint and eliminates one level of indirection when traversing the AST.

---

## Representing `NestedNameSpecifier`

`NestedNameSpecifier` is Clang’s internal representation for name qualifiers.

Before this patch, it was represented by a pointer (`NestedNameSpecifier*`) to a uniqued structure that could describe:

1. The global namespace (`::`)
2. A named namespace (including aliases)
3. A type
4. An identifier naming an unknown entity
5. A `__super` reference (Microsoft extension)

For all but cases (1) and (5), each `NestedNameSpecifier` also held a *prefix* — the qualifier to its left.

For example:

```cpp
Namespace::Class::NestedClassTemplate<T>::XX
```

This would be stored as a linked list:

```
[id: XX] -> [type: NestedClassTemplate<T>] -> [type: Class] -> [namespace: Namespace]
```

Internally, that meant **seven allocations** totaling around **160 bytes**:

1. `NestedNameSpecifier` (identifier) – 16 bytes
2. `NestedNameSpecifier` (type) – 16 bytes
3. `TemplateSpecializationType` – 48 bytes
4. `QualifiedTemplateName` – 16 bytes
5. `NestedNameSpecifier` (type) – 16 bytes
6. `RecordType` – 32 bytes
7. `NestedNameSpecifier` (namespace) – 16 bytes

The real problem wasn’t just size — it was the *uniquing cost*. Every prospective node has to be looked up in a hash table for a pre-existing instance.

To make matters worse, `ElaboratedType` nodes sometimes leaked into these chains, which wasn’t supposed to happen and led to [several](https://github.com/llvm/llvm-project/issues/43179) [long-standing](https://github.com/llvm/llvm-project/issues/68670) [bugs](https://github.com/llvm/llvm-project/issues/92757).

---

## A new, smarter `NestedNameSpecifier`

After this patch, `NestedNameSpecifier` becomes a **compact, tagged pointer** — just one machine word wide.

The pointer uses 8-byte alignment, leaving three spare bits. Two bits are used for kind discrimination, and one remains available for arbitrary use.

When non-null, the tag bits encode:

1. A type
2. A declaration (either a `__super` class or a namespace)
3. A namespace prefixed by the global scope (`::Namespace`)
4. A special object combining a namespace with its prefix

When null, the tag bits instead encode:

1. An empty nested name (the terminator)
2. The global name
3. An invalid/tombstone entry (for hash tables)

Other changes include:

* The “unknown identifier” case is now represented by a `DependentNameType`.
* Type prefixes are handled directly in the type hierarchy.

Revisiting the earlier example, after the patch its AST dump becomes:

```
DependentNameType 'Namespace::Class::NestedClassTemplate<T>::XX' dependent
`-NestedNameSpecifier TemplateSpecializationType 'Namespace::Class::NestedClassTemplate<T>' dependent
  `-name: 'Namespace::Class::NestedClassTemplate' qualified
    |-NestedNameSpecifier RecordType 'Namespace::Class'
    | |-NestedNameSpecifier Namespace 'Namespace'
    | `-CXXRecord 'Class'
    `-ClassTemplate NestedClassTemplate
```

This representation now requires only **four allocations (156 bytes total):**

1. `DependentNameType` – 48 bytes
2. `TemplateSpecializationType` – 48 bytes
3. `QualifiedTemplateName` – 16 bytes
4. `RecordType` – 40 bytes

That’s almost half the number of nodes.

While `DependentNameType` is larger than the previous 16-byte “identifier” node, the additional space isn’t wasted — it holds cached answers to common queries such as “does this type reference a template parameter?” or “what is its canonical form?”.

These caches make those operations significantly cheaper, further improving performance.

---

## Wrapping up

There’s more in the patch than what I’ve covered here, including:

* `RecordType` now points directly to the declaration found at creation, enriching the AST without measurable overhead.
* `RecordType` nodes are now created lazily.
* The redesigned `NestedNameSpecifier` simplified several template instantiation transforms.

Each of these could warrant its own write-up, but even this high-level overview shows how careful structural changes in the AST can lead to tangible compile-time wins.

I hope you found this deep dive into Clang’s internals interesting — and that it gives a glimpse of the kind of small, structural optimizations that add up to real performance improvements in large C++ builds.
