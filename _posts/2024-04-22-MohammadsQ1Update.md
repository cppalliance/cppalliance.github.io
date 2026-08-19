---
layout: post
nav-class: dark
categories: mohammad
title: Mohammad's Q1 2024 Update
author-id: mohammad
---

The following is an overview of some projects I have been working on in the last few months:

### Boost.Beast

Aside from addressing user issues and typical bug fixes within the project, this quarter I primarily focused on:

- Resolving platform and compiler specific warnings.
- Rectifying SSL builds in CI.
- Documenting certain pitfalls and subtleties in some operations.


### Boost.Http.Proto and Boost.Buffers

I've recently started contributing to the [Http.Proto](https://github.com/cppalliance/http_proto) project. My contributions focus on refining the serializer's handling of algorithms capable of generating body contents directly within the serializer's internal buffer in one or multiple steps, for example, for sending the contents of a file as an HTTP message without relying on an external buffer. Additionally, I've converted the documentation in Boost.Buffers to Asciidoc format and leveraged [MrDocs](https://github.com/cppalliance/mrdocs) for documentation generation instead of Doxygen.


### Boost-Gecko

I've made some changes to [Boost-Gecko](https://github.com/cppalliance/boost-gecko) so it can utilize all the cores on the machine that is running on, which made the crawling operation way faster. In the next step, I added a Github workflow for the indexing operation, so now it can automatically crawl the latest version of Boost libraries documentation and upload them to Algolia.
