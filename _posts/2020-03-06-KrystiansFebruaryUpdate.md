---
layout: post
nav-class: dark
categories: krystian
title: Krystian's February Update
author: Krystian Stasiowski
author-id: krystian
---


# Introduction



I'm a first-year university student at the University of Connecticut pursuing a degree in Computer Science. I joined The C++ Alliance near the end of January as a part-time Staff Engineer at the recommendation of Vinnie, who has been mentoring me for the past several months. I’ve been programming in C++ for around 2 years now, with an interest in library development and standardization. My original reasoning for choosing C++ over other languages was a little misguided, being that it was generally regarded as a difficult language, and I liked the challenge. Prior to this, I had dabbled in the language a little bit, but I really didn’t get into it until I discovered the existence of the standard. A language with explicitly defined semantics, all specified in a document that is difficult to parse sounded very appealing to me, and thus I embarked on my journey to learn everything about it that I could. If you were to ask me what I like most about it now, it would probably be a tie between the “you don’t pay for what you don’t use” principle and zero cost generics.



With regard to standardization, I do a lot of standardese bug-fixing in the form of editorial issues and defect reports, and I write papers mostly focused on fixing the language. As for library development, I’m currently working on [Boost.JSON](https://github.com/vinniefalco/json) and [Boost.StaticString](https://github.com/boostorg/static_string), the latter of which has been accepted into Boost.



# Boost.JSON



My work on Boost.JSON originally started with writing a documentation style guide and then applying it to the library. The first place where this documentation was applied to was `json::string`; a non-template string type similar to `std::string`, but with a type erased allocator, used exclusively with `char`.



The documentation of `json::string` proved to be no easy feat, due to its overwhelming number of overloaded member functions (`string::replace` itself has 12 overloads). Detailed documentation of these functions did prove to be a little tedious, and once I finished, it was clear that a better interface was needed.



The standard interface for `std::string` is bound to a strict regimen of backward compatibility, and thus the interface suffers due to its lack of the ability to remove stale and unnecessary overloads. Take `replace` for instance: it has overloads that take a `string`, a type convertible to `string_view`, a pointer to a string, a pointer to a string and its size, a `string` plus parameters to obtain a substring and a `string_view` plus parameters to obtain a substring. All of these overloads can be replaced with a single overload accepting a `string_view` parameter, as it is cheap to copy, and can be constructed from all of the aforementioned types. Those pesky overloads taking parameters to perform a substring can also be done away with, as the substring operation can be performed at the call site. `json::string` includes a `subview` function which returns a `string_view` for cheap substring operations, so needless `json::string` constructions can be avoided.



With the guidance of Peter Dimov, I drafted up a new `string_view` based interface, which dramatically reduced the number of overloads for each member function. Once the sign-off was given, it was a relatively trivial task to implement, as it was merely a matter of removing no longer needed overloads, and changing function templates that accepted objects convertible to `string_view` to be non-template functions with a `string_view` parameter.




# Boost.StaticString



I was originally invited by Vinnie to work on [Boost.StaticString](https://github.com/boostorg/static_string) (then Boost.FixedString) back in October, and since then it has been accepted into Boost. It provides a fixed capacity, dynamically sized string that performs no dynamic allocations. It’s a fast alternative to `std::string` when either the capacity of the string is known or can be reasonably approximated at compile time.



My primary objective for February was to implement the post-review changes requested by our review manager Joaquin Muñoz in time for the next Boost release. Most of the changes by this point had already been implemented, but still lacked polish, and the test coverage had to be improved. Additionally, I wanted to add a few optimizations and improve the `constexpr` support, the latter proving to be quite a daunting task.



The nice thing about `static_string` is that the capacity of the string is part of the type, consequently allowing us to make all kinds of assumptions and to statically resolve what optimizations we want to perform at compile time. In particular, the usual checks are done in insert and replace that determine if the source of the operation (i.e. the string that will be copied into the string) lies within the string the operation is performed upon can be elided if we can somehow guarantee that they will never overlap. Since non-potentially overlapping objects of different types are guaranteed to occupy distinct addresses, we can safely skip this check for overloads accepting `static_string` parameters, if the capacity of the strings differ. In my opinion, it’s pretty neat.



The aforementioned check that is performed in insert and replace also was the source of some serious headaches with respect to `constexpr` support across implementations. When you mix in the requirement to support C++11, it gets even worse. The primary issue that presents itself is that comparing pointers with the built-in relational operators yield unspecified results when the pointers do not point to elements of the same array; evaluating such an expression is forbidden during constant evaluation. The usual workaround to this is to use the library comparison operators (i.e. `std::less`, `std::greater` etc.), and in standardese land, it’s all good and well. However, on actual implementations, this won’t always work. For example, when using clang with libstdc++, [the implementation for the library comparison operators](https://github.com/gcc-mirror/gcc/blob/master/libstdc++-v3/include/bits/stl_function.h#L443) casts the pointers to integer types and compares the resulting integers. If `__builtin_is_constant_evaluated` is available it is used and the check is instead done using the built-in relational operators, but this was only [implemented on clang quite recently](https://reviews.llvm.org/D55500) and therefore cannot be used for the most part.



Figuring this out and finding a solution was quite a process, but eventually, I settled on a solution that gave the least unspecified results across implementations, provided good performance, and actually compiled. In essence, if `std::is_constant_evaluated` or a builtin equivalent is available, we can use a neat trick involving the equality operator for pointers. Equality comparison for pointers [almost never has unspecified results](http://eel.is/c++draft/expr.eq#3), so to check if the pointer falls within a range, we can iterate over every pointer value within that range and test for equality. This is only done during constant evaluation, so performance does not suffer. If the aforementioned functions cannot be used, or if the function is not evaluated within a constant evaluation, we use the built-in comparison operators for configurations where the library comparison operators don’t work in constant evaluation, and otherwise use the library comparison operators. Having a portable version of this check in the standard library wouldn’t be a terrible idea, so it may be something I will pursue in the future.



Another feature that took a little bit of time to get working were the `to_static_string` overloads for floating-point types. `static_string` does not enjoy the luxury of being able to increase capacity, so sticking to only using standard notation isn’t possible since floating-point types can represent extremely large values. To get the best of both worlds, we first attempt to use standard form and then retry using scientific notation if that fails. To match `std::to_string`, the default precision of 6 is used for standard form - however, if we resort to scientific notation, we use the highest precision value possible based on the number of digits required to represent all the values of the type being converted, and the number of digits in its maximum mantissa value. As Peter Dimov noted several times, using the `%g` format specifier would be a preferable solution, so I may change this in the future.



# Standardization



The Prague meeting came and went (I did not attend), and unfortunately no progress was made on any of my papers. CWG was very busy finalizing C++20, so that left no time for a wording review of [P1839](http://wg21.link/p1839), and I’m holding off on my other papers. I’m planning to attend the New York meeting in November representing The C++ Alliance (my first meeting, I’m excited!), and is where I will be presenting [P1945](http://wg21.link/p1945), [P1997](http://wg21.link/p1997), and a few others that are currently in the works. Outside of proposals, it was business as usual; finding and fixing several editorial issues, and filing a few defect reports. Most of the work I do focuses on fixing the core language, and generally improving the consistency of the wording, so this month I worked on fixing incorrect conventions, removing redundant wording, and a small rewrite of [[dcl.meaning]](http://eel.is/c++draft/dcl.meaning) on the editorial side of things. As for defect reports, they consisted of some small wording issues that weren’t quite editorial but didn’t have a significant impact on the language.



# Summary



My experience working at the Alliance has been very positive thus far. Being a student, having flexible hours is fantastic, as I am able to adjust when I work based on my school workload. In the short amount of time I have spent working on Boost.JSON and Boost.StaticString, I have learned a lot, and continue to do so every day. Vinnie, Peter, and Glen always provide their invaluable feedback through reviews and answering questions, which is extremely helpful when working on projects of this scale with little experience. I consider the acceptance of Boost.StaticString into Boost to be my crowning achievement thus far, and I’m excited to see what kinds of cool projects I’ll be working on in the future.



If you want to get in touch with me, you can message me on the [Cpplang slack](http://slack.cpp.al/), or [shoot me an email](mailto:sdkrystian@gmail.com).