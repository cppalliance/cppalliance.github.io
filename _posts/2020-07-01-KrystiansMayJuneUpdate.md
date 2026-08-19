---
layout: post
nav-class: dark
categories: krystian
title: Krystian's May & June Update
author-id: krystian
---

# Overview

I've been very busy these last two months getting Boost.JSON ready for release, hence the combined blog post. Now that things are winding down, I hopefully can get back the normal blog release schedule.

# Boost.JSON

Aside from a couple of personal projects, the vast majority of my time was spent getting Boost.JSON set for release. Breaking it down, this consisted of three main tasks: a `tag_invoke` based `value` conversion interface, parser optimizations, and support for extended JSON syntax.

## Value Conversion

Our previous interface that allowed users to specify their own conversions to and from `value` proved unsatisfactory, as it required too much boiler-plate when specifying conversions to and from non-class types (e.g. enumeration types). To remedy this, I was tasked with implementing an ADL solution based on `tag_invoke` which greatly reduces the amount of boiler-plate and provides a single, straightforward way to implement a custom conversion. For example, consider the following class type:

```cpp
struct customer
{
	std::string name;
	std::size_t balance;
};
```

To convert an object of type `customer` to `value`, all you need is to write an overload of `tag_invoke`. This can be implemented as an inline `friend` function within the class definition (thus making it visible to ADL but not unqualified lookup; see [[basic.lookup.argdep] p4.3]](http://eel.is/c++draft/basic.lookup.argdep#4.3)), or as a free function:

```cpp
void tag_invoke(value_from_tag, value& jv, const customer& c)
{
	object& obj = jv.emplace_object();
	obj["name"] = c.name;
	obj["balance"] = c.balance;
}
```

Note that a reference to `value` is passed to the function performing the conversion. This ensures that the `storage_ptr` passed to the calling function (i.e. `value_from(T&&, storage_ptr)`) is correctly propagated to the result.

Conversions from `value` to a type `T` are specified in a similar fashion:

```cpp
customer tag_invoke(value_to_tag<customer>, const value& jv)
{
	return customer{
		value_to<std::string>(jv.at("name"])), 
		jv.at("balance").as_uint64() 
	};
}
```

In addition to user-provided `tag_invoke` overloads, generic conversions are provided for container-like, map-like, and string-like types, with obvious results. In general, if your container works with a range-based for loop, it will work with `value_from` and `value_to` without you having to write anything.

## Parser Optimizations

Optimizing the parser was a side-project turned obsession for me. While it's often a painfully tedious process of trying an idea, running benchmarks, and being disappointed with the results, the few times that you get a performance increase makes it all worth it.

To preface, Boost.JSON is unique in that it can parse incrementally (no other C++ libraries implement this). However, incremental parsing is considerably slower than parsing a JSON document in its entirety, as a stack must be maintained to track which function the parser should resume to once more data is available. In addition to this, the use cases for incremental parsing will often involve bottlenecks much more significant than the speed of the parser. With this in mind, Boost.JSON's parser is optimized for non-incremental parsing of a valid JSON document. The remainder of this post will be written without consideration for incremental parsing.

Most of the optimizations were branch eliminations, such as removing branches based on call site preconditions. These yield small performance gains, but once compounded we saw a performance increase of up to 7% on certain benchmarks. The biggest gain in this category came from removing a large switch statement in `parse_value` in favor of a manually written jump table. Making this function branchless significantly increases performance as it's the most called function when parsing. This also makes the function very compact, meaning it can be inlined almost everywhere. 

In addition to benchmark driven optimization, I also optimized based on codegen. Going into it I really had no idea what I was doing, but after staring at it for a long time and watching some videos I got the hang of it. I used this method to optimize `parse_array` and `parse_object`, aiming to get the most linear hot path possible, with the fewest number of jumps. It took a few hours, but I was able to reach my target. This was done by moving some branches around, removing the `local_const_stream` variable, and adding some optimization hints to various branches. In addition to this, the `std::size_t` parameter (representing the number of elements) was removed from the `on_array_end` and `on_object_end` handlers as it didn't provide any useful information and is not used by `parser`. This yielded a performance increase of up to 4% in certain cases.

The last major optimization was [suggested](https://github.com/CPPAlliance/json/issues/115) by [Joaquín M López Muñoz](https://github.com/joaquintides). In essence, integer division is a slow operation, so compilers have all sorts of ways to avoid it; one of which is doing multiplication instead. When dividing by a constant divisor, the compiler is able to convert this to multiplication by the reciprocal of the divisor, which can be up to 20 times faster. Where this is applicable in Boost.JSON is in the calculation used to get the index of the bucket for a `object` key. The implementation was pretty straightforward, and it yielded up to a 10% increase in performance for `object` heavy benchmarks -- a remarkable gain from such a small change. Thank you Joaquín :)

## Parser Extensions

The last major thing I worked on for Boost.JSON was implementing support for extended JSON syntaxes. The two supported extensions are: - allowing C and C++ style comments to appear within whitespace, and 
- allowing trailing commas to appear after the last element of an array or object. 
This post isn't quite in chronological order, but comment support was my introduction into working on the parser (a trial by fire). After a few naive attempts at implementation, the result was comment parsing that did not affect performance at all when not enabled (as it should) and only has a minor impact on performance when enabled. This was done by building off existing branches within `parse_array` and `parse_object` instead of checking for comments every time whitespace is being parsed. Allowing for trailing commas was done in much the same way. The larger takeaway from implementing these extensions was getting to know the internals of the parser much better, allowing me to implement the aforementioned optimizations, as well as more complex extensions in the future. 

If you want to get in touch with me, you can message me on the [Cpplang slack](http://slack.cpp.al/), or [shoot me an email](mailto:sdkrystian@gmail.com).