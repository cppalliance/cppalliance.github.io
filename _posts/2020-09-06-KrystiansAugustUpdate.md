---
layout: post
nav-class: dark
categories: krystian
title: Krystian's August Update
author-id: krystian
---

# Boost.JSON

Boost.JSON is officially scheduled for review! It starts on September 14th, so there isn't much time left to finish up polishing the library -- but it looks like we will make the deadline.

## Optimize, optimize, optimize

Boost.JSON's performance has significantly increased in the past month. The change to the parsing functions where we pass and return `const char*` instead of `result` (detailed in my last post) was merged, bringing large gains across the board. After this, my work on optimizing `basic_parser` was complete (for now...), save for a few more minor changes:

- The handler is stored as the first data member as opposed to passing a reference to each parse function. This means that the `this` pointer for `basic_parser` is the `this` pointer for the handler, which eliminates some register spills.

- The parser's depth (i.e. nesting level of objects/arrays) is now tracked as `max_depth - actual_depth`, meaning that we don't have to read `max_depth` from memory each time a structure is parsed.

- `parse_string` was split into two functions: `parse_unescaped` and `parse_escaped`. The former is much cheaper to call as it doesn't have to store the string within a local buffer, and since unescaped strings are vastly more common in JSON documents, this increases performance considerably. 

### The DOM parser

Our old implementation of `parser` was pretty wasteful. It stored state information (such as whether we were parsing an object or array), keys, and values, all on one stack. This proved to be quite a pain when it came to unwinding it and also required us to align the stack when pushing arrays and objects. 

Several months ago, Vinnie and I tried to figure out how to make the homogeneous but came to a dead end. I decided to revisit the idea, and after some experimentation, it became apparent that there was a *lot* of redundancy in the implementation. For example, `basic_parser` already keeps track of the current object/array/string/key size, so there is no reason to so within `parser`. The state information we were tracking was also not needed -- `basic_parser` already checks the syntactic correctness of the input. That left one more thing: strings and keys. 

My rudimentary implementation required two stacks: one for keys and strings, and the other for values. Other information, such as the sizes of objects and arrays, were obtained from `basic_parser`. My implementation, though primitive, gave some promising results on the benchmarks: up to 10% for certain documents. After some brainstorming with Vinnie, he had the idea of storing object keys as values; the last piece of the puzzle we needed to make this thing work.

His fleshed-out implementation was even faster. In just a week's time, Boost.JSON's performance increased by some 15%. I'm still working on the finishing touches, but the results are looking promising.

## More UTF-8 validation malarkey

Out of all the things I've worked on, nothing has proved as frustrating as UTF-8 validation. The validation itself is trivial; but making it work with an incremental parser is remarkably difficult. Shortly after merging the feature, [an issue was opened](https://github.com/CPPAlliance/json/issues/162); while validation worked just fine when a document was parsed without suspending, I neglected to write tests for incremental parsing, and that's precisely where the bug was. Turns out, if parsing suspended while validating a UTF-8 byte sequence, the handler just would not be called. 

This was... quite a problem to say the least, and required me to reimplement UTF-8 validation from scratch -- but with a twist. We don't want to pass partial UTF-8 sequences because it just transfers the burden of assembling incomplete sequences to the handler. This means that we need to store the sequences, append to them until we get a complete codepoint, and only then can we validate and send it off to the handler. Doing this in an efficient manner proved to be quite challenging, so I ended up with a "fix" that was 50% code and 50% `// KRYSTIAN TODO: this can be optimized`. The tests provided in the issue finally passed, so the patch was merged. 

I thought my woes with validation were over, but I was wrong. Just over a week later, a new issue rolled in:

[Handler not invoked correctly in multi-byte UTF8 sequences, part 2](https://github.com/CPPAlliance/json/issues/162)

Luckily, fixing this didn't require another rewrite. This taught me a fine lesson in exhaustive testing.
