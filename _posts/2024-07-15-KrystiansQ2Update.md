---
layout: post
nav-class: dark
categories: krystian
title: Krystian's Q2 2024 Update
author-id: krystian
---

# MrDocs

This quarter, my primary focus was on MrDocs. To that end, I'm happy to say that the P0 milestone for MrDocs has been reached! Although the vast majority of the work I did was bug hunting/fixing, I also implemented a novel feature which detects and simplifies types that use the SFINAE idiom.

Prior to C++20, the primary mechanism for constraining templates was through use of the SFINAE idiom, e.g.:

```cpp
template<typename T>
std::enable_if_t<std::is_pointer_v<T>, T> f(T); // only viable when T is a pointer type
```

These kinds of constrained declarations can be rather "noisy" due to the constraints being written into the type of the declaration. One solution is to use macros to show the simplified type when generating documentation:

```cpp
template<typename T>
#ifndef DOCS
std::enable_if_t<std::is_pointer_v<T>, T>
#else
T
#endif
f(T);
```

but this requires manual intervention on the part of the library author. Since MrDocs generates documentation using the clang AST, we can detect whether a template implements the SFINAE idiom and show the "replacement type" instead:

```cpp
template<typename T>
std::enable_if_t<std::is_pointer_v<T>, T> // rendered as 'T' in the documentation since std::enable_if_t is a SFINAE template
f(T);
```

In general, MrDocs determines whether a type naming a member `M` of a class template `C` uses the SFINAE idiom by identifying every declaration of `M` in the primary template and every partial/explicit specialization of `C`. If `M` is not found in at least one of the class definitions, and if every declaration of `M` declares it as an alias for the same type as every other declaration, then `C` is a template implementing the SFINAE.

# Clang

In addition to working on MrDocs, I merged a number of clang patches this quarter:

- #98567 [[Clang][AST] Move NamespaceDecl bits to DeclContext](https://api.github.com/repos/llvm/llvm-project/issues/98567)
- #98563 [[Clang][AST] Don't use canonical type when checking dependence in Type::isOverloadable](https://api.github.com/repos/llvm/llvm-project/issues/98563)
- #98547 [Reapply "[Clang] Implement resolution for CWG1835 (#92957)"](https://api.github.com/repos/llvm/llvm-project/issues/98547)
- #98167 [[Clang][Sema] Handle class member access expressions with valid nested-name-specifiers that become invalid after lookup](https://api.github.com/repos/llvm/llvm-project/issues/98167)
- #98027 [[Clang][Index] Add support for dependent class scope explicit specializations of function templates to USRGenerator](https://api.github.com/repos/llvm/llvm-project/issues/98027)
- #97596 [[Clang][Sema] Correctly transform dependent operands of overloaded binary operator&](https://api.github.com/repos/llvm/llvm-project/issues/97596)
- #97455 [[Clang][Sema] Fix crash when rebuilding MemberExprs with invalid object expressions](https://api.github.com/repos/llvm/llvm-project/issues/97455)
- #97425 [[Clang][Sema] Treat explicit specializations of static data member templates declared without 'static' as static data members when diagnosing uses of 'auto'](https://api.github.com/repos/llvm/llvm-project/issues/97425)
- #96364 [[Clang][Parse] Fix ambiguity with nested-name-specifiers that may declarative](https://api.github.com/repos/llvm/llvm-project/issues/96364)
- #93873 [[Clang][Sema] Diagnose variable template explicit specializations with storage-class-specifiers](https://api.github.com/repos/llvm/llvm-project/issues/93873)
- #92957 [[Clang] Implement resolution for CWG1835](https://api.github.com/repos/llvm/llvm-project/issues/92957)
- #92597 [[Clang][Sema] Diagnose current instantiation used as an incomplete base class](https://api.github.com/repos/llvm/llvm-project/issues/92597)
- #92452 [[Clang][Sema] Fix crash when diagnosing near-match for 'constexpr' redeclaration in C++11](https://api.github.com/repos/llvm/llvm-project/issues/92452)
- #92449 [[Clang][Sema] Do not add implicit 'const' when matching constexpr function template explicit specializations after C++14](https://api.github.com/repos/llvm/llvm-project/issues/92449)
- #92425 [[Clang][Sema] ASTContext::getUnconstrainedType propagates dependence](https://api.github.com/repos/llvm/llvm-project/issues/92425)
- #92318 [[Clang][Sema] Don't build CXXDependentScopeMemberExprs for potentially implicit class member access expressions](https://api.github.com/repos/llvm/llvm-project/issues/92318)
- #92283 [Reapply "[Clang][Sema] Earlier type checking for builtin unary operators (#90500)"](https://api.github.com/repos/llvm/llvm-project/issues/92283)
- #92149 [Revert "[Clang][Sema] Earlier type checking for builtin unary operators (#90500)"](https://api.github.com/repos/llvm/llvm-project/issues/92149)
- #91972 [[Clang][Sema] Fix bug where operator-> typo corrects in the current instantiation](https://api.github.com/repos/llvm/llvm-project/issues/91972)
- #91620 [[Clang][Sema] Revert changes to operator= lookup in templated classes from #91498, #90999, and #90152](https://api.github.com/repos/llvm/llvm-project/issues/91620)
- #91534 [[Clang][Sema] Do not mark template parameters in the exception specification as used during partial ordering](https://api.github.com/repos/llvm/llvm-project/issues/91534)
- #91498 [[Clang][Sema] Fix lookup of dependent operator= outside of complete-class contexts](https://api.github.com/repos/llvm/llvm-project/issues/91498)
- #91393 [Reapply "[Clang] Unify interface for accessing template arguments as written for class/variable template specializations (#81642)"](https://api.github.com/repos/llvm/llvm-project/issues/91393)
- #91339 [[Clang][Sema] Don't set instantiated from function when rewriting operator<=>](https://api.github.com/repos/llvm/llvm-project/issues/91339)
- #90999 [[Clang][Sema] Fix template name lookup for operator=](https://api.github.com/repos/llvm/llvm-project/issues/90999)
- #90760 [[Clang][Sema] Explicit template arguments are not substituted into the exception specification of a function](https://api.github.com/repos/llvm/llvm-project/issues/90760)
- #90517 [[Clang][Sema][Parse] Delay parsing of noexcept-specifiers in friend function declarations](https://api.github.com/repos/llvm/llvm-project/issues/90517)
- #90500 [[Clang][Sema] Earlier type checking for builtin unary operators](https://api.github.com/repos/llvm/llvm-project/issues/90500)
- #90478 [[Clang] Propagate 'SystemDrive' environment variable for unit tests](https://api.github.com/repos/llvm/llvm-project/issues/90478)
- #90152 [Reapply "[Clang][Sema] Diagnose class member access expressions naming non-existent members of the current instantiation prior to instantiation in the absence of dependent base classes (#84050)"](https://api.github.com/repos/llvm/llvm-project/issues/90152)
- #90104 [[Clang][Sema] Fix warnings after #84050](https://api.github.com/repos/llvm/llvm-project/issues/90104)