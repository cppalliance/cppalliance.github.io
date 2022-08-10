---
layout: post
nav-class: dark
categories: richard
title: Richard's August Update
author-id: richard
---

# Beast and HTTP Redirect

Some months ago, I was asked how to handle HTTP redirect responses in beast.
Characteristically, I took a moment to model how I would do that in my head, waved my hands and kind of explained it and 
that was that.

Then more recently, someone else asked how beast websockets would handle a redirect response when performing a websocket 
handshake. Now I'm pretty sure that websocket clients have no requirement at all to follow redirects. I believe the 
WebSocket specification does not allow for such things, but I thought it would be an interesting exercise to cover the 
topic and provide a working code example and cover it in a blog post. 

There are a few reasons I decided to do this:
- Redirects are going to be important for any client-side framework written on Beast.
- There are a few new features in Asio which I thought it would be interesting to showcase.

## Code Repositiory

The code for this blog can be found [here](https://github.com/madmongo1/blog-2022-Aug-websock-redirect).
I have tested it on Fedora 36 and GCC-12. The code requires at least boost-1.80.0.beta1, because it takes advantage of 
the new change in Asio, which allows the deferred object returned by the `asio::deferred` completion token to be 
directly `co_await`ed. This provides a significant improvement in performance for operations that don't need the full
functionality of the `asio::awaitable<>` type.

## Handling a Redirect - General Case

Redirects can be followed with the following generalised algorithm:

```

set redirect count to 0

while not connected, no egregious errors and redirect limit has not been exceeded:

  crack URL
  resolve the FQDN of the host specified in the URL
  connect to the host
  
  if URL indicates HTTPS:
    negotiate TLS
  endif
  
  send http request (upgrade request for websocket)
  
  await response
  
  if response is 200ish:
    exit success
  elseif response is redirect:
    increment redirect count
    update URL with data found in Location header field
    continue
  else
    exit error
  endif
  
endwhile 

```

## Handling a Redirect in C++ with Beast

It turns out that the entire process can be handled in one coroutine. 
Now remember that an HTTP connection can redirect to an HTTPS connection. So the "connection" type returned from a 
coroutine that creates a connection, having taken into account any redirects, must handle both transport types.

It's worth mentioning at this point that if you're writing for a modern Linux kernel, TLS is now supported natively
by the berkley sockets interface. This means that programs need no longer generate one code path for SSL and one for
TCP. If this is interesting to you, there is some documentation [here](https://www.kernel.org/doc/html/v5.12/networking/tls.html).
When I get a moment I will create a modified copy of this program that uses Kernel TLS. However, for now, we do it the
old-fashioned portable way.

### A connection abstraction

First we define some useful types for our variant implementation
```cpp
struct websock_connection
{
    using ws_stream  = beast::websocket::stream< tcp::socket >;
    using wss_stream = beast::websocket::stream< ssl::stream< tcp::socket > >;
    using var_type   = boost::variant2::variant< ws_stream, wss_stream >;
```
...provide TLS and SSL constructors...

```cpp
    websock_connection(tcp::socket sock)
    : var_(ws_stream(std::move(sock)))
    {
    }

    websock_connection(ssl::stream< tcp::socket > stream)
    : var_(wss_stream(std::move(stream)))
    {
    }
```

...provide access to the underlying (optional) SSL and TCP streams...

```cpp
    tcp::socket &
    sock();

    ssl::stream< tcp::socket > *
    query_ssl();

```

... provide functions that return awaitables for the high level functions we will need...

```cpp
    asio::awaitable< void >
    try_handshake(error_code                      &ec,
                  beast::websocket::response_type &response,
                  std::string                      hostname,
                  std::string                      target);

    asio::awaitable< std::size_t >
    send_text(std::string const &msg);

    asio::awaitable< std::string >
    receive_text();

    asio::awaitable< void >
    close(beast::websocket::close_reason const &reason);
    
```
...and finally the implementation details...
```cpp
    var_type           var_;
    beast::flat_buffer rxbuffer_;
};
```
The implementation of the various member functions are then all defined in terms of `visit`, e.g.:

```cpp
asio::awaitable< std::size_t >
websock_connection::send_text(std::string const &msg)
{
    using asio::use_awaitable;

    return visit(
        [&](auto &ws)
        {
            ws.text();
            return ws.async_write(asio::buffer(msg), use_awaitable);
        },
        var_);
}
```
Note that this function is not actually a coroutine. Since it doesn't maintain any state during the async operation, 
the function can simply return the `awaitable` to the calling coroutine. This saves the creation of a coroutine frame
when we don't need it.

The interface and implementation for this class can be found in `websocket_connection.[ch]pp` in the git repo linked 
above.

### Moveable `ssl::stream`?

You may have noticed something in this constructor:
```cpp
    websock_connection(ssl::stream< tcp::socket > stream)
    : var_(wss_stream(std::move(stream)))
    {
    }
```
I have `std::move`'d the ssl stream into the WebSocket stream. Until a few versions ago, asio ssl streams were not 
moveable, which caused all kinds of issues when wanting to, for example, upgrade an SSL stream connection to a secure 
websocket stream.

The Beast library has two workarounds for this:
1. Beast provides its own version of ssl::stream, and
2. `beast::websocket::stream` has a specialisation defined which holds a reference to a stream.

These are probably now un-necessary and could arguably be deprecated.  

## The algorithm in C++20

```cpp
asio::awaitable< std::unique_ptr< websock_connection > >
connect_websock(ssl::context &sslctx,
                std::string   urlstr,
                int const     redirect_limit = 5)
{
    using asio::experimental::deferred;

    // for convenience, take a copy of the current executor
    auto ex = co_await asio::this_coro::executor;

    // number of redirects detected so far
    int redirects = 0;

    // build a resolver in order tp decode te FQDNs in urls
    auto resolver = tcp::resolver(ex);

    // in the case of a redirect, we will resume processing here
again:
    fmt::print("attempting connection: {}\n", urlstr);

    // decode the URL into components
    auto decoded = decode_url(urlstr);
```
This part of the code builds a unique pointer to an initialised `websocket_connection` object, initialised with either 
an SSL stream or a TCP stream as indicated by the result of cracking the URL. For brevity I have used a regex to crack 
the URL, but you should check out Vinnie Falco's new Boost.URL candidate library [here](https://github.com/CPPAlliance/url).
Vinnie will be looking for reviewers during this library's submission to Boost later this month, so do keep an eye out
in the Boost mailing list.

```cpp
    // build the appropriate websocket stream type depending on whether the URL
    // indicates a TCP or TLS transport
    auto result = decoded.transport == transport_type::tls
                      ? std::make_unique< websock_connection >(
                            ssl::stream< tcp::socket >(ex, sslctx))
                      : std::make_unique< websock_connection >(tcp::socket(ex));

```

Here we are awaiting a connect operation with the result of awaiting a resolve operation. Note the use of 
`asio::experimental::deferred`. `deferred` is quite a versatile completion token which can be used to:
- return an lightweight awaitable, as demonstrated here,
- return a function object which may be later called multiple times with another completion handler; 
  effectively creating a curried initiation,
- be supplied with a completion handler up front in order to create a deferred sequence of chained asynchronous 
  operations; allowing simple composed operations to be built quickly and easily.

```cpp
    // connect the underlying socket of the websocket stream to the first
    // reachable resolved endpoint
    co_await asio::async_connect(
        result->sock(),
        co_await resolver.async_resolve(
            decoded.hostname, decoded.service, deferred),
        deferred);
```

In the case that the endpoint we are connecting to is secure, we must do the SSL/TLS handshake:

```cpp
    // if the connection is TLS, we will want to update the hostname
    if (auto *tls = result->query_ssl(); tls)
    {
        if (!SSL_set_tlsext_host_name(tls->native_handle(),
                                      decoded.hostname.c_str()))
            throw system_error(
                error_code { static_cast< int >(::ERR_get_error()),
                             asio::error::get_ssl_category() });
        co_await tls->async_handshake(ssl::stream_base::client, deferred);
    }

    // some variables to receive the result of the handshake attempt
    auto ec       = error_code();
    auto response = beast::websocket::response_type();
```
The function try_handshake simply initiates the form of websocket handshake operation which preserves the 
http response returned from the server. We will need this in case the websocket connection response is actually a
redirect.

```cpp
    // attempt a websocket handshake, preserving the response
    fmt::print("...handshake\n");
    co_await result->try_handshake(
        ec, response, decoded.hostname, decoded.path_etc);

    // in case of error, we have three scenarios, detailed below:
    if (ec)
    {
        fmt::print("...error: {}\n{}", ec.message(), stitch(response.base()));
        auto http_result = response.result_int();
        switch (response.result())
        {
```

And here is the code that handles the actual redirect. Note that in this simplistic implementation, I am replacing the
URL with the `Location` field in the web server's response. In reality, the returned URL could be a relative URL which 
would need to be merged into the original URL. [Boost.URL](https://github.com/CPPAlliance/url) handles this nicely. 
Once that library is available I'll upgrade this example.

```cpp
        case beast::http::status::permanent_redirect:
        case beast::http::status::temporary_redirect:
        case beast::http::status::multiple_choices:
        case beast::http::status::found:
        case beast::http::status::see_other:
        case beast::http::status::moved_permanently:
            //
            // Scenario 1: We have been redirected
            //
            if (response.count(beast::http::field::location))
            {
                if (++redirects <= redirect_limit)
                {
                    // perform the redirect by updating the URL and jumping to
                    // the goto label above.
                    auto &loc = response[beast::http::field::location];
                    urlstr.assign(loc.begin(), loc.end());
                    goto again;
                }
                else
                {
                    throw std::runtime_error("too many redirects");
                }
            }
            else
            {
                //
                // Scenario 2: we have some other HTTP response which is not an
                // upgrade
                //
                throw system_error(ec,
                                   stitch("malformed redirect\r\n", response));
            }
            break;

        default:
            //
            // Scenario 3: Some other transport error
            //
            throw system_error(ec, stitch(response));
        }
    }
    else
    {
        //
        // successful handshake
        //
        fmt::print("...success\n{}", stitch(response.base()));
    }

    co_return result;
}
```

So with that written, all we need to do is write a simple coroutine to connect, chat and disconnect in order to test:

```cpp
asio::awaitable< void >
comain(ssl::context &sslctx, std::string initial_url)
{
    auto connection = co_await connect_websock(sslctx, initial_url, 6);
    co_await echo(*connection, "Hello, ");
    co_await echo(*connection, "World!\n");
    co_await connection->close(beast::websocket::close_reason(
        beast::websocket::close_code::going_away, "thanks for the chat!"));
    co_return;
}
```

## A Simple Http/WebSocket Server

In order to test this code, I put together a super-simple web server, which is included in the repo and run as part of
the demo program.

This web server runs two coroutines, each with its own acceptor. One is the acceptor for HTTP/WS connections and the other
is for HTTPS/WSS connections. Of course I could have used beast's 
[flex helper](https://www.boost.org/doc/libs/1_79_0/libs/beast/doc/html/beast/ref/boost__beast__async_detect_ssl.html) 
to auto-deduce WS/WSS on the same port, but I wanted to keep the implementation as simple as possible.

The HTTP server is very simple. All it does is redirect the caller to the same `Target` on the WSS server:

```cpp
asio::awaitable< void >
serve_http(tcp::socket sock, std::string https_endpoint)
{
    using asio::experimental::deferred;

    auto rxbuf  = beast::flat_buffer();
    auto parser = beast::http::request_parser< beast::http::empty_body >();
    co_await beast::http::async_read(sock, rxbuf, parser, deferred);

    static const auto re      = std::regex("(/websocket-\\d+)(/.*)?",
                                      std::regex_constants::icase |
                                          std::regex_constants::optimize);
    auto              match   = std::cmatch();
    auto             &request = parser.get();
    if (std::regex_match(
            request.target().begin(), request.target().end(), match, re))
    {
        co_await send_redirect(
            sock, fmt::format("{}{}", https_endpoint, match[0].str()));
    }
    else
    {
        co_await send_error(
            sock,
            beast::http::status::not_found,
            fmt::format("resource {} is not recognised\r\n",
                        std::string_view(request.target().data(),
                                         request.target().size())));
    }
}
```

The WSS server is minutely more complex. It looks for a URL of the form `/websocket-(\d+)(/.*)?` where group 1 is the 
"index number" of the request. If the index number is 0, the websocket request is accepted and we head off into a chat
coroutine for the remainder of the connection. If it is non-zero, then the index is decremented, the URL is 
reconstructed with the new index, and the redirect response is sent back.

So if for example you requested `http://some-server/websocket-2/bar`, you would be redirected along the following path:
- `https://some-server/websocket-2/bar` (first http to https transition)
- `https://some-server/websocket-1/bar`
- `https://some-server/websocket-0/bar` (websocket handshake accepted on this URL)

Here's the code:

```cpp
asio::awaitable< void >
serve_https(ssl::stream< tcp::socket > stream, std::string https_fqdn)
{
    try
    {
        using asio::experimental::deferred;

        co_await stream.async_handshake(ssl::stream_base::server, deferred);

        auto rxbuf   = beast::flat_buffer();
        auto request = beast::http::request< beast::http::string_body >();
        co_await beast::http::async_read(stream, rxbuf, request, deferred);

        auto &sock = stream.next_layer();
        if (beast::websocket::is_upgrade(request))
        {
            static const auto re = std::regex(
                "/websocket-(\\d+)(/.*)?",
                std::regex_constants::icase | std::regex_constants::optimize);
            auto match = std::cmatch();
            if (std::regex_match(request.target().begin(),
                                 request.target().end(),
                                 match,
                                 re))
            {
                auto index = ::atoi(match[1].str().c_str());
                if (index == 0)
                {
                    auto wss =
                        beast::websocket::stream< ssl::stream< tcp::socket > >(
                            std::move(stream));
                    co_await wss.async_accept(request, deferred);
                    co_await run_echo_server(wss, rxbuf);
                    // serve the websocket
                }
                else
                {
                    // redirect to the next index down
                    auto loc = fmt::format("{}/websocket-{}{}",
                                           https_fqdn,
                                           index - 1,
                                           match[2].str());
                    co_await send_redirect(stream, loc);
                }
            }
            else
            {
                co_await send_error(stream,
                                    beast::http::status::not_found,
                                    "try /websocket-5\r\n");
            }
        }
        else
        {
            co_await send_error(
                stream,
                beast::http::status::not_acceptable,
                "This server only accepts websocket requests\r\n");
        }
    }
    catch (system_error &e)
    {
        fmt::print("serve_https: {}\n", e.code().message());
    }
    catch (std::exception &e)
    {
        fmt::print("serve_https: {}\n", e.what());
    }
```

The `run_echo_server` coroutine is about as simple as it gets. Note the use of `deferred` as a completion token in order
to create the lightweight awaitable type.

```cpp
asio::awaitable< void >
run_echo_server(beast::websocket::stream< ssl::stream< tcp::socket > > &wss,
                beast::flat_buffer                                     &rxbuf)
{
    using asio::experimental::deferred;

    for (;;)
    {
        auto size = co_await wss.async_read(rxbuf, deferred);
        auto data = rxbuf.cdata();
        co_await wss.async_write(data, deferred);
        rxbuf.consume(size);
    }
}
```

## An Example of Cancellation

The server is trivial, but there is one little feature I wanted to demonstrate.

The purpose of the demo is:
- spin up a web server
- connect to the web server a few times and have a chat with it
- exit the program

This then leaves the issue of causing the web server to shut down so as to release its ownership of the underlying 
io_context run operation. i.e. if the io_context doesn't run out of work, the call to `io_context::run()` won't return.

I have taken advantage of the fact that when coroutines are spawned with an associated cancellation slot, the 
cancellation slot tree propagates down through all child coroutines and asio operations.

So it becomes as simple as:

Define a cancellation signal:

```cpp
    auto stop_sig = asio::cancellation_signal();
```

Run the server, passing in the cancellation signal's slot:
```cpp
    svr.run(stop_sig.slot());
```

When the client code has completed, it simply needs to cause the signal to emit:

```cpp
    co_spawn(ioc,
             comain(ioctx, initial_url),
             [&](std::exception_ptr ep)
             {
 ```
We emit the signal regardless of whether the client ended in an error or not - we want to stop the server in either case
```cpp
                 stop_sig.emit(asio::cancellation_type::all);
                 try
                 {
                     if (ep)
                         std::rethrow_exception(ep);
                 }
                 catch (std::exception &e)
                 {
                     fmt::print("client exception: {}\n", e.what());
                 }
             });

```

Within the server, we spawn the internal coroutines bound to the cancellation slot. This will cause the slot to
propagate the signal into the subordinate coroutines, causing whatever they are doing to complete with an 
`operation_aborted` error.

```cpp
void
server::run(asio::cancellation_slot stop_slot)
{
```
`awaitable_operators` makes dealing with parallel coroutines extremely simple.
```cpp
    using namespace asio::experimental::awaitable_operators;
    using asio::bind_cancellation_slot;
    using asio::co_spawn;
    using asio::use_awaitable;

    fmt::print("server starting\n");

    auto handler = [](std::exception_ptr ep)
    {
        try
        {
            if (ep)
                std::rethrow_exception(ep);
        }
        catch (asio::multiple_exceptions &es)
        {
            print_exceptions(es.first_exception());
        }
        catch (std::exception &e)
        {
            print_exceptions(e);
        }
    };
```

Here we are creating an outer coroutine which represents the simultaneous execution of the two inner coroutines, 
`http_server` and `wss_server`. The completion token of this outer coroutine is bound to the supplied cancellation slot.
When this slot is invoked, it will propagate the signal into the two subordinate coroutines.

```cpp
    co_spawn(get_executor(),
             http_server(tcp_acceptor_, tls_root_) &&
                 wss_server(sslctx_, tls_acceptor_, tls_root_),
             bind_cancellation_slot(stop_slot, handler));
}
```

## Final output

Here is an example of the output generated by this program, tracking the various redirects and correct shutdown of all 
IO operations.

```text
$ ~/github/madmongo1/blog-2022-Aug-websock-redirect/cmake-build-debug/blog-2022-aug-websock-redirect
Initialising
server starting
attempting connection: ws://127.0.0.1:38503/websocket-4
...handshake
...error: The WebSocket handshake was declined by the remote peer
HTTP/1.1 301 Moved Permanently
Location: wss://127.0.0.1:45141/websocket-4
Connection: close
Content-Length: 54

attempting connection: wss://127.0.0.1:45141/websocket-4
...handshake
...error: The WebSocket handshake was declined by the remote peer
HTTP/1.1 301 Moved Permanently
Location: wss://127.0.0.1:45141/websocket-3
Connection: close
Content-Length: 54

attempting connection: wss://127.0.0.1:45141/websocket-3
...handshake
...error: The WebSocket handshake was declined by the remote peer
HTTP/1.1 301 Moved Permanently
Location: wss://127.0.0.1:45141/websocket-2
Connection: close
Content-Length: 54

attempting connection: wss://127.0.0.1:45141/websocket-2
...handshake
...error: The WebSocket handshake was declined by the remote peer
HTTP/1.1 301 Moved Permanently
Location: wss://127.0.0.1:45141/websocket-1
Connection: close
Content-Length: 54

attempting connection: wss://127.0.0.1:45141/websocket-1
...handshake
...error: The WebSocket handshake was declined by the remote peer
HTTP/1.1 301 Moved Permanently
Location: wss://127.0.0.1:45141/websocket-0
Connection: close
Content-Length: 54

attempting connection: wss://127.0.0.1:45141/websocket-0
...handshake
...success
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: upgrade
Sec-WebSocket-Accept: N5wCr5WUOM6LxN8I4If7oR8QW3A=
Server: Boost.Beast/330

Hello, World!
serve_https: The WebSocket stream was gracefully closed at both endpoints
http_server: Operation canceled
wss_server: Operation canceled
Finished

Process finished with exit code 0
```

# Final Note

I have of course cut many corners in this demonstration. The error handling is a bit ropey and I haven't considered 
timeouts, connection re-use, etc.

But hopefully this will be useful to anyone reading.

Until next time.
