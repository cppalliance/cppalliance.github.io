---
layout: post
nav-class: dark
categories: asio
title: Asio 201 - deferred
author-id: klemens
---

# Asio deferred

## Aysnc operations

Asio introduced the concept of an async_operation, which describes a primary expression
that can be invoked with a completion token. In C++20 this is also a language concept.

```cpp
asio::io_context ctx;
asio::async_operation auto post_op = [&](auto && token){return asio::post(ctx, std::move(token));};

auto f = post_op(asio::use_future);
ctx.run();
f.get(); // void
```

Async operations can be used in `parallel_group` and directly `co_await`ed in C++20.

## `asio::deferred` as a completion token

Using `asio::deferred` as a completion token, will give you a lazy
`async_operation` as the result value.

```cpp
asio::io_context ctx;
asio::async_operation auto post_op = asio::post(ctx, asio::deferred);

auto f = std::move(post_op)(asio::use_future);
ctx.run();
f.get(); // void
```

## deferred expressions

Additionally, a deferred can be invoked with a function object that returns another deferred expression. E.g.:

```cpp
asio::io_context ctx;
asio::async_operation auto post_op = asio::post(ctx, asio::deferred);
asio::async_operation auto double_post_op = 
    asio::post(asio::deferred([&]{return post_op;}));

auto f = std::move(double_post_op)(asio::use_future);
ctx.run();
f.get(); // void
```

This now will call two posts subsequently. 

Not every deferred expression however is an async_operation, deferred provides multiple utilities.

## `deferred.values`

`asio.values` is a deferred expression that just returns values, so that you can modify the completion signature.

```cpp
asio::io_context ctx;
asio::async_operation auto post_int_op = 
    asio::post(ctx, 
        asio::deferred(
            []
            {
                return asio::deferred.values(42);
            }
        ));

auto f = std::move(post_int_op)(asio::use_future);
ctx.run();
assert(f.get() == 42); // int
```

This already can be useful to modify completion signatures, similar to `asio::append` and `asio::prepend`.

## `deferred.when`

Next deferred provides a conditional, that takes two deferred expressions.

```cpp
auto def = asio::deferred.when(condition).then(def1).otherwise(def2);
```

This can be used for simple continuations with error handling. 
Let's say we want to read some memory from `socket1` and write to `socket2`.

```cpp
extern asio::ip::tcp::socket socket1, socket2;
char buf[4096];

auto forward_op = 
    socket1.async_read_some(
        buf, 
        asio::deferred(
            [&](system::error_code ec, std::size_t n)
            {
                return asio::deferred
                    .when(!!ec) // complete with the error and `n`
                    .then(asio::deferred.values(ec, n))
                    .otherwise(
                        asio::async_write(socket2,
                            asio::buffer(buf, n),
                        asio::deferred));
            }
        ));
```

## Multiple `deferred`s

Since all the calls with `deferred` yield async_operations, we can combine more than two, just by invoking the resulting expression. Let's say we want to add a delay at the end of the operation above, we can simple add another deferred.

```cpp
extern asio::ip::tcp::socket socket1, socket2;
extern asio::steady_timer delay;
char buf[4096];

auto forward_op = 
    socket1.async_read_some(
        asio::buffer(buf), 
        asio::deferred(
            [&](system::error_code ec, std::size_t n)
            {
                return asio::deferred
                    .when(!!ec) // complete with the error and `n`
                    .then(asio::deferred.values(ec, n))
                    .otherwise(
                        asio::async_write(socket2,
                            asio::buffer(buf, n),
                        asio::deferred));
            }
        ))
        (
        asio::deferred(
            [&](system::error_code ec, std::size_t n)
            {
                return asio::deferred
                    .when(!!ec)
                    .then(asio::deferred.values(ec, n))
                    .otherwise(
                        delay.async_wait(asio::append(asio::deferred, n))
                    );
            }
            )
        );
```

This now gives us a simple composed operation with three steps.
It also gets increasingly unreadable, which is why asio provides

## `operator|`

Instead of invoking the deferred expression multiple times, you can also just write this:

```cpp
extern asio::ip::tcp::socket socket1, socket2;
extern asio::steady_timer delay;
char buf[4096];

auto forward_op = 
    socket1.async_read_some(asio::buffer(buf), asio::deferred) 
        | asio::deferred(
            [&](system::error_code ec, std::size_t n)
            {
                return asio::deferred
                    .when(!!ec) // complete with the error and `n`
                    .then(asio::deferred.values(ec, n))
                    .otherwise(
                        asio::async_write(socket2,
                            asio::buffer(buf, n),
                        asio::deferred));
            }
        )
        | asio::deferred(
            [&](system::error_code ec, std::size_t n)
            {
                return asio::deferred
                    .when(!!ec)
                    .then(asio::deferred.values(ec, n))
                    .otherwise(
                        delay.async_wait(asio::append(asio::deferred, n))
                    );
        });
```


## Readable code

It should be quite clear that the complexity can get out of hand rather quickly, which is why you should consider separating the continuation functions from the deferred chain.

This can be achieved with by using `append` to pass pointers to the
io objects, like so:


```cpp
auto do_read(asio::ip::tcp::socket * socket1,
             asio::ip::tcp::socket * socket2, 
             char * buf, std::size_t n)
            {
                return socket1->async_read_some(
                    asio::buffer(buf, n), 
                    asio::append(asio::deferred, socket1, buf));
            };

auto do_write(system::error_code ec, std::size_t n,             
              asio::ip::tcp::socket * socket2, char * buf)
            {
                return asio::deferred
                    .when(!!ec) // complete with the error and `n`
                    .then(asio::deferred.values(ec, n))
                    .otherwise(
                        asio::async_write(*socket2,
                            asio::buffer(buf, n),
                        asio::deferred));
            };

template<std::size_t Size>
auto forward_op(
    asio::ip::tcp::socket & socket1,  
    asio::ip::tcp::socket & socket2,
    char (&buf)[Size])
{
    return asio::deferred.values(
        &socket1, &socket2, &buf[0], Size)
        | asio::deferred(&do_read)
        | asio::deferred(&do_write);
}
```


More examples can be found in the [asio repo](https://github.com/chriskohlhoff/asio/tree/master/asio/src/examples/cpp14/deferred).