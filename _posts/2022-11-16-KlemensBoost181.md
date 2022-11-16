---
layout: post
nav-class: dark
categories: boost-release
title: New in Boost 1.81
author-id: klemens
---

# New Library: Url

Boost.url has been released. And it's [awesome](https://www.boost.org/doc/libs/master/libs/url/doc/html/url/overview.html).

# Json & Describe

Boost.json is now integrated with boost.describe. That means that any `class`, `struct`, or `enum` 
that has describe annotations can be directly serialized to and from json. 

You can fine examples [here](https://www.boost.org/doc/libs/master/libs/describe/doc/html/describe.html#example_to_json).

Additionally, `variant2` is also supported.

# Unordered

Unordered got a new map type, [`unordered_flat_map`](https://www.boost.org/doc/libs/master/libs/unordered/doc/html/unordered.html#unordered_flat_map),
and the corresponding set type [`unordered_flat_set`](https://www.boost.org/doc/libs/master/libs/unordered/doc/html/unordered.html#unordered_flat_set).

These two containers lay out the map in a flat array, instead of being node-based.
On modern CPU, this open addressing can lead to significant performance increases, 
due to improved cache-usage. 

Joaquín, the author, has written a detailed [blog post](https://bannalia.blogspot.com/2022/11/inside-boostunorderedflatmap.html), 
which is highly recommended.

# Beast

## Per operation cancellation

Beast supports per-operation cancellation now. This is mostly `terminal` cancellation, 
i.e. you can't do anything with the io-object but to close it afterwards.
This is still useful for completion methods that automatically wire up cancellations, such as `asio::awaitable`s (for which beast also has examples).

In a few cases beast does allow `total` cancellation (cancellation without side effects). 
This is the case in certain situations with websockets, when the operation gets blocked because of ongoing control messages such as ping or pong.

Generally it should however be treated as if beast only support `terminal` cancellation due to the protocol limitations.


## Adressing the dynamic-buffer disconnect.

When beast was originally conceived, asio did not have a clear dynamic-buffer concept.
This lead to beast developing it's own buffer types in parallel, which have very close semantics. 
Asio however went one step further under the guidance of WG21, and developed a dynamic buffer version 2, 
which is much more complicated and a questionable improvement.

Since boost still supports dynamic buffer v1, unless explicitly told not to, it was little work to
make them compatible. 
The major difference is that `asio`'s buffers are passed by copy, while `beast`s need to be passed by reference.

```cpp
std::string buffer; // < the dynamic buffer will point there
asio::read_until(socket, asio::dynamic_buffer(buffer), '\n');
```


This surely was the source of many bugs, as the following code compiles fine:

```cpp
beast::flat_buffer buffer;
asio::read_until(socket, buffer, '\n');
```

When run however, the buffer seems to be empty. The reason is that the buffer gets copied by `read_until`, 
meaning the data gets written into a buffer, that will get destroyed.

To help with that, beast now provides a `buffer_ref` class that captures by reference and can then freely be copied:

```cpp
beast::flat_buffer buffer;
asio::read_until(socket, ref(buffer), '\n');
```

`ref` is a function to do the proper template resolution. 

# Asio

## Semantic changes

Asio's semantic requirements have changed slightly regarding `post` and executors.
When a composed operation runs into an error before it's first op, 
a common pattern is to `post` once, to avoid recursion. 
Usually this post will happen on the executor of the completion handler, 
since this is the handler that we need to invoke the handler on anyhow. 

```cpp
void run_my_op(
    tcp::socket & sock, // io_exec
    thread_pool::executor_type work_exec,
    std::function<void(my_message_type)> my_completion)
{   
    async_read_my_message(sock, asio::bind_executor(work_exec, my_completion));
}

```

In the above code `async_read_my_message` is a composed operation that gets one message from the socket, which runs on `io_exec` and it's suppoesed to invoke the completion on `work_exec`.

Let's say, our `async_read_my_message` op, checks if `sock.is_open` and if not, wants to immediately complete.
This seems ok-ish, but what happenes if the `io_exec` isn't running? In any other case, 
the operation will only complete if `io_exec` is running, except for the early error. 
Thus the correct executor to `post` to is `io_exec`, after which the completion gets `dispatch`ed to `work_exec.

Because of this, the executor requirements for associated executor are not relaxed, 
so that it does not need to support `post`. 
The precise requirements can be found in the documentation for the polymorphic wrappers
[any_completion_executor](https://www.boost.org/doc/libs/master/doc/html/boost_asio/reference/any_completion_executor.html) and [any_io_executor](https://www.boost.org/doc/libs/master/doc/html/boost_asio/reference/any_io_executor.html).

Additionally, `async_compose` provides a handle (commonly called `self`) with a `get_io_executor()` member.

*Note that beast is not yet compliant with this as of 1.81.*

## `any_completion_handler`

Another interesting addition to asio is the `any_completion_handler` class, 
that can be used to type-erase completion handlers (not to be confused with tokens).

Introducing a minor run-time overhead, it can speed up compile times, 
because heavy async operations can be moved into source files and only built once.

At the same time, it can be wrapped in an async_initiate statement, 
allowing the use of all completion tokens, e.g. `use_awaitable`.

E.g.:

```cpp
// this goes into the source file
void my_async_write_impl(asio::ip::tcp::socket & sock, 
                         asio::const_buffer buffer,
                         asio::any_completion_handler<void(system::error_code, std::size_t)> cpl)
{
    asio::async_write(sock, buffer, std::move(cpl));
}

/// header file 


template<typename Token>
auto my_async_write(asio::ip::tcp::socket & sock,
                    asio::const_buffer buffer,
                    Token && token)
{
    return asio::async_initiate<Token, void(error_code, std::size_t)>(
            [&](asio::any_completion_handler<void(error_code, std::size_t)> cpl)
            {
                my_async_write_impl(sock, buffer, std::move(cpl));
            },
            token);
}

// use it

co_await my_async_write(my_socket, my_buffer, asio::use_awaitable);

```

Note that the above described semantic changes apply; that is, the associated executor of an `any_completion_handler` cannot be use in `asio::post`.

## Awaiting async_operations

The new version also introduces the concept (actual concept in C++20) of an `async_operation`. 
It describes an expression that can be inovked with a completion-token, e.g.:

```cpp
asio::steady_timer tim{co_await asio::this_coro::executor};
asio::async_operation<void(system::error_code)> auto my_op = 
    [&](auto && token) {return tim.async_wait(std::move(token));}
```

The interesting part here is that an async-operation, in addition to being usable in `parallel_group`s or the also new `ranged_parallel_group`, can be directly awaited in `asio::awaitable`'s and `asio::experimental::coro`s.

```cpp
co_await my_op;
```

The nice thing here is that we can avoid the additional coroutine frame (which includes an allocation),
that `use_awaitable` (or `use_coro`) needs in order to return an `awaitable`.

Additionally, `experimental::promise` has been refactored, so that it doesn't use a `.async_wait` member function, 
but `operator()` as well. That is, any `experimental::promise` is an async-operation.

```cpp
auto p = tim.async_wait(experimental::use_promise);
co_await std::move(p);
```

## co_compose

Another useful feature for library developers that can use C++20 is the experimental `co_composed`,
which is a low-level coroutine based replacement for `async_compose`.

Consider the following example from the asio docs:

```cpp
template <typename CompletionToken>
auto async_echo(tcp::socket& socket,
    CompletionToken&& token)
{
  return boost::asio::async_initiate<
    CompletionToken, void(boost::system::error_code)>(
      boost::asio::experimental::co_composed(
        [](auto state, tcp::socket& socket) -> void
        {
          state.reset_cancellation_state(
            boost::asio::enable_terminal_cancellation());

          while (!state.cancelled())
          {
            char data[1024];
            auto [e1, n1] =
              co_await socket.async_read_some(
                boost::asio::buffer(data),
                boost::asio::as_tuple(boost::asio::deferred));

            if (e1)
              co_yield state.complete(e1);

            if (!!state.cancelled())
              co_yield state.complete(
                make_error_code(boost::asio::error::operation_aborted));

            auto [e2, n2] =
              co_await boost::asio::async_write(socket,
                boost::asio::buffer(data, n1),
                boost::asio::as_tuple(boost::asio::deferred));

            if (e2)
              co_yield state.complete(e2);
          }
        }, socket),
      token, std::ref(socket));
}
```

Writing this as `async_compose` & `asio::coroutine` would look like this:

```cpp
struct async_echo_implementation : boost::asio::coroutine
{
    tcp::socket & socket;

    // - can't be a member, sicne this struct gets moved
    // - should be allocated using the associated allocator, but this is an example.
    std::unique_ptr<char[]> data{new char[1024]};

    template<typename Self>
    void operator()(Self && self, system::error_code ec = {}, std::size_t n = 0u)
    {
        reenter(this)
        {
            while (!self.cancelled())
            {
                yield socket.async_read_some(
                        boost::asio::buffer(data.get(), 1024),
                        std::move(self));

                if (ec)
                    return self.complete(ec);
                if (!!self.cancelled())
                    return self.complete(boost::asio::error::operation_aborted);

                yield boost::asio::async_write(socket,
                                               boost::asio::buffer(data.get(), n),
                                               std::move(self));

                if (ec)
                    return self.complete(ec);
            }
        }
        self.complete({});
    }
};

template <typename CompletionToken>
auto async_echo(tcp::socket& socket,
                CompletionToken&& token)
{
    return boost::asio::async_compose<CompletionToken,
            void(boost::system::error_code)>(
            async_echo_implementation{{}, socket},
            token, socket);
}
```

Not only is the state management easier, but it also doesn't need to move the state (i.e. coroutine frame),
that it can become more performant. 