---
layout: post
nav-class: dark
categories: krystian
title: Krystian's Q1 2024 Update
author-id: krystian
---

My primary focus this quarter was on clang -- in particular, C++ standards conformance (including implementing resolutions to defect reports I've submitted), bug fixes, and various refactoring of the AST. I was also granted write access to the LLVM project repository this quarter, which has allowed me to significantly increase my output. To that end, I submitted/merged a number of patches:

- #89618 [[Clang][Sema] Remove unused function after #88731](https://github.com/llvm/llvm-project/pull/89618)
- #89605 [[libc++][NFC] Fix unparenthesized comma expression in mem-initializer](https://github.com/llvm/llvm-project/pull/89605)
- #89377 [[libc++] Fix usage of 'exclude_from_explicit_instantiation' attribute on local class members](https://github.com/llvm/llvm-project/pull/89377)
- #89300 [[Clang][Sema] Diagnose explicit specializations with object parameters that do not match their primary template](https://github.com/llvm/llvm-project/pull/89300)
- #88974 [[Clang][Parse] Diagnose requires expressions with explicit object parameters](https://github.com/llvm/llvm-project/pull/88974)
- #88963 [[Clang][Sema] Improve support for explicit specializations of constrained member functions & member function templates](https://github.com/llvm/llvm-project/pull/88963)
- #88777 [[Clang][Sema] Warn when 'exclude_from_explicit_instantiation' attribute is used on local classes and members thereof](https://github.com/llvm/llvm-project/pull/88777)
- #88731 [Reapply "[Clang][Sema] Fix crash when 'this' is used in a dependent class scope function template specialization that instantiates to a static member function (#87541, #88311)"](https://github.com/llvm/llvm-project/pull/88731)
- #88417 [[lldb] Fix call to TemplateTemplateParmDecl::Create after #88139](https://github.com/llvm/llvm-project/pull/88417)
- #88311 [Reapply "[Clang][Sema] Fix crash when 'this' is used in a dependent class scope function template specialization that instantiates to a static member function (#87541)"](https://github.com/llvm/llvm-project/pull/88311)
- #88264 [Revert "[Clang][Sema] Fix crash when 'this' is used in a dependent class scope function template specialization that instantiates to a static member function"](https://github.com/llvm/llvm-project/pull/88264)
- #88146 [[Clang][AST][NFC] Fix printing of dependent PackIndexTypes](https://github.com/llvm/llvm-project/pull/88146)
- #88139 [[Clang][AST] Track whether template template parameters used the 'typename' keyword](https://github.com/llvm/llvm-project/pull/88139)
- #88042 [[Clang][Sema] Implement approved resolution for CWG2858](https://github.com/llvm/llvm-project/pull/88042)
- #87541 [[Clang][Sema] Fix crash when 'this' is used in a dependent class scope function template specialization that instantiates to a static member function](https://github.com/llvm/llvm-project/pull/87541)
- #86817 [[Clang][Sema] Fix explicit specializations of member function templates with a deduced return type](https://github.com/llvm/llvm-project/pull/86817)
- #86682 [[Clang][AST][NFC] Move template argument dependence computations for MemberExpr to computeDependence](https://github.com/llvm/llvm-project/pull/86682)
- #86678 [[Clang][AST][NFC] MemberExpr stores NestedNameSpecifierLoc and DeclAccessPair separately](https://github.com/llvm/llvm-project/pull/86678)
- #84457 [Revert "[Clang][Sema] Fix crash when using name of UnresolvedUsingValueDecl with template arguments (#83842)"](https://github.com/llvm/llvm-project/pull/84457)
- #84050 [[Clang][Sema] Diagnose class member access expressions naming non-existent members of the current instantiation prior to instantiation in the absence of dependent base classes](https://github.com/llvm/llvm-project/pull/84050)
- #83842 [[Clang][Sema] Fix crash when using name of UnresolvedUsingValueDecl with template arguments](https://github.com/llvm/llvm-project/pull/83842)
- #83024 [[Clang][Sema] Fix crash when MS dependent base class lookup occurs in an incomplete context](https://github.com/llvm/llvm-project/pull/83024)
- #82417 [[Clang][Sema] Defer instantiation of exception specification until after partial ordering when determining primary template](https://github.com/llvm/llvm-project/pull/82417)
- #82277 [[Clang][Sema] Convert warning for extraneous template parameter lists to an extension warning](https://github.com/llvm/llvm-project/pull/82277)
- #81642 [[Clang] Unify interface for accessing template arguments as written for class/variable template specializations](https://github.com/llvm/llvm-project/pull/81642)
- #81171 [[clang-tidy] Fix failing test after #80864](https://github.com/llvm/llvm-project/pull/81171)
- #80899 [[Clang][Sema] Implement proposed resolution for CWG2847](https://github.com/llvm/llvm-project/pull/80899)
- #80864 [[Clang][Sema] Abbreviated function templates do not append invented parameters to empty template parameter lists](https://github.com/llvm/llvm-project/pull/80864)
- #80842 [[Clang][Sema] Diagnose declarative nested-name-specifiers naming alias templates](https://github.com/llvm/llvm-project/pull/80842)
- #80359 [[Clang][Sema] Correctly look up primary template for variable template specializations](https://github.com/llvm/llvm-project/pull/80359)
- #80171 [[Clang][Sema] Diagnose friend declarations with enum elaborated-type-specifier in all language modes](https://github.com/llvm/llvm-project/pull/80171)
- #79760 [[Clang][NFC] Remove TemplateArgumentList::OnStack](https://github.com/llvm/llvm-project/pull/79760)
- #79683 [Reapply "[Clang][Sema] Diagnose function/variable templates that shadow their own template parameters (#78274)"](https://github.com/llvm/llvm-project/pull/79683)
- #78720 [[Clang][Sema] Allow elaborated-type-specifiers that declare member class template explict specializations](https://github.com/llvm/llvm-project/pull/78720)
- #78595 [[Clang][Sema] Diagnose use of template keyword after declarative nested-name-specifiers](https://github.com/llvm/llvm-project/pull/78595)
- #78325 [[Clang][Sema][NFC] Remove unused Scope* parameter from Sema::GetTypeForDeclarator and Sema::ActOnTypeName](https://github.com/llvm/llvm-project/pull/78325)
- #78274 [[Clang][Sema] Diagnose function/variable templates that shadow their own template parameters](https://github.com/llvm/llvm-project/pull/78274)
- #78243 [[Clang][Parse] Diagnose member template declarations with multiple declarators](https://github.com/llvm/llvm-project/pull/78243)
