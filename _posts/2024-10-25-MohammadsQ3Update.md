---
layout: post
nav-class: dark
categories: mohammad
title: Boost.Http.Proto Project Highlights
author-id: mohammad
---

Here’s a look at some recent projects I've been focusing on:

### Boost.Http.Proto

#### Parsing Chunked Bodies

The `http_proto::parser` uses a circular buffer internally, which sometimes causes HTTP message bodies to span across two buffers. Previously, this required copying data into a temporary buffer for chunked parsing, ensuring continuous memory access. To address this, I introduced a `chained_sequence` abstraction, which lets two buffers appear as a single, contiguous buffer without the need for copying. This approach streamlines the parser implementation and improves efficiency by reducing memory operations. Iterating over `chained_sequence` is nearly as fast as iterating over a single range because it requires only a single comparison per iteration.

#### gzip/deflate Support

One goal for `Http.Proto` is to offer optional support for compression algorithms like gzip, deflate, and brotli, keeping dependencies optional. This allows flexibility, as users may not need compression or might lack libraries like Zlib on their platform. To enable this, we introduced an optional Zlib interface within `http_proto`, allowing gzip/deflate support in `http_proto::parser` without mandatory linking. Now, the parser can read the `Content-Encoding` field and apply the necessary decoding if a suitable compression service is available.

### Boost.Http.Io

Following updates in `Http.Proto`, I refactored the [C++20 coroutine client example](https://github.com/cppalliance/http_io/blob/develop/example/client/flex_await) in `Http.Io`. The client now requests with `Accept-Encoding: gzip, deflate` and decodes responses accordingly. It also includes basic redirect support and streams the response body piece by piece to standard output, allowing it to handle large file downloads.

### Boost.Beast

Alongside routine bug fixes and responses to user-reported issues, here are a few notable changes in the Boost.Beast project:

- **`beast::basic_parser` Enhancement**: A new `trailer_fields` state was added for parsing trailer fields in chunked HTTP message bodies. This state respects user-defined `header_limit` settings and provides appropriate error messages when limits are exceeded.
- **Error Handling in `basic_fields`**: `basic_fields` interfaces now include an overload that accepts a `system::error_code` instead of throwing exceptions. This enables parsers to report insertion errors directly to the caller.
- **`skip_` Variable Removal**: The parser previously used a state variable `skip_` to track parsed characters in `CRLF` processing within chunk headers. Benchmarks showed that removing `skip_` improves performance, as the parser can find `CRLF` directly within the buffer. This change has also simplified the parser's implementation.
- **Forward-Declared Headers for `beast::http`**: New forward-declared headers are now available for all types in the `beast::http` namespace, enabling users to separate implementation and usage sites more effectively by including only the necessary `*_fwd` headers.
