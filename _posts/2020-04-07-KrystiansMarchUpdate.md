---
layout: post
nav-class: dark
categories: krystian
title: Krystian's March Update
---


# The Rundown

Due to the COVID-19 pandemic, my classes have been moved online. It's certainly an interesting way to teach, but admittedly I can't say it's enjoyable or effective. However, it has given me a lot of time to work on various projects, which is a reasonable trade-off (at least in my opinion). I got quite a bit done this month due to the substantial increase in leisure time, and was able to work on several projects that previously didn't fit into my schedule.

# Boost.StaticString

I spent the first few days of March putting the finishing touches on Boost.StaticString in preparation for the release of Boost 1.73.0, mostly consisting of housekeeping tasks, but also some bug fixes for certain compiler configurations. In particular, a problem arose with GCC 5 regarding its `constexpr` support, two of which impede using `basic_static_string` during constant evaluation: `throw` expressions, and non-static member functions whose return type is the class they are a member of. With respect to the former, consider the following:

```cpp
constexpr int throw_not_evaluated(bool flag)
{
	if (flag)
		throw 1;
	return 0;
}

constexpr int const_eval = throw_not_evaluated(false);
```
[View this on Godbolt](https://godbolt.org/z/CEuEvr)

It is helpful to first establish what the standard has to say regarding the above example. Looking at [[dcl.constexpr] p3](https://timsong-cpp.github.io/cppwp/n4140/dcl.constexpr#3), we see that `throw_not_evaluated` contains no constructs that are explicitly prohibited from appearing within a `constexpr` function in all contexts. Now taking a look at [[expr.const] p2](https://timsong-cpp.github.io/cppwp/n4140/expr.const#2) we see:
> A *conditional-expression* `e` is a core constant expression unless the evaluation of `e`, following the rules of the abstract machine, would evaluate one of the following expressions:
> - [...] a *throw-expression*

Boiling down the standardese, this effectively says that `throw_not_evaluated(false)` is a constant expression unless, when evaluated, it would evaluate`throw 1`. This would not occur, meaning that  `throw_not_evaluated(false)` is indeed a constant expression, and we can use it to initialize `const_eval`. Clang, later versions of GCC, and MSVC all agree on this and compile it without any complaints. However, GCC 5 with the `-std=c++14` flag fails to do so, citing:
> error: expression '<**throw-expression**>' is not a constant-expression

Sounds excusable to me! GCC 5.1 was released in 2015 after all, so you can't expect every feature to be implemented less than a year after C++14 was finalized, right? It all sounded sane to me, but before going ahead and disabling `constexpr` for functions that were potentially-throwing, I decided to try a small variation of the original:
```cpp
struct magic
{
    constexpr magic(bool flag)
    {
        if (flag)
            throw 1;
        return;
    }

    constexpr operator int() { return 1; }
};

constexpr int magic_eval = magic(false);
```
[View this on Godbolt](https://godbolt.org/z/fXQxDT)

*What?*

It miraculously works. Further, if we construct a `magic` object within a constexpr function:
```cpp
constexpr int throw_not_evaluated(bool flag)
{
	return magic(flag);
}
```
[View this on Godbolt](https://godbolt.org/z/qMAkiQ)

***What?***

Gathering the remnants of my sanity, I lifted the `BOOST_STATIC_STRING_THROW_IF` macros out of all the potentially-throwing functions and replaced them with a class template (for GCC 5) or function template (for all other compilers) that can be constructed/called with the `throw_exception<ExceptionType>(message)` syntax. I also considered adding a `throw_exception_if` variation to hide the `if` statement within shorter functions, but on advisement from Vinnie Falco and Peter Dimov, I didn't end up doing this to allow for better optimization.

Moving on to a simpler GCC 5 issue (but significantly more annoying to diagnose), I discovered that `substr` was causes an ICE during constant evaluation. Took some time to get to the bottom of it, but I eventually figured out that this was because the return type of `substr` is `basic_static_string`. Unfortunately, the only remedy for this was to disable `constexpr` for the function when GCC 5 is used.

Save for these two issues, the rest of the work that had to be done for StaticString was smooth sailing, mostly improvements to the coverage of the `insert` and `replace` overloads that take input iterators. In the future I plan to do an overhaul of the documentation, but as of now it's ready for release, so I'm excited to finally get this project out into the wild.

# Boost.JSON

Most of the time I spent on Boost.JSON in the past month was spent learning the interface and internals of the library, as I will be writing documentation on many of the components in the future. My primary focus was on the `value_ref` class, which is used as the value type of initializer lists used to represent JSON documents within source code. The reason that this is used instead of `value` is because `std::initializer_list` suffers from one fatal flaw: the underlying array that it refers to is `const`, which means you cannot move its elements. Copying a large JSON document is not trivial, so `value_ref` is used as a proxy referring to an underlying object that can be moved by an operation using an initializer list. This is achieved by storing a pointer to a function that will appropriately copy/move construct a `value` when called requested by the target.

While looking at how `value_ref` works, I went ahead and added support for moving from a `json::string`, since up to that point all strings were stored as `string_view` internally, thus precluding the ability to move from a `value_ref` constructed from a `json::string`. There also was a bug caused by how `value_ref` handles construction from rvalues, in part due to the unintuitive nature of type deduction. Consider the following:
```cpp
struct value_ref
{
	template<typename T>
	value_ref(const T&) { ... }

	template<typename T>
	value_ref(T&&) { ... }
};

json::value jv;
const json::value const_jv;
value_ref rvalue = std::move(jv); // #1
value_ref const_rvalue = std::move(const_jv); // #2
```
In both `#1` and `#2`, the constructor `value_ref(T&&)` is called. This certainly makes sense once you consider the deduction that is performed, however, by glancing at just the declarations themselves, it isn't obvious, as we've all been taught that references to non-const types will not bind to a const object. Where this becomes a problem for `value_ref` is that the constructor taking a `T&&` parameter expects to be able to move from the parameter, so it internally stores a non-const `void*`. Converting a "pointer to `const` `T`" to `void*` isn't permitted, so you get a hard error. The fix for this was fairly trivial.

# Standardization

Most of my time this month was spent working on standardization related activities, which can be broken up into two somewhat separate categories:
- Fixing existing wording
- Working on papers

## Editorial issues

I submitted a fair few pull requests to the [draft repository](https://github.com/cplusplus/draft), most of which were general wording cleanups and improvements to the consistency of the wording. With respect to wording consistency, I targeted instances of incorrect cv-qualification notation, definitions of terms within notes, cross-references that name the wrong subclause or are self-referential, and redundant normative wording. These kinds of issues are all over the standard, but I generally stay away from the library wording unless it's absolutely necessary since it has a subtitle difference in the wording style compared to that of the core language. I ended up writing atool to make grepping for these issues a little easier, which is certainly an improvement over manually inspecting each TeX source.

The wording cleanups are the most time consuming, but also are the ones I find the most enjoyable. They all follow the same principle of rephrasing an idea with more accurate wording while not changing the actual meaning -- something that often proves to be a challenge. These generally start off as small issues I notice in the text, but then snowball into complete rewrites to make the whole thing consistent. Anyways, if it sparks your interest you can find the various editorial fixes I worked on [here](https://github.com/cplusplus/draft/pulls?q=is%3Apr+author%3Asdkrystian).

## P1997

Of my papers, [P1997](http://wg21.link/p1997) is the one that I'm putting the most time into. In short, it proposes to make arrays more "regular", allowing assignment, initialization from other arrays, array placeholder types, and many more features we bestow upon scalar and class types. The holy grail of changes (not proposed in the paper) would be to allow the passing of arrays by value *without* decaying to a pointer: fully cementing arrays as first-class types. Unlike the other proposed changes this isn't a pure extension, so to make it remotely feasible existing declarations of parameters with array type (for the sake of brevity we will abbreviate them as PAT) would have to be deprecated in C++23, removed in C++26, and then reinstated in C++29. For this reason, we are undertaking this as an entirely different paper to allow for the pure extensions to be added in C++23, leaving the removal and reinstatement on the backburner.

In order to bring convincing evidence that:

 1. The current semantics for PAT are unintuitive and merely syntactic sugar.
 2. The deprecation of PAT would not be significantly disruptive to existing codebases.

Ted (the co-author) and I decided to see exactly how often PAT appear within normal C++ code. While [codesearch.isocpp.org](https://codesearch.isocpp.org/) by Andrew Tomazos is a fantastic tool, the search we wanted to conduct was simply not possible with his tool, so we set out to create our own. We needed two things:

 1. A dataset
 2. Some tool to parse all the source files

For the dataset, I wrote a tool to clone the top 4000 C++ Github repositories, and clean out all files that weren't C++ source files (.cpp, .cxx, .cc, .h, .hpp, .hxx, .ipp, .tpp). Github has a nice API to search for repositories, but it unfortunately limits the results for a single search query to 1000 results, but since I was sorting them by start count, I was able to use it as an index to begin a new search query. After accidentally sending my Github credentials to Ted once and waiting 10 hours for all the repositories to be cloned, we had our dataset: 2.7 million source files, totaling around 32GB.

To parse all these files, we opted to use the Clang frontend. Its AST matcher was perfectly suited to the task, so it was just a matter of forming the correct matchers for the three contexts a PAT can appear in (function parameter, non-type template parameter, and `catch` clause parameter). All the files were parsed in single file mode, since opening and expanding `#include` directives would make the processing of the files take exponentially longer. Forming the correct match pattern proved to be the most difficult part, as the syntax is not entirely intuitive and often times they simply didn't find every PAT in our test cases.

Doing a single file parse along with wanting to find every PAT possible *and* suppressing all diagnostics landed us in the land of gotchas. To start, the `arrayType` matcher only would match declarations that had an array declarator present, i.e. `int a[]` would be found but `T a` where `T` names an array type would not. Eventually I found `decayedType`, which did exactly what we wanted, so long as we filtered out every result that was a function pointer. This worked for function parameters and non-type template parameters, but not `catch` clause parameters. In the Clang AST, `catch` is categorized as a statement that encloses a variable declaration whose type is not considered to be decayed (as far as I could see) so we could only match parameters that used an array declarator. I don't expect anyone to actually declare PATs in a `catch` clause, and after running the tool on the dataset exactly zero instances were found, so this is most likely a non-issue.

Single file parsing introduced a number of issues all stemming from the fact that none of the `#include` directives were processed, meaning that there was a large number of types that were unresolved. Consider the following:
```cpp
#include <not_processed.h>

using array = unresolved[2];
using array_ref = unk_array&;
array_ref ref = {unresolved(), unresolved()};

void f(decltype(ref) param);
```
For reasons that I don't know, since `unresolved` has no visible declaration Clang reports that `param` has a decayed type. I suspect this is because diagnostics are suppressed and some recursive procedure used in the determination of the type named by  `array_ref` returns upon encountering an error at the declaration of `array` and simply returns `unresolved[2]` as the type. If you know why this happens, don't hesitate to ping me! I ended up tracking the number of PAT declarations that use an array declarator separately since I suspect that this number may end up being more accurate.

Once the tool was ready to go and we started to run it on the dataset, we encountered issues of the worst kind: assertion failures. I suppose such errors could be expected when abusing a compiler to the extent that we did, but they weren't particularly enjoyable to fix. I should mention that tool itself is meant to be run on a directory, so once an assertion failed, it would end the entire run on that directory. My initial solution to this was changing the problematic asserts to throw an exception, but the number of failures was ever-growing. Creating a new `CompilerInstance` for each file did somewhat remedy the situation, but didn't fix it all. Eventually, we called it good enough and let it run over the entire dataset. Clang itself was in our dataset, with a nasty little surprise taking the form of infinitely recursive template instantiations and debug pragmas that would crash the compiler. Clang relies on the diagnostics to signal when the recursive instantiation limit is reached, but since those were disabled the thread would never terminate. Evil.

Once the paper is finished, I'll report the results in a future post.

## Implicit destruction

This paper intends to substantially overhaul the wording that describes the interaction between objects and their storage. I originally brought this issue up several months back with [this pull request](https://github.com/cplusplus/draft/pull/2872) in an attempt to fix it editorially, but it was deemed too large in scope. I finally got started on the paper and drafted up a direction to take, which will hopefully resolve the shortfalls of our current wording.

This problem stems from the notion that objects don't exist before their lifetime has started and after it has ended. This allows compilers to make a lot of assumptions and consequently leads to more optimized code, but the manner in which the wording was applied has severely crippled our ability to refer to "not-objects". We want to be able to place restrictions on storage that an object used to occupy, but simply have no way for doing so. Thus, the direction I plan to take is to define the semantics of storage, allowing us to place restrictions on that storage even if no object exists within it. I don't have too many of the core definitions completed yet as they require the most time to make them robust, but once that is hashed out, applying it where needed should be smooth sailing.

Here is a short list of the main changes:
- Define what a *region of storage* is, specify when it is acquired, released, and what kinds of objects may occupy it.
- Remove the storage duration property from objects, and effectively make that agnostic of the storage they occupy. Instead, associate storage duration with a variable. Dynamic storage duration can removed since such storage isn't associated with a variable.
- Specify when *reuse* of storage occurs, and its effects upon the objects within that storage.
- Properly specify when pointers and expressions refer to storage while preserving the notion that they refer to objects (or functions).
- Specify that when control passes through the definition of a variable, storage is acquired, objects are created, and initialization is performed. Likewise, specify that exit from a scope, program, or thread causes objects within the storage to be destroyed (if any), and the storage to be released.

It's a big undertaking, but I'm excited to work on this and see what kind of feedback I get. However, this paper will be more of a long term project, since it will be touching the majority of the wording in the standard. I'll provide updates in future posts.

## Placement new during constant evaluation

A paper that I've been thinking about working on and finally got around to revolves around a new (heh) C++20 feature: `new` expressions are now able to be evaluated during constant evaluation (CE). While the storage they acquire must be released during the CE and it may only call the replaceable global allocation functions, it finally allows for the use of dynamically sized containers within a constant expression.

This is great! However, there is a restriction here that is completely avoidable. The function `std::construct_at` was introduced to allow for objects to be constructed as if by placement `new` -- nice, but we don't allow placement `new` to be used by itself. This is because a certain implementation can't resolve what object a `void*` points to during CE (thank you Tim Song for the info); and because CE is intended to always yield the same results on all implementations, `construct_at` is used to ensure the pointer type passed is always a pointer to object type. I think that *at the very least*, congruent placement `new` expressions should be allowed by  the principle of this being unnecessarily restrictive. As with all the other papers, I'll post progress  updates in a future post. I've drafted up some wording, and I plan to have this ready sometime around June.

# Information
If you want to get in touch with me, you can message me on the [Cpplang slack](http://slack.cpp.al/), or [shoot me an email](mailto:sdkrystian@gmail.com).
