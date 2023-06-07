---
layout: post
nav-class: dark
categories: asio
title: Asio 101 - completion tokens
author-id: klemens
---


This article provides practical code examples for the principles laid out in [N3747](https://www.open-std.org/jtc1/sc22/wg21/docs/papers/2013/n3747.pdf), which Chris Kohlhoff proposed as a standard solution.

# Asynchronous Completion

Completion of asynchronous operations does not have a single solution, 
as is evident by the fact, that many languages provides multiple solutions. 
E.g. Javascript/Typescript:

```ts
function readFileAsync(filename: string): Promise<string>;

// callback style
readFileAsync('readme.md")
    .then((data) => console.log("I read this: ", data))
    .catch((err) => console.error("I couldn't read anything, because ", err));

// coroutine style
try 
{
    console.log("I read this: ", await readFileAsync('readme.md"));
}
catch (err)
{
    console.error("I couldn't read anything, because ", err)
}
```

Language that run in their own VM like Javascript can usually provide those types, 
since they know a lot about their environment. Since this is not the case in C++, 
those assumptions are difficult to make.

Thus asio has come up with a solution after C++11 that is flexible enough to provide virtually all styles of completion.

The idea is to pass in a token that tells asio how the completion has to be handled.

# Completion Tokens.

For our purposes, let's assume a function similar to the above js example.

```cpp
template<typename CompletionToken>
auto async_read_file(asio::any_io_executor exec, std::string path, CompletionToken && token);
```

In asio, most errors are `error_code`s not exceptions, since they have less overhead and easier to pass around.
That is our completion signature is `void(error_code, std::string)` - that is we get a potential error and whatever has been read from the file as a result.

The `any_io_executor` is necessary, as C++ does not have a built-in event loop like javascript. The `async_read_file` function will initiate
the operation and complete when the `execution_context` of `exec` is being run.


## Callbacks

The simplest form of a completion token is a callback.

```cpp
asio::io_context ioc;

async_read_file(ioc.get_executor(), "readme.md",
    [](error_code ec, std::string data)
    {
        if (ec)
            std::cerr << "I couldn't read anything, because " << ec << std::endl;
        else
            std::cout << "I read this: " << data << std::endl;

    });

ioc.run();
```

As you can see, the callback matches the completion signature.

## Futures

Another completion token, usually only helpful in example code, is `use_future`.
It turns the resulting value into a `std::future` depending on the signature.

```cpp
asio::io_context ioc;

std::future<std::string> res = async_read_file(ioc.get_executor(), "readme.md", asio::use_future);

ioc.run();


try 
{
    std::cout << "I read this: " << res.get() << std::endl;
}
catch (system_error & se)
{
    std::cerr << "I couldn't read anything, because " << se << std::endl;
}
```

The `use_future` completion token will create a future, that turns the first parameter 
into an exception if it's an `error_code` (as a `system_error`) or a `std::exception_ptr`.

| Signature | future | get may throw |
|-----------|--------|---------------|
| `void()` | `future<void>` | *nothing*|
| `void(T)` | `future<T>` | *nothing*|
| `void(error_code)` | `future<void>` | `system_error` |
| `void(std::exception_ptr)` | `future<void>` | *anything*|
| `void(error_code, T)` | `future<T>` | `system_error` |
| `void(std::exception_ptr, T)` | `future<T>` | *anything*|

## detached

If the result of an async_operation doesn't matter, `detached` can be used to ignore it.

```cpp
asio::io_context ioc;

async_read_file(ioc.get_executor(), "readme.md", asio::deferred); // void

ioc.run();
```

## awaitable

Similarly, `use_awaitable` will produce an `awaitable`, as C++20 coroutine implementation,
that can be co-awaited from another awaitable. The handling of errors follows the same pattern.
Note, that an `awaitable` can only be awaited from within an other `awaitable`. 
The root `awaitable` can be created using `co_spawn` which itself is a async operation.

```cpp
asio::io_context ioc;

asio::co_spawn(ioc.get_executor(), 
    []() -> asio::awaitable<void>
    {
     try 
    {
        std::string data = co_await async_read_file(
            // get the executor we're running on
            co_await asio::this_coro::executor, "readme.md", asio::use_awaitable);
        std::cout << "I read this: " << data << std::endl;
    }
    catch (system_error & se)
    {
        std::cerr << "I couldn't read anything, because " << se << std::endl;
    }
    }, asio::detached /* completion signature here is void(std::exception_ptr)*/)

ioc.run();
```

The rules applying to `use_awaitable` completions are the same as used by `futures`.

## `spawn`

asio also provides a mechanic using `boost.context` to provide stackful coroutines (that don't require C++20),
which have a stateful completion token.

```cpp
asio::io_context ioc;

asio::spawn(ioc.get_executor(), 
    [](asio::yield_context yield)
    {
     try 
     {
        std::string data = co_await async_read_file(yield.get_executor(), "readme.md", yield);
        std::cout << "I read this: " << data << std::endl;
     }
     catch (system_error & se)
     {
         std::cerr << "I couldn't read anything, because " << se <<  std::endl;
     } 
    }, asio::detached /* completion signature here is void(std::exception_ptr)*/)

ioc.run();
```

Furthermore, libraries such as `boost.fiber` can provide their own completion tokens.

# Completion token modifiers

So far, the tokens use the default error handling strategy for errors. But what if we don't want this?

Completion token modifiers can be used to change that behaviour. We'll illustrate it using use_awaitable.

## `redirect_error`

`redirect_error` takes the error of the completion and assigns it to a provided error_code.

```cpp
asio::error_code ec;

// This will not throw on error now!
std::string data = co_await async_read_file(
    co_await asio::this_coro::executor, "readme.md", 
    asio::redirect_error(ec, asio::use_awaitable));
```

That is, `redirect_error` modifies a completion signature `void(error_code, T)` to `void(T)` and `void(error_code)` to `void()`.

## `as_tuple`

As tuple turns the signature into a tuple. That is `void(T...)` becomes `void(std::tuple<T...>)`.
This causes completion tokens like `use_awaitable` not to pick up the error and throw it.

```cpp
std::tuple<error_code, std::string> result = co_await async_read_file(
    co_await asio::this_coro::executor, "readme.md", 
    asio::redirect_error(ec, asio::use_awaitable));
```

## `append` & `prepend`

Append and prepend allow you to modify the completion signature by adding values at the front or the back of the signature.

For example:

```cpp
async_read_file(ioc.get_executor(), "readme.md",
    asio::append([](error_code ec, std::string data, std::string path)
    {
        if (ec)
            std::cerr << "I couldn't read anything from " << path << " because " << ec << std::endl;
        else
            std::cout << "I read this: " << data << " from " << path << std::endl;

    }, "readme.md");
```

