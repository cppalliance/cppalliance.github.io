---
layout: post
nav-class: dark
categories: krystian
title: Krystian's Q4 2024 Update
author-id: krystian
---

# Clang

This quarter, I continued working on the *fourth* iteration of my [refactoring of multi-level template argument list collection](https://github.com/llvm/llvm-project/pull/111852) ([#112381](https://github.com/llvm/llvm-project/pull/112381), [#114258](https://github.com/llvm/llvm-project/pull/114258) and [#114569](https://github.com/llvm/llvm-project/pull/114569) related), fixed support for the `@relates` command, made improvements to C++ conformance, amongst other things.

## Multi-level template argument list collection (again)

[My initial patch](https://github.com/llvm/llvm-project/pull/106585) that refactored multi-level template argument list collection proved to have some nasty bugs relating to instantiation order. The following is a reduction of a reported regression when compiling QT:

```cpp
template<int N>
struct A
{
    template<typename T>
    static constexpr bool f();
};

template<>
template<typename T>
constexpr bool A<0>::f()
{
    return A<1>::f<T>(); // note: undefined function 'f<int>' cannot be used in a constant expression
}

template<>
template<typename T>
constexpr bool A<1>::f()
{
    return true;
}

static_assert(A<0>::f<int>()); // error: static assertion expression is not an integral constant expression
```

I initially thought Clang was correct to complain here, since the member specialization `A<1>::f` does not precede its first use (lexically), ergo IFNDR per [[temp.expl.spec] p7](http://eel.is/c++draft/temp.expl.spec#7):
> If a template, a member template or a member of a class template is explicitly specialized, a declaration of that specialization shall be reachable from every use of that specialization that would cause an implicit instantiation to take place, in every translation unit in which such a use occurs; no diagnostic is required.

However, the declaration of the member specialization is reachable from a point in the *instantiation context* of the definition of `A<0>::f<int>` (that being, immediately prior to the _static_assert-declaration_), so this example is indeed valid.

## Explicit specialization of members of partial specializations

On the C++ conformance side of things, I landed a [patch](https://github.com/llvm/llvm-project/pull/113464) implementing [[temp.spec.partial.member] p2](http://eel.is/c++draft/temp.spec.partial.member#2):
> If the primary member template is explicitly specialized for a given (implicit) specialization of the enclosing class template, the partial specializations of the member template are ignored for this specialization of the enclosing class template.
If a partial specialization of the member template is explicitly specialized for a given (implicit) specialization of the enclosing class template, the primary member template and its other partial specializations are still considered for this specialization of the enclosing class template.

Its meaning can be illustrated via the following:
```cpp
template<typename T>
struct A
{
    template<typename U>
    struct B
    {
        static constexpr int x = 0; // #1
    };

    template<typename U>
    struct B<U*>
    {
        static constexpr int x = 1; // #2
    };
};

template<>
template<typename U>
struct A<long>::B
{
    static constexpr int x = 2; // #3
};

static_assert(A<short>::B<int>::y == 0); // uses #1
static_assert(A<short>::B<int*>::y == 1); // uses #2

static_assert(A<long>::B<int>::y == 2); // uses #3
static_assert(A<long>::B<int*>::y == 2); // uses #3
```

Since the primary member template `A<long>::B` is explicitly specialized for a given (implicit) specialization of its enclosing class template, the partial specialization `B<U*>` will be ignored when instantiating a specialization of `B`.
