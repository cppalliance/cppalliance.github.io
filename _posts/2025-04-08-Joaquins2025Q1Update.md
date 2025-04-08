---
layout: post
nav-class: dark
categories: joaquin
title: New Boost library proposal and a talk on how to make C++ ranges faster
author-id: joaquin
author-name: Joaquín M López Muñoz
---

During Q1 2025, I've been working in the following areas:

### Candidate Boost Bloom Library

During the entire quarter I've been working on a Boost proposal around Bloom filters:

* Repo: [https://github.com/joaquintides/bloom](https://github.com/joaquintides/bloom)
* Docs: [https://master.bloom.cpp.al/](https://master.bloom.cpp.al/)

Class template `boost::bloom::filter` can be configured to implement a classical Bloom filter
as well as variations discussed in the literature such as block filters, multiblock filters, and more.

```cpp
#include <boost/bloom/filter.hpp>
#include <cassert>
#include <string>

int main()
{
  // Bloom filter of strings with 5 bits set per insertion
  using filter = boost::bloom::filter<std::string, 5>;

  // create filter with a capacity of 1'000'000 **bits**
  filter f(1'000'000);

  // insert elements (they can't be erased, Bloom filters are insert-only)
  f.insert("hello");
  f.insert("Boost");
  //...

  // elements inserted are always correctly checked as such
  assert(f.may_contain("hello") == true);

  // elements not inserted may incorrectly be identified as such with a
  // false positive rate (FPR) which is a function of the array capacity,
  // the number of bits set per element and generally how the boost::bloom::filter
  // was specified
  if(f.may_contain("bye")) { // likely false
    //...
  }
}
```
The library is ready for official review, which I plan to ask for in April. Chris Mazakas
is helping with a very useful vcpkg registry so that future reviewers can
download and install candidate Boost.Bloom and dependencies with minimal hassle via vcpkg.

### Presentation at using std::cpp 2025

I prepared and presented the talk "Push is Faster" at the using std::cpp 2025 conference
in Madrid, March 19-21:

[https://github.com/joaquintides/usingstdcpp2025](https://github.com/joaquintides/usingstdcpp2025)

(The video of the talk will be publicly available in a few weeks.) We discussed
push and pull paradigms for sequential data processing, why C++ ranges are
not as fast as they could be, and an alternative design based on so-called
[transrangers](https://github.com/joaquintides/transrangers). If feedback is positive,
I may eventually grow the transrangers proof-of-concept library into a full-fledged
proposal for Boost.

### Boost.Unordered

* Reviewed [PR#299](https://github.com/boostorg/unordered/pull/299) from Chris Mazakas,
a complete migration of Boost.Unordered documentation to Antora. The new docs are multi-page
and generally much nicer looking. Great work, Chris!
* Retouched some aspects of the new Antora docs ([PR#303](https://github.com/boostorg/unordered/pull/303))
and filed some pending issues ([#304](https://github.com/boostorg/unordered/issues/304)).

### Boost.Promotion

* Posted a [tweet](https://x.com/Boost_Libraries/status/1884899485186400442) publicizing
Rubén Pérez's work on module support for Boost.
* Provided support to Rob Beeston for the creation of a Boost.Unordered poster to be
displayed at the upcoming WG21 meeting in Sofia, Bulgaria.

### Support to the community

* I've pre-reviewed Jean-Louis Leroy's
[Boost.OpenMethod](https://github.com/jll63/Boost.OpenMethod) proposal.
* Supporting the community as a member of the Fiscal Sponsorhip Committee (FSC). Asset
transfer from the Boost Foundation to the C++ Alliance is still being negotiated,
I hope all pending issues can be cleared up soon.
