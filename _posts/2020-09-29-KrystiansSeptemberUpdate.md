---
layout: post
nav-class: dark
categories: krystian
title: Krystian's September Update
author-id: krystian
---

# Reviewing the review

The review period for Boost.JSON has come and gone, and we got some great feedback on the design of the library. Glancing over the results, it appears that the general mood was to accept the library. This doesn't mean that there weren't any problem areas -- most notably the documentation, which often did contain the information people wanted, but it was difficult to find. 

Other points of contention were the use of a push parser as opposed to a pull parser, the use of `double`, `uint64_t`, and `int64_t` without allowing for users to change them, and the value conversion interface. Overall some very good points were made, and I'd like to thank everyone for participating in the review.

# Customizing the build

I put a bit of work into improving our CI matrix, as it had several redundant configurations and did not test newer compiler versions (e.g. GCC 10, clang 11), nor did we have any 32-bit jobs. The most difficult thing about working on the build matrix is balancing how exhaustive it is with the turnaround time -- sure, we could add 60 configurations that test x86, x86-64, and ARM on every major compiler version released since 2011, but the turnaround would be abysmal. 

To alleviate this, I only added 32-bit jobs for the sanitizers that use a recent version of GCC. It's a less common configuration in the days of 64-bit universality, and if 64 bit works then it's highly likely that 32 bit will "just work" as well. 


Here's a table of the new Travis configurations that will be added:

|    Compiler   |  Library  | C++ Standard |   Variant  |       OS       | Architecture |        Job        |
|:-------------:|:---------:|:------------:|:----------:|:--------------:|:------------:|:-----------------:|
|      ---      |    ---    |      ---     |    Boost   | Linux (Xenial) |    x86-64    |   Documentation   |
|   gcc 8.4.0   | libstdc++ |      11      |    Boost   | Linux (Xenial) |    x86-64    |      Coverage     |
|  clang 6.0.1  | libstdc++ |    11, 14    |    Boost   | Linux (Xenial) |    x86-64    |      Valgrind     |
|  clang 11.0.0 | libstdc++ |      17      |    Boost   | Linux (Xenial) |    x86-64    | Address Sanitizer |
|  clang 11.0.0 | libstdc++ |      17      |    Boost   | Linux (Xenial) |    x86-64    |    UB Sanitizer   |
|   msvc 14.1   |   MS STL  |  11, 14, 17  |    Boost   |     Windows    |    x86-64    |        ---        |
|   msvc 14.1   |   MS STL  |    17, 2a    | Standalone |     Windows    |    x86-64    |        ---        |
|   msvc 14.2   |   MS STL  |    17, 2a    |    Boost   |     Windows    |    x86-64    |        ---        |
|   msvc 14.2   |   MS STL  |    17, 2a    | Standalone |     Windows    |    x86-64    |        ---        |
|   icc 2021.1  | libstdc++ |  11, 14, 17  |    Boost   | Linux (Bionic) |    x86-64    |        ---        |
|   gcc 4.8.5   | libstdc++ |      11      |    Boost   | Linux (Trusty) |    x86-64    |        ---        |
|   gcc 4.9.4   | libstdc++ |      11      |    Boost   | Linux (Trusty) |    x86-64    |        ---        |
|   gcc 5.5.0   | libstdc++ |      11      |    Boost   | Linux (Xenial) |    x86-64    |        ---        |
|   gcc 6.5.0   | libstdc++ |    11, 14    |    Boost   | Linux (Xenial) |    x86-64    |        ---        |
|   gcc 7.5.0   | libstdc++ |    14, 17    |    Boost   | Linux (Xenial) |    x86-64    |        ---        |
|   gcc 8.4.0   | libstdc++ |    17, 2a    |    Boost   | Linux (Xenial) |    x86-64    |        ---        |
|   gcc 9.3.0   | libstdc++ |    17, 2a    |    Boost   | Linux (Xenial) |    x86-64    |        ---        |
|   gcc 9.3.0   | libstdc++ |    17, 2a    | Standalone | Linux (Xenial) |    x86-64    |        ---        |
|   gcc 10.2.0  | libstdc++ |    17, 2a    |    Boost   |  Linux (Focal) |    x86-64    |        ---        |
|   gcc 10.2.0  | libstdc++ |    17, 2a    | Standalone |  Linux (Focal) |    x86-64    |        ---        |
|  gcc (trunk)  | libstdc++ |    17, 2a    |    Boost   |  Linux (Focal) |    x86-64    |        ---        |
|  gcc (trunk)  | libstdc++ |    17, 2a    | Standalone |  Linux (Focal) |    x86-64    |        ---        |
|  clang 3.8.0  | libstdc++ |      11      |    Boost   | Linux (Trusty) |    x86-64    |        ---        |
|  clang 4.0.0  | libstdc++ |    11, 14    |    Boost   | Linux (Xenial) |    x86-64    |        ---        |
|  clang 5.0.2  | libstdc++ |    11, 14    |    Boost   | Linux (Xenial) |    x86-64    |        ---        |
|  clang 6.0.1  | libstdc++ |    14, 17    |    Boost   | Linux (Xenial) |    x86-64    |        ---        |
|  clang 7.0.1  | libstdc++ |    17, 2a    |    Boost   | Linux (Xenial) |    x86-64    |        ---        |
|  clang 9.0.1  | libstdc++ |    17, 2a    |    Boost   | Linux (Xenial) |    x86-64    |        ---        |
|  clang 9.0.1  | libstdc++ |    17, 2a    | Standalone | Linux (Xenial) |    x86-64    |        ---        |
|  clang 10.0.1 | libstdc++ |    17, 2a    |    Boost   | Linux (Xenial) |    x86-64    |        ---        |
|  clang 10.0.1 | libstdc++ |    17, 2a    | Standalone | Linux (Xenial) |    x86-64    |        ---        |
|  clang 11.0.0 | libstdc++ |    17, 2a    |    Boost   | Linux (Xenial) |    x86-64    |        ---        |
|  clang 11.0.0 | libstdc++ |    17, 2a    | Standalone | Linux (Xenial) |    x86-64    |        ---        |
| clang (trunk) | libstdc++ |    17, 2a    |    Boost   | Linux (Xenial) |    x86-64    |        ---        |
| clang (trunk) | libstdc++ |    17, 2a    | Standalone | Linux (Xenial) |    x86-64    |        ---        |

I think it strikes a good balance between exhaustiveness and turnaround time, and we now test the most recent compiler versions to make sure they won't cause problems on the cutting edge.

# Binary size

It doesn't matter how good a library is if it's too big to use within your environment. As with all things in computer science, there is a trade-off between size and speed; seldom can you have both. We have been exploring options to reduce the size of the binary, and this mostly involved removing a lot of the pre-written tables we have (such as the ever-controversial jump table), since it allows the compiler to take into account the specific options it was past and optimize for those constraints (i.e. size and speed) rather than hard-coding in a set configuration as we did with the jump tables. 

Peter Dimov also helped out by transitioning our compile-time system of generating unique parse functions for each permutation of extensions to a runtime system, which drastically decreases the binary size without affecting performance too much. 

I must admit I'm not the biggest fan of these changes, but it's important to support the use of Boost.JSON in embedded environments. As Peter has said time and time again: don't overfit for a particular use-case or configuration.

Another place with room for improvement is with string to float-point conversions. Right now we calculate a mantissa and base-10 exponent, then lookup the value in a massive table that contains pre-calculated powers of 10 from 1e-308 to 1e+308. As you can surmise, this takes up a substantial amount of space (8 bytes * 618 elements = 4.95 kb). 

Here is a boiled down version of how we currently perform the conversion:

```cpp
double calculate_float(
    std::uint64_t mantissa, 
    std::uint32_t exponent, 
    bool sign)
{
    constexpr static double table[618] = 
    { 
        1e-308, 1e-307, 
        ..., 
        1e307, 1e308 
    };
    double power;
    if(exponent < -308 || exponent > 308)
        power = std::pow(10.0, exponent);
    else
        power = table[exponent + 308]
    double result = mantissa * power;
    return sign ? -result : result;
}
```

To further reduce the size of the binary, Peter suggested that we instead calculate `power` as `10^floor(exponent / 8) * 10^(exponent mod 8)`. Yes, the division operations there might look expensive, but any decent optimizing compiler will transform `exponent / 8` to `exponent >> 3`, and `exponent mod 8` to `exponent & 7`. This does introduce another multiplication instruction, but at the same time, it makes our table 8 times smaller. In theory, the slight drop in performance is worth the significant reduction in binary size.
   