---
layout: post
nav-class: dark
categories: krystian
title: Krystian's July Update
author-id: krystian
---

# What I've been doing

I've been spending a *lot* of time working on optimizing the parser; perhaps a bit too much. Nevertheless, it's very enjoyable and in doing so I've learned more than I could hope to ever learn in school. In addition to the optimization, comment and trailing comma support finally got merged, and I implemented UTF-8 validation (enabled by default, but it can be disabled).

## UTF-8 validation

Prior to implementing this extension (or rather, feature which can be disabled), the parser considers any character appearing within a string to be valid, so long as it wasn't a control character or formed an illegal escape. While this is _fast_, it technically does not conform to the JSON standard. 

As per Section 2 of the [JSON Data Interchange Syntax Standard](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf):

> A conforming JSON text is a sequence of Unicode code points that strictly conforms to the JSON grammar defined by this specification.

As with most standardese, this particular requirement for conformance is not outright stated, but rather implied. Anyways, that's enough standardese talk for this post.

After working on this parser so much, I've pretty much got the suspend/resume idiom we use nailed down, so integrating it with the string parsing function was trivial... the actual validation, not so much. I hadn't the slightest clue about any of the terminology used in the Unicode standard, so it took a good couple of hours to point myself in the right direction. Anyways, a lot of Googling and a messy python script for generating valid and invalid byte sequences later, I had something functional.

Then came my favorite part: optimization. 

The first byte within a UTF-8 byte sequence determines how many bytes will follow, as well as the valid ranges for these following bytes. Since this byte has such a large valid range, I settled on using a lookup table to check whether the first byte is valid.

Luckily, the following bytes have ranges that can be trivially checked using a mask. For example, if the first byte is `0xE1`, then the byte sequence will be composed of three bytes, the latter two having a valid range of `0x80` to `0xBF`. Thus, our fast-path routine to verify this sequence can be written as:

```cpp
uint32_t v;
// this is reversed on big-endian
std::memcpy(&v, bytes, 4); // 4 bytes load

switch (lookup_table[v & 0x7F]) // mask out the most significant bit
{
...
case 3:
	if ((v & 0x00C0C000) == 0x00808000)
		return result::ok;
	return result::fail;
...
}
```

This works well for all but one byte sequence combination. For whatever reason, UTF-8 byte sequences that start with `0xF0` can have a second byte between `0x90` and `0xBF` which requires the check to be done as:

```cpp
(v & 0xC0C0FF00) + 0x7F7F7000 <= 0x00002F00
```

It's a weird little outlier that I spent way too much time trying to figure out.

Since our parser supports incremental parsing, we only take the fast path if the input stream has four or more bytes remaining. If this condition isn't met, we have to check each byte individually. It's slower, but shouldn't happen often.

## Other optimizations

I've been trying out a number of different optimizations to squeeze all the performance we can get out of the parser. Most recently, I rewrote the parser functions to take a `const char*` parameter indicating the start of the value, and return a pointer to the end of the value (if parsing succeeds) or `nullptr` upon failure or partial parsing. 

Since I'm not great at explaining things, here's the before:

```cpp
result parse_array(const_stream&);
```

and here's the after:

```cpp
const char* parse_array(const char*);
```

This allows us to keep the pointer to the current position in the stream entirely within the registers when parsing a document. Since the value is local to the function, the compiler no longer needs to write it to the `const_stream` object at the top of the call stack (created within `basic_parser::write_some`), nor read it each time a nested value is parsed. This yields an *8%* boost in performance across the board.

More time was spent optimizing the SSE2 functions used for parsing unescaped strings and whitespace as well. Within `count_whitespace`, we were able to get rid of a `_mm_cmpeq_epi8` (`PCMPEQB`) instruction by performing a bitwise or with 4 after testing for spaces, and then comparing the result with `'\r'`, as the ASCII value of tab (`'\t'`) only differs from that of the carriage return by the third least significant bit. This was something that clang was doing for us, but it's nice to implement it for all other compilers. 

For `count_unescaped` (used to parse unescaped strings), we were able to again reduce the length of the hot path, this time a bit more significantly. Instead of checking for control characters by means of relational comparison, we can instead check for quotes and backslash first, and once that's done, the `_mm_min_epu8` (`PMINUB`) instruction can be used to set all control characters (0 - 31) to 31, and then test for equality. This brought our performance on the `strings.json` benchmark past the 8 GB/s mark from around 7.7 GB/s. Combined with the optimization of how the stream pointer is passed around, we now hit just a hair under 8.5 GB/s on this benchmark. 

## The important but boring stuff

After merging the parser extensions, there was a bunch of housekeeping to do such as improving coverage and writing documentation. Though these are far from being my favorite tasks, they are integral to writing a good library, so it must be done. My initial approach to writing tests for the parser extensions was to run each test on every parser configuration we have, but this soon proved to be a nonoptimal approach when the time taken to run the test suite quadrupled. I ended up doing the right thing by making the tests more surgical in nature, and in doing so we even got 100% coverage on the parser. 
