---
layout: post
nav-class: dark
categories: krystian
title: Krystian's Q3 2024 Update
author-id: krystian
---

Throughout Q3 2024, my work was primarily focused on two projects: MrDocs, and Clang.

# MrDocs

Most of my work in MrDocs was centered around fixing bugs and refactoring. To that end, I resolved numerous bugs, mostly relating to AST extraction. On the refactoring side of things, I (finally) removed the bitcode serialization component from MrDocs. This _greatly_ simplifies the project architecture and eliminates most of the boilerplate that was needed when modifying the representation used by MrDocs to represent AST nodes.

## Supporting Concepts and Constraints

In addition to housekeeping tasks, I added support for concepts (and constraints) to MrDocs! Although the implementation is still in its infancy, all kinds of possible constraints are supported.

MrDocs relies on the Clang USR (universal symbol reference) generator to create unique identifiers for C++ entities. Since the Clang USR generator does not support constrained declarations, the implementation of concepts requires additional data appended as to uniquely identify declarations which only differ in constraints. For example:

```cpp
template<int N>
void f() requires (N <= 4);

template<int N>
void f() requires (N > 4);
```

In the interest of saving time, the "extra data" appended to the USR is obtained by computing the "ODR hash" of the _constraint-expressions_ from each function. For context, an "ODR hash" is a hash value used by Clang to identify ODR violations when using modules. Despite it working for trivial cases like the one above, relying on the ODR hash results in more problems, leading us to what I've been working on in Clang.

# Clang

In Clang, template parameters are identified via *depth* and *index*. Across redeclarations, the depth of template parameters may vary. Consider the following:

```cpp
template<typename T>
struct A
{
    template<bool U>
    void f() requires U; // #1
};

template<>
template<bool U>
void A<int>::f() requires U; // #2
```

In `#1`, the depth of `U` is `1`. In `#2`. the depth of `U` is `0`. If we compared the _constraint-expressions_ of the trailing _requires-clauses_ of `#1` and `#2` as written, we would deem them not equivalent, which is obviously incorrect! So, before we compare the _constraint-expressions_, we must first adjust the depths of any referenced template parameters (which Clang already does). Let's see what happens when we compile with Clang 19:

> error: out-of-line declaration of 'f' does not match any declaration in 'A<int>'

.. it doesn't work! This begs the question... why doesn't it work?


In C++, there are three constructs for which instantiation is deferred:
- _noexcept-specifiers_,
- default arguments, and
- constraints

Therefore, we must know the template arguments of any enclosing templates when substituting into these constructs. Of these, the most problematic is constraints, as they affect declaration matching. This led me to [write a patch](https://github.com/llvm/llvm-project/pull/106585) which ensures Clang will always collect the right set of template arguments for any enclosing templates. This not only resolved the USR generation problems in MrDocs, but also fixed significant number of declaration matching issues in Clang.
