---
layout: post
nav-class: dark
categories: mohammad
title: Mohammad's Q2 2024 Update
author-id: mohammad
---

The following is an overview of some projects I have been working on in the last few months:


### Boost.Beast

Besides addressing user issues and typical bug fixes, here are a couple of contributions to the Boost.Beast project that I find interesting:

##### Deprecating `beast::ssl_stream` and `beast::flat_stream`

The `beast::flat_stream` was originally designed to consolidate buffer sequences into a single intermediate buffer, reducing the number of I/O operations required when writing these sequences to a stream that lacks scatter/gather support. However, after Asio improved the performance of write operations in [ssl::stream](https://www.boost.org/doc/libs/develop/doc/html/boost_asio/reference/ssl__stream.html) by [linearizing gather-write buffer sequences](https://github.com/chriskohlhoff/asio/commit/17637a48ccbfa2f63941d8393a7c8316a8df4a79), the necessity for `beast::ssl_stream` and `beast::flat_stream` has decreased. Their continued inclusion has caused confusion among new users and added unnecessary complexity to the documentation and code snippets. Consequently, these streams are now deprecated, and the use of `asio::ssl::stream` is recommended in the documentation, examples, and code snippets.

**Note:** Existing code will remain functional, as `beast::ssl_stream` has been redefined as a type that publicly inherits from `asio::ssl::stream`.

##### Simplifying C++20 Coroutine Examples

The latest Asio release introduces several changes that significantly reduce code complexity and noise. Previously, we had to redefine IO object types with an executor that has a default completion token type, like this:

```C++
using tcp_socket = asio::as_tuple_t<asio::deferred_t>::as_default_on_t<asio::ip::tcp::socket>;
```

With the new Asio release, `asio::deferred` is now the default completion token, eliminating the need to redefine IO objects with custom executors. Now, these work out of the box:

```C++
auto n = co_await http::async_read(stream, buffer, res);
// Or with a partial completion token:
auto [ec, n] = co_await http::async_read(stream, buffer, res, asio::as_tuple);
```

Using these features and the new [asio::cancel_after](https://www.boost.org/doc/libs/develop/doc/html/boost_asio/reference/cancel_after.html) functionality, all the C++20 coroutine examples in Beast have been refactored to be more concise and clear. Additionally, a `task_group` has been added to the [advanced_server_flex_awaitable](https://github.com/boostorg/beast/blob/develop/example/advanced/server-flex-awaitable/advanced_server_flex_awaitable.cpp) example to demonstrate a graceful shutdown process by propagating a cancellation signal to all session subtasks.

##### Adding New Fuzzing Targets

In this release, we addressed two bug reports that were caught by fuzzing the code: [#2879](https://github.com/boostorg/beast/pull/2879) and [#2861](https://github.com/boostorg/beast/pull/2861). Thanks to [tyler92](https://github.com/tyler92), we have added [several fuzzing targets](https://github.com/boostorg/beast/tree/develop/test/fuzz) to the project. These targets now fuzz the code with each pull request and at scheduled times throughout the day.


### Boost.Http.IO

As the [Http.Proto](https://github.com/cppalliance/http_proto) project continues to mature, we have begun enhancing the [Http.Io](https://github.com/cppalliance/http_io) examples to ensure our sans-io API aligns closely with the evolving requirements of the I/O layer. To start, I have introduced a basic [C++20 coroutine client example](https://github.com/cppalliance/http_io/blob/develop/example/client/flex_await), which will later be expanded into a tool similar to curl.


### Boost-Gecko

[Boost-Gecko](https://github.com/cppalliance/boost-gecko) now features a new index for the [learn section](https://www.boost.io/docs/) of the updated Boost website and a new crawler for [website-v2-docs](https://github.com/boostorg/website-v2-docs). This update allows users to search within the documentation in the learn section using the website's search dialog. The crawling process and index record uploads are automated through a GitHub [workflow](https://github.com/cppalliance/boost-gecko/blob/develop/.github/workflows/index_on_algolia.yml), requiring minimal maintenance for each Boost release.
