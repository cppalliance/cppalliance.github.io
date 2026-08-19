---
layout: post
nav-class: dark
categories: christian
title: Christian's Q3 2023 Update
author-id: christian
author-name: Christian Mazakas
---

Development on Unordered has been proceeding smoothly. Now that Boost libraries are permitted to drop C++03 support, Unordered has seen some long-needed cleanup. Unordered was able to drop dependencies on Tuple and TypeTraits which means packagers like vcpkg can now create smaller downloads for users.

In addition to this, a long-standing issue in Unordered was also fixed. We had committed the cardinal sin of storing raw pointers in the internals of the open-addressing containers. To this end, support for Allocators was only partially complete. With the latest Boost release, users will now be able to use Allocators which use fancy pointers such as those found in Boost.Interprocess with `boost::unordered_flat_map`.



