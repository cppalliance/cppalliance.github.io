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
demonstrating how to annotate source code with the `BOOST_ASIO_HANDLER_LOCATION` macro. I have since followed up and 
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

{::nomarkdown}
<img class='card-img' src='/images/posts/richard/2020-09-01-handler-tracking-example.svg' alt='Handler Tracking Output'>
{:/}

The tool you need to do this is in the `asio` subproject of the Boost repo. The full path is 
`libs/asio/tools/handlerviz.pl`. The command is self-documenting but for clarity, the process would be like this:
* Compile and link your program with the compiler flag `-DBOOST_ASIO_ENABLE_HANDLER_TRACKING`
* run your program, capturing stdout to a file (say `mylog.txt`) (or you can pipe it to the next step)
* `handlerviz.pl < mylog.txt | dot -Tpng mygraph.png`
* You should now be able to view your graph in a web browser, editor or picture viewer.

The documentation for dot is [here](https://linux.die.net/man/1/dot) dot is usually available in the graphviz package 
of your linux distro/brew cask. Windows users can download an executable suite 
[here](https://www.graphviz.org/download/).

If you have written your own asynchronous operations to compliment Beast or Asio, or indeed you just wish you add your
handler locations to the graph output, you can do so by inserting the `BOOST_ASIO_HANDLER_LOCATION` macro just before
each asynchronous suspension point (i.e. just before the call to `async_xxx`). If you're doing this in an Asio 
`coroutine` (not to be confused with C++ coroutines) then be sure to place the macro in curly braces after the 
YIELD macro, for example:

```
    ...

    // this marks a suspension point of the coroutine
    BOOST_ASIO_CORO_YIELD
    {
        // This macro creates scoped variables so must be in a private scope
        BOOST_ASIO_HANDLER_LOCATION((           // note: double open brackets
            __FILE__, __LINE__,                 // source location
            "websocket::tcp::async_teardown"    // name of the initiating function
        ));

        // this is the initiation of the next inner asynchronous operation
        s_.async_wait(
            net::socket_base::wait_read,
                beast::detail::bind_continuation(std::move(*this)));

        // there is an implied return statement here
    }

    ...
```

When writing applications, people historically have used Continuation Passing Style when calling asynchronous 
operations, capturing a shared_ptr to the connection implementation in each handler (continuation).

When using this macro in user code with written in continuation passing style, you might do so like this:

```
void send_request(http::request<http::string_body> req)
{
    send_queue_.push_back(std::move(req));
    if (!sending_)
    {
        sending_ = true;
        maybe_initiate_send();
    }
}

void my_connection_impl::maybe_initiate_send()
{
    if (send_queue_.empty())
    {
        sending_ = false;
        return;
    }

    // assume request_queue_ is a std::deque so elements will have stable addresses
    auto& current_request = request_queue_.front(); 

    BOOST_ASIO_HANDLER_LOCATION((
        __FILE__, __LINE__,
        "my_connection_impl::maybe_initiate_send"
    ));

    // suspension point

    boost::beast::http::async_write(stream_, current_request_, 
        [self = this->shared_from_this()](boost::beast::error_code ec, std::size_t)
        {
            // continuation

            if (!ec)
            {
                self->request_queue_.pop_front();
                self->maybe_initiate_send();
            }
            else
            {
                // handle error
            }
        });
}
```


If you're using c++ coroutines it becomes a little more complicated as you want the lifetime of the tracking
state to be destroyed after the asynchronous initiation function but before the coroutine continuation:

```
namespace net = boost::asio;
namespace http = boost::beast::http;

auto connect_and_send(
    boost::asio::ip::tcp::socket& stream, 
    std::string host, 
    std::string port, 
    http::request<http::string_body> req) 
-> net::awaitable<void>
{
    namespace net = boost::asio;
    
    auto resolver = net::ip::tcp::resolver(co_await net::this_coro::executor);

    // suspension point coming up

    auto oresults = std::optional<net::awaitable<net::ip::tcp::resolver::results_type>>();
    {
        BOOST_ASIO_HANDLER_LOCATION((
            __FILE__, __LINE__,
            "my_connection_impl::connect_and_send"
        ));
        oresults.emplace(resolver.async_resolve(host, port, net::use_awaitable));
    }
    auto results = co_await std::move(*oresults);

    auto oconnect = std::optional<net::awaitable<net::ip::tcp::endpoint>>();
    {
        BOOST_ASIO_HANDLER_LOCATION((
            __FILE__, __LINE__,
            "my_connection_impl::connect_and_send"
        ));
        oconnect.emplace(net::async_connect(stream, results, net::use_awaitable));
    }
    auto ep = co_await *std::move(oconnect);

    // ... and so on ...

}
```

Which might look a little unwieldy compared to the unannotated code, which could look like this:

```
auto connect_and_send(
    boost::asio::ip::tcp::socket& stream, 
    std::string host, 
    std::string port, 
    http::request<http::string_body> req) 
-> net::awaitable<void>
{
    namespace net = boost::asio;
    
    auto resolver = net::ip::tcp::resolver(co_await net::this_coro::executor);

    auto ep = co_await net::async_connect(stream, 
                            co_await resolver.async_resolve(host, port, net::use_awaitable), 
                            net::use_awaitable);

    // ... and so on ...

}
``` 
