---
layout: post
nav-class: dark
categories: richard
title: Richard's October Update
author-id: richard
---

# Aims and Objectives

This blog is presented in two sections. 

The first is a general discussion about completion tokens.

The second is a practical demonstration of a production-grade completion token which adds significant utility to any 
asynchronous operation that supports the new cancellation feature that arrived in Asio 1.19 (Boost 1.77).

This blog ships with an accompanying github repository in case you want to play with examples.
The repository is [here](https://github.com/madmongo1/blog-2021-10).

# Asio and the Power of Completion Tokens

Asio (available [standalone](https://think-async.com/Asio/) and [in Boost](https://www.boost.org/doc/libs/1_77_0/doc/html/boost_asio.html)) 
defines a pattern for writing asynchronous operations. There have been a few examples in my blogs of custom composed 
operations written in terms of several asynchronous operations made available by the library.

Another often overlooked feature of Asio is the ability to define a customisation point which defines the "behaviour
during initiation and the result type" of the asynchronous initiating function.

But what does that mean?

Well, consider the following code:

```c++
/* void */ asio::async_read(sock, buffer, "\r\n", [](error_code ec, std::size_t n) { /* handler */ });
```

This is a verbatim (you could say old-style) asynchronous initiating function which will read from the socket into the 
buffer until either:
- The buffer is full, or
- the sequence `\r\n` is found in the input stream, or
- There is some other IO error.

Whichever happens, the lambda is called in the context of the _associated executor_ of the socket.

(Let's call this "_the operation_")

The operation is started immediately and the lambda will be invoked at some point in the future once the operation is 
complete. The initiating function returns `void`.

Now consider:

```c++
auto n = co_await asio::async_read(sock, "\r\n", asio::use_awaitable);
```

This code is using the same _initiating function_ to invoke initiate the same _asynchronous operation_. However, this 
time instead of providing a _Completion Handler_ we have provided a _Completion Token_.

The only difference in the two invocations is the presence of the token. The actual asynchronous operation is the same 
in both cases.

However, now invocation of _the operation_ has been modified such that:
- The initiating function returns an `asio::awaitable<std::size_t>` which can be `co_await`ed.
- The initiating function has been transformed into a C++20 coroutine.
- The operation will not commence until the returned awaitable has been `co_await`ed.

We can say that the completion token has implemented a customisation point at both the initiation step and the 
completion step.

(For great notes on completion step I would recommend reading one of the 
[many excellent papers](https://isocpp.org/files/papers/P2469R0.pdf) or
[videos](https://www.youtube.com/watch?v=icgnqFM-aY4&t=1129s)), published by Chris Kohlhoff - the author of Asio.

Here is another interesting example:

```c++
using asio::experimental::deferred;
using asio::use_awaitable;

auto my_op = asio::async_read(sock, "\r\n", deferred);
...
auto n = co_await my_op(use_awaitable);
```

In this case, the `async_read` initiating function has been invoked with the `deferred` _completion token_. This token
has two side effects:
- The _asynchronous operation_ is not actually initiated, and
- It changes the return type to be an invocable object which when called will behave as if you called the initiating function.

The returned invocable object is a unary function object whose argument is a _completion token_, which means that the 
operation can be further customised at the point of use. You can think of it as an asynchronous packaged tasks awaiting
one last customisation before use.

Note that as long as the packaged asynchronous operation is started with reference arguments or lightweight copyable 
arguments, it can be re-used and copied. All arguments of Asio and Beast initiating functions
conform to this principle. The original design decision of passing buffers and return values by reference to 
asynchronous operations was to ensure that when operations are composed, they do not allocate memory - the caller can 
specify the memory management strategy. It so happens that this design decision, taken something like 16 years ago, 
has enabled efficient composition of completion tokens.

Finally, on the subject of `deferred`, deferring a deferred initiating function yields the same deferred initiating 
function. I guess one way to think about completion tokens is that they are transforms or higher order functions
for manipulating the initiation and result types of asynchronous operations.

example:

```c++
asio::awaitable<void>
reader(asio::ip::tcp::socket sock)
{
  using asio::experimental::deferred;
  using asio::use_awaitable;
  using asio::experimental::as_tuple;

  // An easy but not efficient read buffer
  std::string buf;

  // created the deferred operation object
  auto deferred_read = async_read_until(
      sock,
      asio::dynamic_buffer(buf),
      "\n",
      deferred);

  // deferring a deferred operation is a no-op
  auto deferred_read2 = deferred_read(deferred);

  // tokens are objects which can be composed and stored for later
  // The as_tuple token causes the result type to be reported as a
  // tuple where the first element is the error type. This prevents
  // the coroutine from throwing an exception.
  const auto my_token = as_tuple(use_awaitable);

  bool selector = false;
  for(;;)
  {
    // use each deferred operation alternately
    auto [ec, n] = co_await [&] {
      selector = !selector;
      if (!selector)
        return deferred_read(my_token);
      else
        return deferred_read2(my_token);
    }();
    if (ec)
    {
      std::cout << "reader finished: " << ec.message() << "\n";
      break;
    }
    auto view = std::string_view(buf.data(), n - 1);
    std::cout << "reader: " << view << "\n";
    buf.erase(0, n);
  }
}
```

A table of completion tokens packaged with Asio is presented here:

|token|Initiation Policy|Completion Behaviour/Result Type|Notes|
|-----|-----------------|--------------------------------|-----|
| [detached](https://www.boost.org/doc/libs/1_77_0/doc/html/boost_asio/reference/detached.html) | Initiate immediately | Ignore all errors and results | When used with `co_spawn`, causes the spawned asynchronous chain of coroutines to have behaviour analogous to a detached thread. |
| [experimental::deferred](https://www.boost.org/doc/libs/1_77_0/doc/html/boost_asio/reference/experimental__deferred.html) | Do not initiate | Return a function object which when invoked with a completion token, behaves as if the original initiating function was called with that same token | Analogous to an asynchronous packaged task. |
| [use_future](https://www.boost.org/doc/libs/1_77_0/doc/html/boost_asio/reference/use_future.html) | Initiate immediately | Return a std::future which will yield the completion arguments | |
| [use_awaitable](https://www.boost.org/doc/libs/1_77_0/doc/html/boost_asio/reference/use_awaitable.html) | Initiate when awaited | Return an awaitable object yield the completion arguments when `co_await`ed| |
| [yield_context](https://www.boost.org/doc/libs/1_77_0/doc/html/boost_asio/reference/yield_context.html) | Initiate immediately | Yield the current stackful coroutine. Once the operation is complete, resume and return the handler arguments | |
| [as_tuple(token)](https://www.boost.org/doc/libs/1_77_0/doc/html/boost_asio/reference/experimental__as_tuple.html) | Initiate as indicated by the supplied `token` | Modify the completion arguments to be a single tuple of all arguments passed to the completion handler. For example, `void(error_code, size_t)` becomes `void(tuple<error_code, size_t>)`. In practical terms this token ensures that partial success can be communicated through `use_future`, `use_awaitable` and `yield`| Very useful when used with `yield`, `use_future` or `use_awaitable` if we'd like to handle the error without exception handling or when a partial success must be detected. For example, the error_code might contain `eof` but `size` might indicate that 20 bytes were read into the buffer prior to detecting the end of stream condition. |
| [redirect_error(token, &ec)](https://www.boost.org/doc/libs/1_77_0/doc/html/boost_asio/reference/redirect_error.html) | Initiate as indicated by the supplied `token` | For operations whose first completion handler argument is an `error_code`, modify the completion handler argument list to remove this argument. For example, `void(error_code, size_t)` becomes `void(size_t)`. The error code is redirected to object referenced by `ec`| Similar to the above use, but allows overwriting the same `error_code` object which can be more elegant in a coroutine containing multiple calls to different initiating functions. |
| [experimental::as_single(token)](https://www.boost.org/doc/libs/1_77_0/doc/html/boost_asio/reference/experimental__as_single.html) | Initiate as indicated by the supplied `token` | Similar to `as_tuple` except in the case where the only argument to the completion handler is an error. In this case, the completion handler arguments are unaltered. | Experience of use suggests to me that this token is less useful than `redirect_error` and `as_tuple`. |
| [experimental::append(token, values...)](https://www.boost.org/doc/libs/1_77_0/doc/html/boost_asio/reference/experimental__append.html) | Initiate as indicated by the supplied `token` | When the completion handler is invoked, the `values...` arguments are appended to the argument list. | Provides a way to attaching more information to a completion handler invocation. [examples](https://github.com/madmongo1/blog-2021-10/blob/master/append_prepend.cpp)|
| [experimental::prepend(token, values...)](https://www.boost.org/doc/libs/1_77_0/doc/html/boost_asio/reference/experimental__prepend.html) | Initiate as indicated by the supplied `token` | When the completion handler is invoked, the `values...` arguments are prepended to the argument list. | Provides a way to attaching more information to a completion handler invocation. [examples](https://github.com/madmongo1/blog-2021-10/blob/master/append_prepend.cpp) |

# A Custom Completion Token

All very interesting and useful, no doubt. But what if we wanted to do something more clever.

The other day I was speaking to Chris about timed cancellation. Now there are ways of doing timed cancellation that in 
Chris' view are correct and maximally performant (covered in [this video](https://www.youtube.com/watch?v=hHk5OXlKVFg)). 
However many users don't need maximum performance. What they often want is maximum teachability or maintainability.

So I posed the question: "Imagine I wanted a function which took any existing Asio composed asynchronous operation and
produced a new composed operation which represented that same operation with a timeout. How would I do that?"

For example, imagine we had a deferred read operation:

```c++
    auto read_op = async_read(stream, buffer, deferred); 
```

Which we can invoke in a coroutine like so:

```c++
    co_await read_op(use_awaitable); 
```

imagine we could write:

```c++
    co_await with_timeout(read_op, 5s, use_awaitable);
```

or to write it out in full:

```c++
    co_await with_timeout(
        async_read(stream, buffer, deferred),
        5s,
        use_awaitable);
```

The answer that came back was to me quite surprising: "It starts with a completion token".

Which means that the way to achieve this is to write the `with_timeout` function in terms of a composition of completion 
tokens:

```c++
template <typename Op, typename CompletionToken>
auto with_timeout(Op op, std::chrono::milliseconds timeout, CompletionToken&& token)
{
    return std::move(op)(timed(timeout, std::forward<CompletionToken>(token)));
}
```

In the above code, `timed` is a function that returns a parameterised completion token. It will look something like this:
```c++
template <typename CompletionToken>
timed_token<CompletionToken> 
timed(std::chrono::milliseconds timeout, CompletionToken&& token)
{
    return timed_token<CompletionToken>{ timeout, token };
}
```
The actual token type would look like this:
```c++
template <typename CompletionToken>
struct timed_token
{
    std::chrono::milliseconds timeout;
    CompletionToken& token;
};
```

So far, so simple. But how will this work?

Well, remember that a completion token controls the injection of logic around an asynchronous operation. So somehow by 
writing the token, we will get access to the packaged operation prior to it being initiated and we get access to the 
following building blocks of the async operation provided by Asio's initiation pattern:
- The _initiation_ - this is a function object that will actually initiate the packaged asynchronous operation, and
- The _initiation arguments_ - the arguments that were supplied to the initial initiation function. In our example above,
these would be `stream` and `buffer`

Note that the _initiation_ is an object that describes how to launch the underlying asynchronous operation, plus 
associated data such as the [_associated executor_](https://www.boost.org/doc/libs/1_77_0/doc/html/boost_asio/reference/get_associated_executor.html), 
[_associated allocator_](https://www.boost.org/doc/libs/1_77_0/doc/html/boost_asio/reference/get_associated_allocator.html) 
and [_associated cancellation slot_](https://www.boost.org/doc/libs/1_77_0/doc/html/boost_asio/reference/get_associated_cancellation_slot.html).

In Asio, the customisation point for initiating an asynchronous operation with a given completion token is the template
class [`async_result`](https://www.boost.org/doc/libs/1_77_0/doc/html/boost_asio/reference/async_result.html).

Here is the specialisation:
```c++
// Specialise the async_result primary template for our timed_token
template <typename InnerCompletionToken, typename... Signatures>
struct asio::async_result<
      timed_token<InnerCompletionToken>,  // specialised on our token type 
      Signatures...>
{
    // The implementation will call initiate on our template class with the
    // following arguments:
    template <typename Initiation, typename... InitArgs>
    static auto initiate(
        Initiation&& init, // This is the object that we invoke in order to
                           // actually start the packaged async operation
        timed_token<InnerCompletionToken> t, // This is the completion token that
                                             // was passed as the last argument to the
                                             // initiating function
        InitArgs&&... init_args)      // any more arguments that were passed to
                                      // the initiating function
    {
        // we will customise the initiation through our token by invoking
        // async_initiate with our own custom function object called
        // timed_initiation. We will pass it the arguments that were passed to
        // timed(). We will also forward the initiation created by the underlying
        // completion token plus all arguments destined for the underlying
        // initiation.
        return asio::async_initiate<InnerCompletionToken, Signatures...>(
                timed_initiation<Signatures...>{},
                  t.token,   // the underlying token
                  t.timeout, // our timeout argument
                std::forward<Initiation>(init),  // the underlying operation's initiation
                std::forward<InitArgs>(init_args)... // that initiation's arguments
        );
    }
};
```

It's a bit of a wall of text, but most of that is due to my comments and C++'s template syntax. In a nutshell, what this
class is doing is implementing the function which wraps the initiation of the underlying operation (i.e the async_read)
in an outer custom initiation which is going to add a timeout feature.

All that remains is to define and implement `timed_initiation<>`, which is nothing more than a function object. We could
have written it inline as a lambda, but for clarity it has been broken out into a separate template.

[`async_initate`](https://www.boost.org/doc/libs/1_77_0/doc/html/boost_asio/reference/async_initiate.html) looks 
complicated but in actual fact is doing a simple transformation:

Given:
- `tok` is a _CompletionToken_
- `Signatures...` is a type pack of function signatures that are required to be supported by a _CompletionHandler_ built 
from `tok`.
- `initiation` is a function object
- `args...` is a set of arbitrary arguments

Invoking `async_initiate` will first transform `tok` into a _CompletionHandler_ which we will call `handler`. Then it will
simply call `initiation(handler, args...)`. i.e. it will invoke the `initiation` with the correct completion handler and
any other arguments we happen to give it.

```c++
// Note: this is merely a function object - a lambda.
template <typename... Signatures>
struct timed_initiation
{
    template <
        typename CompletionHandler,
        typename Initiation,
        typename... InitArgs>
    void operator()(
      CompletionHandler handler,         // the generated completion handler
      std::chrono::milliseconds timeout, // the timeout specified in our completion token
      Initiation&& initiation,           // the embedded operation's initiation (e.g. async_read)
      InitArgs&&... init_args)           // the arguments passed to the embedded initiation (e.g. the async_read's buffer argument etc)
    {
        using asio::experimental::make_parallel_group;

        // locate the correct executor associated with the underling operation
        // first try the associated executor of the handler. If that doesn't
        // exist, take the associated executor of the underlying async operation's handler
        // If that doesn't exist, use the default executor (system executor currently)
        auto ex = asio::get_associated_executor(handler,
                                                asio::get_associated_executor(initiation));

        // build a timer object and own it via a shared_ptr. This is because its
        // lifetime is shared between two asynchronous chains. Use the handler's
        // allocator in order to take advantage of the Asio recycling allocator.
        auto alloc = asio::get_associated_allocator(handler);
        auto timer = std::allocate_shared<asio::steady_timer>(alloc, ex, timeout);

        // launch a parallel group of asynchronous operations - one for the timer
        // wait and one for the underlying asynchronous operation (i.e. async_read)
        make_parallel_group(
                // item 0 in the group is the timer wait
                asio::bind_executor(ex,
                                    [&](auto&& token)
                                    {
                                        return timer->async_wait(std::forward<decltype(token)>(token));
                                    }),
                // item 1 in the group is the underlying async operation
                asio::bind_executor(ex,
                                    [&](auto&& token)
                                    {
                                        // Finally, initiate the underlying operation
                                        // passing its original arguments
                                        return asio::async_initiate<decltype(token), Signatures...>(
                                                std::forward<Initiation>(initiation), token,
                                                std::forward<InitArgs>(init_args)...);
                                    })
        ).async_wait(
                // Wait for the first item in the group to complete. Upon completion
                // of the first, cancel the others.
                asio::experimental::wait_for_one(),

                // The completion handler for the group
                [handler = std::move(handler), timer](
                    // an array of indexes indicating in which order the group's
                    // operations completed, whether successfully or not
                    std::array<std::size_t, 2>,

                    // The arguments are the result of concatenating
                    // the completion handler arguments of all operations in the
                    // group, in retained order:
                    // first the steady_timer::async_wait
                    std::error_code,

                    // then the underlying operation e.g. async_read(...)
                    auto... underlying_op_results // e.g. error_code, size_t
                    ) mutable
                {
                    // release all memory prior to invoking the final handler
                    timer.reset();
                    // finally, invoke the handler with the results of the
                    // underlying operation
                    std::move(handler)(std::move(underlying_op_results)...);
                });
    }
};
```

Now that the token and its specialisation of `async_result` is complete, we can trivially write a timed read from console
that won't throw as a coroutine in one line: 

```c++
    // using the completion token direct
    auto [ec1, n1] = co_await async_read_until(in, dynamic_buffer(line), '\n',
                                              as_tuple(timed(5s, use_awaitable)));

    // using the function form
    auto [ec2, n2] = co_await with_timeout(
        async_read_until(in, asio::dynamic_buffer(line), '\n', deferred),
        5s,
        as_tuple(use_awaitable));
```

The full code for this example is [here](https://github.com/madmongo1/blog-2021-10/blob/master/timed.cpp). 
Note that this example is written in terms of a posix console stream. 
To demonstrate on Windows, you would need to replace the `posix::stream_descriptor in(co_await this_coro::executor, ::dup(STDIN_FILENO));`
with a stream type compatible with Windows, such as a socket or named pipe... or even adapt the example to use a Beast
`http::async_read` - and presto! You have a ready-made HTTP server which applies a timeout to reading messages.

# A Note on Performance

It is important that I point out that this example token has been written with ease of use as the primary motivating 
factor. There is a pessimisation in its design in that use of the token allocates a new timer for every
asynchronous operation where the timeout is being applied. This of course becomes completely un-necessary if we redesign 
the token so that we pass a reference to an existing timer to its construction function.

The call-site would then look more like this:
```c++
    auto timer = asio::steady_timer(co_await this_coro::executor, 5s);
    auto [ec1, n1] = co_await async_read_until(in, dynamic_buffer(line), '\n',
                                              as_tuple(use_deadline(timer, use_awaitable)));
```

Writing it this way would actually result in a simpler initiation and would ensure that the general Asio principle of
giving the caller control over object lifetimes and allocation strategies is maintained.

Asio was originally designed for highly scalable and latency-sensitive applications such as used in the finance, 
automotive and defence industries. Out of the box it provides the basic building blocks with which to assemble
performance and memory-critical applications. However as it has become more widely adopted there is a growing demand for
"easy mode" interfaces for people who just want to get things done.

This message has not gone unheard. I would expect a number of interesting new features to be added to the library in 
short order.

Thanks for reading.

Richard Hodges<br/>
for C++ Alliance<br/>
[hodges.r@gmail.com](mailto:hodges.r@gmail.com)
