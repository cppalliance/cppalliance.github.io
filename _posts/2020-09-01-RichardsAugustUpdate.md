---
layout: post
nav-class: dark
categories: richard
title: Richard's August Update
author-id: richard
---

# New Debugging Feature in Asio and Beast

As covered previously, Boost 1.74 brought an implementation of the new unified executors model to Boost.Asio.

Support for this is not the only thing that is new in Beast. 

Chris Kohlhoff recently submitted a [PR](https://github.com/boostorg/beast/pull/2053) to Beast's repository 
demonstrating how to annotate source code with the BOOST_ASIO_HANDLER_LOCATION macro. I have since followed up and 
annotated all asynchronous operations in Beast this way.

In a normal build, there is no effect (and zero extra code generation). However, defining the preprocessor macro 
`BOOST_ASIO_ENABLE_HANDLER_TRACKING` will cause these macros to generate code which will emit handler tracking
log data to stdout in a very specific format.

The output is designed to describe the flow of asynchronous events in a format suitable for generating a visualisation
in linear terms. i.e. the asynchronous events are flattened and linked to show causality. 

Here is an example of the output:

```
@asio|1597543084.233257|>33|
@asio|1597543084.233273|33|deadline_timer@0x7fa6cac25218.cancel
@asio|1597543084.233681|33^34|in 'basic_stream::async_write_some' (../../../../../../boost/beast/core/impl/basic_stream.hpp:321)
@asio|1597543084.233681|33^34|called from 'async_write' (../../../../../../boost/asio/impl/write.hpp:331)
@asio|1597543084.233681|33^34|called from 'ssl::stream<>::async_write_some' (../../../../../../boost/asio/ssl/detail/io.hpp:201)
@asio|1597543084.233681|33^34|called from 'http::async_write_some' (../../../../../../boost/beast/http/impl/write.hpp:64)
@asio|1597543084.233681|33^34|called from 'http::async_write' (../../../../../../boost/beast/http/impl/write.hpp:223)
@asio|1597543084.233681|33^34|called from 'http::async_write(msg)' (../../../../../../boost/beast/http/impl/write.hpp:277)
@asio|1597543084.233681|33*34|deadline_timer@0x7fa6cac25298.async_wait
@asio|1597543084.233801|33^35|in 'basic_stream::async_write_some' (../../../../../../boost/beast/core/impl/basic_stream.hpp:373)
@asio|1597543084.233801|33^35|called from 'async_write' (../../../../../../boost/asio/impl/write.hpp:331)
@asio|1597543084.233801|33^35|called from 'ssl::stream<>::async_write_some' (../../../../../../boost/asio/ssl/detail/io.hpp:201)
@asio|1597543084.233801|33^35|called from 'http::async_write_some' (../../../../../../boost/beast/http/impl/write.hpp:64)
@asio|1597543084.233801|33^35|called from 'http::async_write' (../../../../../../boost/beast/http/impl/write.hpp:223)
@asio|1597543084.233801|33^35|called from 'http::async_write(msg)' (../../../../../../boost/beast/http/impl/write.hpp:277)
@asio|1597543084.233801|33*35|socket@0x7fa6cac251c8.async_send
@asio|1597543084.233910|.35|non_blocking_send,ec=system:0,bytes_transferred=103
@asio|1597543084.233949|<33|
@asio|1597543084.233983|<31|
@asio|1597543084.234031|>30|ec=system:89
@asio|1597543084.234045|30*36|strand_executor@0x7fa6cac24bd0.execute
@asio|1597543084.234054|>36|
@asio|1597543084.234064|<36|
@asio|1597543084.234072|<30|
@asio|1597543084.234086|>35|ec=system:0,bytes_transferred=103
@asio|1597543084.234100|35*37|strand_executor@0x7fa6cac24bd0.execute
@asio|1597543084.234109|>37|
@asio|1597543084.234119|37|deadline_timer@0x7fa6cac25298.cancel
@asio|1597543084.234198|37^38|in 'basic_stream::async_read_some' (../../../../../../boost/beast/core/impl/basic_stream.hpp:321)
@asio|1597543084.234198|37^38|called from 'ssl::stream<>::async_read_some' (../../../../../../boost/asio/ssl/detail/io.hpp:168)
@asio|1597543084.234198|37^38|called from 'http::async_read_some' (../../../../../../boost/beast/http/impl/read.hpp:212)
@asio|1597543084.234198|37^38|called from 'http::async_read' (../../../../../../boost/beast/http/impl/read.hpp:297)
@asio|1597543084.234198|37^38|called from 'http::async_read(msg)' (../../../../../../boost/beast/http/impl/read.hpp:101)
@asio|1597543084.234198|37*38|deadline_timer@0x7fa6cac25218.async_wait
@asio|1597543084.234288|37^39|in 'basic_stream::async_read_some' (../../../../../../boost/beast/core/impl/basic_stream.hpp:373)
@asio|1597543084.234288|37^39|called from 'ssl::stream<>::async_read_some' (../../../../../../boost/asio/ssl/detail/io.hpp:168)
@asio|1597543084.234288|37^39|called from 'http::async_read_some' (../../../../../../boost/beast/http/impl/read.hpp:212)
@asio|1597543084.234288|37^39|called from 'http::async_read' (../../../../../../boost/beast/http/impl/read.hpp:297)
@asio|1597543084.234288|37^39|called from 'http::async_read(msg)' (../../../../../../boost/beast/http/impl/read.hpp:101)
@asio|1597543084.234288|37*39|socket@0x7fa6cac251c8.async_receive
@asio|1597543084.234334|.39|non_blocking_recv,ec=system:35,bytes_transferred=0
@asio|1597543084.234353|<37|
@asio|1597543084.234364|<35|
@asio|1597543084.234380|>34|ec=system:89
@asio|1597543084.234392|34*40|strand_executor@0x7fa6cac24bd0.execute
@asio|1597543084.234401|>40|
@asio|1597543084.234408|<40|
@asio|1597543084.234416|<34|
@asio|1597543084.427594|.39|non_blocking_recv,ec=system:0,bytes_transferred=534
@asio|1597543084.427680|>39|ec=system:0,bytes_transferred=534
```

So far, so good. But not very informative or friendly to the native eye.

Fortunately as of Boost 1.74 there is a tool in the Asio source tree to convert this data into something consumable by the open source
tool dot, which can then output the resulting execution graph in one of a number of common graphical formats such as
PNG, BMP, SVG and many others.

Here is an example of a visualisation of a simple execution graph:

<img src="/images/posts/richard/2020-09-01-handler-tracking.svg">
