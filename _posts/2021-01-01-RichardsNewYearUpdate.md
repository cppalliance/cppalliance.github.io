---
layout: post
nav-class: dark
categories: richard
title: Richard's New Year Update - Reusable HTTP Connections
author-id: richard
---

# Reusable HTTP(S) Connections

Something I am often asked by users of Boost Beast is how to code a client which effectively re-uses a pool of HTTP 
connections, in the same way a web browser does.

The premise is straightforward - if our client is going to be making multiple calls to a web server (or several of them)
then it makes sense that once a connection has been used for one request, it is returned to a connection pool so that 
a subsequent request can make use of it.

It also makes sense to have a limit on the number of concurrent connections that can be open against any one host.
Otherwise, if the client needs to make multiple requests at the same time, it will end up creating new connections in
parallel and lose the efficiency of re-using an existing connection.

From these requirements, we can start to think about a design.

Firstly, we can imagine a connection cache, with connections kept in a map keyed on host + scheme + port (we can't 
re-use an HTTP port for an HTTPS request!).

When a request needs a connection, it will either create a new one (connection limit per host not met) or will wait
for an existing connection to become available (which implies a condition variable).

Once a request has a connection to use, it will send the HTTP request and wait for the response.

At this stage, there is a possibility that the active connection which has been allocated could have been idle since 
the last time it was used. In TCP there is no way to atomically check whether the remote host has closed the 
connection (or died). The only way to know is to actually read from the socket with a timeout. If the remote host has 
shutdown the socket, we will be notified as soon as the RST frame arrives at our host. If the remote host has stopped
working or the network is bad, we'll be notified by the timeout.

Thus if our read operation results in an error and we have inherited the connection from the cache, we ought to re-try
by reopening the connection to the remote host and repeating the write/read operations. However, if there is an error
reported on the subsequent attempt, then we can conclude that this is a legitimate error to be reported back to the
caller.

In simplified pesudocode, the operation might look something like this (assuming we report transport errors as 
exceptions):

```cpp
response 
read_write(connection& conn)
{
  response resp;
  
  auto retry = false;
   
  if(conn.is_initialised())
    retry = true;
  else
    conn.connect(...);
  
  for(;;)
  {
    conn.write(request);
    auto err = conn.read(resp);
    if (err)
    {
      if(!std::exchange(retry, false))
        throw system_error(err);
      request.clear();
      conn.disconnect();
    }
    else
      break;
  }

  return resp;
}
```

# Structuring the Code

## General Principles

In my previous [blog](https://cppalliance.org/richard/2020/12/22/RichardsDecemberUpdate.html) I mentioned my preference
for writing the implementation of a class in such a way that it does not need to take care of its own lifetime or
mutual exclusion. These concerns are deferred to a wrapper or handle. Methods on the handle class take care of 
marshalling the call to the correct executor (or thread) and preserving the implementation's lifetime. The 
implementation need only concern itself with the logic of handling the request.

Here's an example about which I'll go into more detail later:
```cpp
net::awaitable< response_type >
connection_cache::call(beast::http::verb   method,
                       const std::string & url,
                       std::string         data,
                       beast::http::fields headers,
                       request_options     options)
{
    // DRY - define an operation that performs the inner call.
    auto op = [&] {
        return impl_->call(method,
                           url,
                           std::move(data),
                           std::move(headers),
                           std::move(options));
    };

    // deduce the current executor
    auto my_executor = co_await net::this_coro::executor;

    // either call directly or via a spawned coroutine
    co_return impl_->get_executor() != my_executor
        ? co_await op()
        : co_await net::co_spawn(impl_->get_executor(), op, net::use_awaitable);
}
```

## Coroutines

In this implementation I will be providing a C++20 coroutine interface over Asio executors once again. I am using 
coroutines because they are easier to write when compared to Asio's composed operations, but are fundamentally the 
same thing in a prettier package.

## Mutual Exclusion

For mutual exclusion I will be embedded an asio strand into each active object. The advantage of doing so means that no
thread of execution is ever blocked which means we can limit the number of threads in the program to the number of 
free CPUs giving us maximum throughput of work. In reality of course, one thread is more than enough computing power
for almost all asynchronous programs. It's therefore better to think in terms of one _executor_ per program component,
with the implicit guarantee that a given executor will only perform work on one thread at a time.
Thinking this way allows us to write code in a way that is agnostic of whether the final program is compiled to be 
single or multi-threaded.

## But What About Single-threaded Programs?

In order that I don't need to rewrite code when should I decide to make a single-threaded program multi-threaded or vice 
versa, I have a couple of little utility functions and types defined in 
[config.hpp](https://github.com/madmongo1/blog-new-year-2021/blob/master/src/config.hpp)

Specifically:
```cpp
namespace net
{
using namespace asio;

using io_executor = io_context::executor_type;

#ifdef MULTI_THREADED

using io_strand = strand< io_executor >;

inline io_strand
new_strand(io_executor const &src);

inline io_strand
new_strand(io_strand const &src);

#else

using io_strand = io_context::executor_type;

inline io_strand
new_strand(io_executor const &src);

#endif

inline io_executor
to_io_executor(any_io_executor const &src);
}   // namespace net
```

Any object type in the program which _would require its own strand_ in a multi-threaded program will simply use the type
`io_strand` whether the program is compiled for single-threaded operation or not. Any code that would notionally 
need to construct a new strand simply calls `new_strand(e)` where `e` is either a strand or a naked executor.

Any code that needs access to the notional underlying executor would call `to_io_executor(e)`.

## Determinism

Since we're using asio's executors for scheduling, it means that we can use asio's timer as a deterministic, ordered 
asynchronous condition variable, which means that requests waiting on the connection pool will be offered free 
connections in the order that they were requested. This guarantee is implicit in the way that the timers' `cancel_one()`
method is specified.

As we'll see later, asio's timers also make it trivial to implement an asynchronous semaphore. In this case we use one
to ensure that requests are handled concurrently but no more than some upper limit at any one time. 

## Interface

I'm going to create a high-level concept called a `connection_cache`. The interface will be something like this:

```cpp
struct connection_cache
{
  using response_ptr = std::unique_ptr< response >;
  
  net::awaitable< response_ptr >
  rest_call(
    verb method, 
    std::string const& url, 
    std::optional<std::string> data = std::nullopt,
    headers hdrs = {},
    options opts = {});
};
```

There are a few things to note here.

  - The return type of the coroutine is a unique_ptr to a response. A natural question might be whether the response 
    should simply be returned by value. However, in practice I have found that there are a number of practical reasons
    why it's often better to return the response as a pointer. Firstly it allows conversion to a 
    `shared_ptr<const response>` in environments where the response might be passed through a directed acyclic graph.
    Secondly, would allow a further enhancement in that having finished with the response, the client could post it back
    to the cache, meaning that it could be cached for re-use.
  - The only two required arguments are the method and url. All others can be defaulted.
  - An optional string may be passed which contains the payload of a POST request. This is passed by value because, 
    as we'll see later,the implementation will want to move this into the request object prior to initiating 
    communications. I have chosen a string type for two reasons
    - text in the form of JSON or XML is the most common form of messaging in REST calls.
    - strings can contain binary data with no loss of efficiency.
  - `hdrs` is simply a list of headers which should be set in the request. Again, these are passed by value as they will
    be moved into the request object. 
  - The last parameter of the call is an as-yet undefined type called `options`. This will allow us to add niceties like
    timeout arguments, a stop_token, redirect policies, a reference to a cookie store and so on.
    
When called, `rest_call` will attempt to reuse an existing connection. If a connection is not available, it will create
a new one if we are under the connection threshold for the deduced host and if not, it will wait until a connection is
available.

Furthermore, the number of concurrent requests will be throttled to some upper limit.

Transport failures will be reported as an exception (of type `system_error`) and a successful response (even if a 400 
or 500) will be returned in the `response_ptr`. That is to say, as long as the transport layer works out, the code will 
take the non-exceptional path.

## Implementation details

### URL Parsing

Among the things I am often asked about in the Beast slack channel and in the 
[Issue Tracker](https://github.com/boostorg/beast/issues) is why there is no URL support in Beast. 
The is that Beast is a reasonably low level library that concerns itself with the HTTP (and WebSocket) 
protocols, plus as much buffer and stream management as is necessary to implement HTTP over Asio.
The concept of a URL the subject of its own RFCs and is a higher level concern.
The C++ Alliance is working on [Boost.URL](https://github.com/CPPAlliance/url) but it is not ready for publishing yet.
In the meantime, I found a nifty regex on the internet that more-or-less suffices for our needs:

```cpp
    std::tuple< connection_key, std::string >
    parse_url(std::string const &url)
    {
        static const auto url_regex = std::regex(
            R"regex((http|https)://([^/ :]+):?([^/ ]*)((/?[^ #?]*)\x3f?([^ #]*)#?([^ ]*)))regex",
            std::regex_constants::icase | std::regex_constants::optimize);
        auto match = std::smatch();
        if (not std::regex_match(url, match, url_regex))
            throw system_error(net::error::invalid_argument, "invalid url");

        auto &protocol = match[1];
        auto &host     = match[2];
        auto &port_ind = match[3];
        auto &target   = match[4];
        /*
        auto &path     = match[5];
        auto &query    = match[6];
        auto &fragment = match[7];
        */
        return std::make_tuple(
            connection_key { .hostname = host.str(),
                             .port     = deduce_port(protocol, port_ind),
                             .scheme   = deduce_scheme(protocol, port_ind) },
            target.str());
    }
```
### Exceptions in Asynchronous Code Considered Harmful

I hate to admit this, because I am a huge fan of propagating errors as exceptions. This is because the combination of 
RAII and exception behaviour handling makes error handling very slick in C++. However, coroutines have two rather 
unpleasant limitations:
- You can't call a coroutine in a destructor.
- You can't call a coroutine in an exception handling block.

There are workarounds. Consider:

```cpp
my_component::~my_component()
{
  // destructor
  net::co_spawn(get_executor(), 
  [impl = impl_]()->net::awaitable<void>
  {
    co_await impl->shutdown();
    // destructor of *impl happens here
  }, net::detached);
}
```
This is the destructor of a wrapper object that contains a `shared_ptr` to its implementation, `impl_`. In this case
we can detect the destruction of `my_component` and use this to spawn a new coroutine of indeterminate lifetime that
takes care of shutting down the actual implementation and then destroying it.

This solves the problem of RAII but it mandates that we must author objects that will be used in coroutines as 
a handle-body pair.

We can similarly get around the "no coroutine calls in exception handlers" limitation if we're prepared to stomach code 
like this:

```cpp
net::awaitable<void> 
my_coro()
{
  std::function<net::awaitable(void)> on_error;
  try {
    co_await something();
  }
  catch(...)
  {
    // set up error_handler
    on_error = [ep = std::current_exception] {
      return handler_error_coro(ep);
    };
  }
  // perhaps handle the error here
  if (on_error)
      co_await on_error();
}
```

I think you'll agree that this is a revolting solution to an unforgivable omission in the language. Not only is it 
untidy, confusing, difficult to teach and error-prone, it also turns exception handling into same fiasco that is 
enforced checking of return codes.

To add insult to injury, the error handling code in this function takes up 5 times as many lines as the logic!

Therefore my recommendation is that in asynchronous coroutine code, it's better to avoid exceptions and have coroutines
either return a tuple of (error_code, possible_value) or a variant containing error-or-value.

For example, here is some code from the `connection_impl` in my example project:

```cpp
net::awaitable< std::tuple< error_code, response_type > >
connection_impl::rest_call(request_class const &  request,
                           request_options const &options)
{
    auto response = std::make_unique< response_class >();

    auto ec = stream_.is_open()
                  ? co_await rest_call(request, *response, options)
                  : net::error::basic_errors::not_connected;

    if (ec && ec != net::error::operation_aborted)
    {
        ec = co_await connect(options.stop);
        if (!ec)
            ec = co_await rest_call(request, *response, options);
    }

    if (ec || response->need_eof())
        stream_.close();

    co_return std::make_tuple(ec, std::move(response));
}
```

### Ensuring that a Coroutine Executes on the Correct Executor

In playing with asio coroutines I stumbled upon something that has become an idiom.

Consider the situation where a `connection` class is implemented in terms of a handle and body. The body contains its 
own executor. In a multi-threaded build, this executor will be a `strand` while in a single threaded-build we would want 
it to be simply an `io_context::executor_type` since there will be no need for any of the thread guards implicit in a 
strand.

Now consider that the implementation has a member coroutine called (say) `call`. There are two scenarios in which 
this member will be called. The first is where the caller is executing in the same executor that is associated with 
the implementation, the second is where the caller is in its own different executor.
In the latter case, we must `post` or `spawn` the execution of the coroutine onto the implementation's executor in order 
to ensure that it runs in the correct sequence with respect to other coroutines initiated against it.

The idiom that occurred to me originally was to recursively spawn a coroutine to ensure the call happened on the 
correct executor:

```cpp
net::awaitable< response_type >
connection_cache::call(beast::http::verb   method,
                       const std::string & url,
                       std::string         data,
                       beast::http::fields headers,
                       request_options     options)
{
    auto my_executor = co_await net::this_coro::executor;

    if (impl_->get_executor() == my_executor)
    {
        co_return co_await impl_->call(method,
                                       url,
                                       std::move(data),
                                       std::move(headers),
                                       std::move(options));
    }
    else
    {
        // spawn a coroutine which recurses on the correct executor.
        // wait for this coroutine to finish
        co_return co_await net::co_spawn(
            impl_->get_executor(),
            [&]() -> net::awaitable< response_type > {
                return call(method,
                            url,
                            std::move(data),
                            std::move(headers),
                            std::move(options));
            },
            net::use_awaitable);
    }
}
```

However, this does have the drawback that a code analyser might see the possibility of infinite recursion. 

After discussing this with [Chris](https://github.com/chriskohlhoff/asio/), Asio's author, a better solution was found:

```cpp
net::awaitable< response_type >
connection_cache::call(beast::http::verb   method,
                       const std::string & url,
                       std::string         data,
                       beast::http::fields headers,
                       request_options     options)
{
    // DRY - define an operation that performs the inner call.
    auto op = [&] {
        return impl_->call(method,
                           url,
                           std::move(data),
                           std::move(headers),
                           std::move(options));
    };

    // deduce the current executor
    auto my_executor = co_await net::this_coro::executor;

    // either call directly or via a spawned coroutine
    co_return impl_->get_executor() != my_executor
        ? co_await op()
        : co_await net::co_spawn(impl_->get_executor(), op, net::use_awaitable);
}
```

There are a few things to note:
- All lifetimes are correct even though the `op` takes arguments by reference. This is because whichever path we take, 
our outer coroutine will suspend on the call to `op`.
- Note that in the slow path, `op` is captured by value in the call to `co_spawn`. Had we written:
`: co_await net::co_spawn(impl_->get_executor(), op(), net::use_awaitable);` then `op` would have been called _during_
  the setup of the call to `co_spawn`, which would result in `impl_->call(...)` being called on the wrong 
  executor/thread.
  
# Talk is Cheap

TL;DR. Enough talk, where's the code?

It's on github at [https://github.com/madmongo1/blog-new-year-2021](https://github.com/madmongo1/blog-new-year-2021).

## Final Notes.

Before signing off I just wanted to cover a few of the features I have completed in this example and a few that I 
have not.

### What's Done

- There is a limit on the number of concurrent connections to a single host. Host here is defined as a tuple of the 
transport scheme (i.e. http or https), port and hostname. This is currently defaulted to two, but would be trivial to 
  change.

- There is a limit on the number of concurrent requests across all hosts. This defaults to 1000. Simultaneous requests
numbering more than this will be processed through what is an asynchronous semaphore, implemented like this:
  ```cpp
    while (request_count_ >= max_concurrent_requests_)
    {
        error_code ec;
        co_await concurrent_requests_available_.async_wait(
            net::redirect_error(net::use_awaitable, ec));
    }

    ++request_count_;

    ...
    ... request takes place here
    ...
  
    if (--request_count_ < max_concurrent_requests_)
    {
        concurrent_requests_available_.cancel_one();
    }

  ```

### What's Not Done

- HTTP 300 Redirect handling. I consider this to be a higher level concern than connection caching.
- LRU Connection recycling. At the moment, the program will allow the number of connections to grow without limit if
  an unlimited number of different hosts are contacted. In a production system we would need to add more active state to
  each connection and have some logic to destroy old unused connections to make way for new ones.
- The `stop_token` is not executor-aware. I have left the stop_token in for exposition but it should not be activated 
  by a different executor to the one where the connection to it has been created at present. If you're interested to 
  see how this will look when complete, please submit an issue against the github repo and I'll update the code and add
  a demonstration of it.
- A Cookie Jar and HTTP session management. Again, these are higher level concerns. The next layer up would take care of
these plus redirect handling.
- The CMakeLists project in the repo has been tested with GCC 10.2 and Clang-11 on Fedora Linux. Microsoft developers
  may need to make the odd tweak to get things working. I'm more than happy to accept PRs.
- Setting up of the `ssl::context` to check peer certificates. Doing this properly is complex enough to warrant another
 blog in its own right.

Thanks for reading. I hope you've found blog useful. Please by all means get in touch by:
- raising an [issue](https://github.com/madmongo1/blog-new-year-2021/issues)
- Contacting me in the #beast channel of [CppLang Slack](https://cppalliance.org/slack/)
- email [hodges.r@gmail.com](mailto:hodges.r@gmail.com)

