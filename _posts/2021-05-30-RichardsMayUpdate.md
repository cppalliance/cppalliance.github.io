---
layout: post
nav-class: dark
categories: richard
title: Richard's May 2021 Update
author-id: richard
---

# The Month in Review

It's been a month of minor maintenance fixes, and a fair amount of support requests via
the [C++ Alliance Slack workspace](https://cppalliance.org/slack/).

## Property_tree

On the maintenance front, there are a number of historic pull requests in the property_tree repo which need working
through. Some of these take some unravelling and a degree of care, as I am still new to this venerable library and I
have the impression that it is used fairly ubiquitously in many code bases of varying pedigree.

Currently I have no way of reaching out to users (not knowing exactly who they are) so the only way to know whether a
change is going to break someone's build is to release it, by which time it is too late.

I think the answer here is to start building out more test cases. Property_tree only recently gained CI, and so far I
have not gotten around to adding test coverage. No doubt I'll get to this in due course.

## Beast

There are a lot of eager developers out there keen to use Beast and Asio, which is encouraging. The less encouraging
thing is the amount of time I find myself spending giving ad-hoc support to people who have hit the Asio mental brick
wall (which I remember when learning this fantastic library all too well).

I have written blogs in this series before covering some of the topics I think are important and developers often
misunderstand, but there is more to do.

With this in mind, an idea has been germinating over the past few months, which finally started to develop into a new
library this month. I'll come back to this later.

## Asio

A few months ago I attended a WG21 meeting where a formal means of providing cancellation to asynchronous operations was
proposed. A few people at that meeting, myself included, were concerned that the proposal in its current form would
constrain the development style of asynchronous programs, making the fundamental objects a little more complex than they
often need to be.

I have recognised that Asio needs a formal task cancellation mechanism for some time, this being the basis of the async
cancellation_token mentioned in a previous blog.

I have been able to get some of Chris Kohlhoff's valuable time to discuss this to see whether there is a way to get
effortless cancellation into Asio without impacting performance or compiled size when cancellation is not required.

Chris, as he is wont to do, made the rather brilliant connection that in Asio, a 1-shot cancellation token can be
associated with each asynchronous completion handler, with the default token type being a zero-cost abstraction of a
null cancellation token - i.e. one that will never invoke the stop callback.

The general idea being that if you want an operation to be cancellable, you would invoke it like this:

```cpp
// This is the signal object that you would use to 
// cancel any operation that depends on one of its slots
asio::cancellation_signal sig; 

// some IO Object
timer t(ioc, chronons::seconds(5));

// perform an asynchronous operation bound to the cancellation signal
t.async_wait(
    bind_cancellation_slot(sig.slot(),
      [](system::error_code ec)
      {
        // if the signal is invoked, the timer's asynchronous operation will notice
        // and the operation will complete with ec equal to asio::errors::operation_aborted
      });
      
// signal the cancellation
sig.emit():
```

The interesting thing about this is that the cancellation slot is associated with the asynchronous operation's handler.
This is not only useful for a library-provided asynchronous operation such as a timer wait. Because of the existence of
a function called `get_associated_cancellation_slot(handler)`, the current slot is available in any context where user
code has access to the current asynchronous completion handler.

One such place is in a user-defined composed operation, and therefore by extension, a c++ coroutine running in the
context of an Asio executor.

This now becomes possible:

```cpp

asio::awaitable<void>
my_coro(some_async_op& op)
{
    // The cancellation state allowed us to detect whether cancellation has been requested
    // It also allows us to register our own cancellation slot
    auto cs = asio::this_coro::cancellation_state;
    
    // Create a new slot from the cancellation state and register a callback which will 
    // invoke our own custom cancel signal on the some_async_op
    // note: A
    auto slot = cs.slot();
    slot.emplace([&]{ op.cancel(); });

    // continue to wait on the some_async_op
    co_await op.wait_to_finish();
}
```

This coroutine could be invoked in a couple of ways:

```cpp

// In this case the cancellation state is a no-op cancellation. 
// the code at note A above will do nothing. This coroutine is not cancellable.
co_await asio::co_spawn(exec, 
                        my_coro(op), 
                        asio::use_awaitable);

// In this case, the coroutine has become cancellable because the code at note A will actually
// create a functioning slot and register the lambda.
// The coroutine is cancellable through the cancellation signal sig.
asio::cancellation_signal sig;
co_await asio::co_spawn(exec, 
                        my_coro(op), 
                        asio::bind_cancellation_signal(
                            asio::use_awaitable, sig));
```

This code is experimental at the moment, but is available  
[on the generic-associators branch of Boost.Asio](https://github.com/boostorg/asio/tree/generic-associators).

# The Project du Jour

Coming back to the "Asio is hard at the beginning" meme, I was speaking to my son recently. He works with a number of
languages, including Python, Go and C++.

During a conversation about these he mentioned that Go was a very uninspiring language (to him) but it was very easy to
get fairly complex asynchronous programs functioning reliably in a short amount of time.

I asked him what the single most effective feature of the language was, to which he replied, "channels".

For anyone who does not already know, a golang channel is simply a multi-producer, multi-consumer ring buffer with an
asynchronous interface.

It has the following behaviour:

- Producer coroutines will suspend when providing values to the channel if the ring buffer is full and there is no
  consumer pending a consume operation.
- Consumer coroutines will suspend when consuming if the ring buffer is empty and there is no pending producer operation
  in progress.
- The ring buffer capacity is specified upon construction, and may be zero. Producers and consumers of a zero-sized
  channel will only make progress if there is a corresponding pair of producer and consumer pending at the same time. In
  this way, the channel also acts as a coroutine synchronisation primitive.
- Finally, the channel may be closed. A closed channel will allow a consumer to consume remaining values in the ring
  buffer, but it will not allow a producer to provide more values, whether into the ring buffer or directly to a pending
  consume operation. A consume operation against an empty, closed channel will yield a default-constructed object plus a
  boolean false indicating that there are no more values to consume.

There are some other nice features in Go, such as the select keyword which interact with channels in a pleasing way, but
for now I'll focus on how we might implement the channel in asynchronous C++.

The rationale here being:

- Channels make writing complex asynchronous interactions simple.
- Make simple things simple is the mantra to which I subscribe.
- Perhaps C++ enthusiasts would benefit from an implementation of channels.
- Given the flexibility of C++, we might be able to do a better job than Go, at least in terms of giving the programmer
  some choice over implementation tradeoffs.
- Maybe a little library offering this functionality in a simple, reusable way would be a useful addition to Boost.

I put some feelers out in the CppLang slack. So far the response to the idea has been only positive. So I decided to
make a start.

TLDR - you can monitor how far I am getting by looking at
the [Github repository](https://github.com/madmongo1/boost_channels).

## Approach

I wanted the channels library to be built on top of Asio. The reason for this is that I happen to think that the Asio
executor model is very elegant, and allows the programmer to transpose the same fundamental idea onto a number of
different concurrency strategies. For example, thread pools, IO loop, threads and futures, and so on.

Asio's completion tokens allow the adaptation of asynchronous initiating functions to any or all of these strategies and
I wanted to make sure that the library will provide this functionality.

Furthermore, asynchronous programs become complex quickly. Asio is a natural fit for IO, but does not provide the
primitives that programmers often find they need to create rich programs.

It is my hope that this channels library provides people with a useful tool to make high performance, highly concurrent
programs easier to write in C++.

## Design Decisions

I have elected to write library in two sections. The first will contain the basic objects to handle the concurrent
communication and asynchronous completions. These objects will not be thread-safe, just like any other object in Asio.

The second will be a thread-safe interface written in terms of the first. The truth is that Asio objects do not need to
be thread-safe if programmers use the correct discipline vis-a-vis strands and ensuring that work is dispatched to the
correct strand. Another truth is that many programmers just want things to be easy. So why not provide an easy-mode
interface too?

## Comparison

OK, so let's take a simple Go program and see how we could express that in terms of Asio and C++ coroutines. Now I'm no
expert, so I'm sure there are many ways to improve this program. It's about the third Go program I've ever written.
Please by all means let me know.

```go
package main

import (
	"fmt"
	"sync"
)

func produce(wg *sync.WaitGroup, c chan<- string) {
	defer wg.Done()
	c <- "The"
	c <- "cat"
	c <- "sat"
	c <- "on"
	c <- "the"
	c <- "mat"
	close(c)
}

func consume(wg *sync.WaitGroup, name string, c <-chan string) {
	defer wg.Done()
	for {
		s, more := <-c
		if more {
			fmt.Println(name, ":", s)
		} else {
			fmt.Println(name, ": Channel closed", name)
			break
		}
	}
}

// Main function
func main() {
	var wg sync.WaitGroup
	wg.Add(4)
	c := make(chan string)
	go consume(&wg, "a", c)
	go consume(&wg, "b", c)
	go consume(&wg, "c", c)
	go produce(&wg, c)
	wg.Wait()
}
```

And this is how I would envision it would look in the first cut of the C++ version:

```cpp
auto
produce(channels::channel< std::string > &c) 
    -> asio::awaitable< void >
{
    constexpr auto wait = asio::use_awaitable;
    co_await c.async_send("The", wait);
    co_await c.async_send("cat", wait);
    co_await c.async_send("sat", wait);
    co_await c.async_send("on", wait);
    co_await c.async_send("the", wait);
    co_await c.async_send("mat", wait);
    c.close();
}

auto
consume(std::string_view name, channels::channel< std::string > &c)
    -> asio::awaitable< void >
{
    auto ec  = channels::error_code();
    auto tok = asio::redirect_error(asio::use_awaitable, ec);
    for (;;)
    {
        auto s = co_await c.async_consume(tok);
        if (ec)
        {
            std::cout << name << " : " << ec.message() << "\n";
            break;
        }
        else
            std::cout << name << " : " << s << "\n";
    }
}

int
main()
{
    auto ioc = asio::io_context();
    auto c   = channels::channel< std::string >(ioc.get_executor());

    asio::co_spawn(ioc, consume("a", c), asio::detached);
    asio::co_spawn(ioc, consume("b", c), asio::detached);
    asio::co_spawn(ioc, consume("c", c), asio::detached);
    asio::co_spawn(ioc, produce(c), asio::detached);

    ioc.run();
}
```

One example of the output of the Go program (the order is actually nondeterministic) is:

```text
a : The
a : cat
b : sat
b : mat
b : Channel closed b
a : on
a : Channel closed a
c : the
c : Channel closed c
```

while the output of the C++ program is a more deterministic:

```text
a : The
b : cat
c : sat
a : on
b : the
c : mat
a : Channel is closed
b : Channel is closed
c : Channel is closed
```

I'm not an expert in Go by any means but I imagine the nondeterminism in the Go program is in part due to the fact that
the goroutine implementation is allowed to take shortcuts to consume data synchronously if it's available. The Asio
model requires that each completion handler is invoked as-if by a call to `post(handler)`. In this program, these posts
are being made to a single-threaded io_context and so are being executed sequentially, preserving the order of
invocation during execution.

If this program were multi-threaded, it might be a different story. But this will have to wait until the basic
single-threaded implementation is complete.

## Implementation Details

The implementation of the channel is actually fairly straightforward. The asynchronous initiation interfaces are
standard asio, e.g.:

```cpp
template < class ValueType, class Executor >
template < BOOST_ASIO_COMPLETION_TOKEN_FOR(void(error_code)) SendHandler >
BOOST_ASIO_INITFN_RESULT_TYPE(SendHandler, void(error_code))
channel< ValueType, Executor >::async_send(value_type    value,
                                           SendHandler &&token)
{
    if (!impl_) [[unlikely]]
        BOOST_THROW_EXCEPTION(std::logic_error("channel is null"));

    return asio::async_initiate< SendHandler, void(error_code) >(
        [value = std::move(value), this](auto &&handler) {
            auto send_op = detail::create_channel_send_op(
                std::move(value),
                this->impl_->get_executor(),
                std::forward< decltype(handler) >(handler));
            impl_->notify_send(send_op);
        },
        token);
}
```

The macros are supplied by Asio and simply ensure that the most up-to-date compiler facilities are used to ensure that
the completion token/handler has the correct signature. `BOOST_ASIO_INITFN_RESULT_TYPE` deduces the return type of the
selected specialisation of `async_initiate`. It is what ensures that `async_send` returns an awaitable when the
completion token is of type `asio::use_awaitable`, or a `std::future` if we were to pass in `asio::use_future`.

The actual work of the send is performed in the implementation class:

```cpp
    void
    notify_send(detail::channel_send_op_concept< ValueType > *send_op)
    {
        // behaviour of send depends on the state of the implementation.
        // There are two states, running and closed. We will be in the closed
        // state if someone has called `close` on the channel.
        // Note that even if the channel is closed, consumers may still consume
        // values stored in the circular buffer. However, new values may not
        // be send into the channel.
        switch (state_)
        {
        case state_running:
            [[likely]] if (consumers_.empty())
            {
                // In the case that there is no consumer already waiting,
                // then behaviour depends on whether there is space in the
                // circular buffer. If so, we store the value in the send_op
                // there and allow the send_op to complete.
                // Otherwise, we store the send_op in the queue of pending
                // send operations for later processing when there is space in
                // the circular buffer or a pending consume is available.
                if (free())
                    push(send_op->consume());
                else
                    senders_.push(send_op);
            }
            else
            {
                // A consumer is waiting, so we can unblock the consumer
                // by passing it the value in the send_op, causing both
                // send and consume to complete.
                auto my_receiver = std::move(consumers_.front());
                consumers_.pop();
                my_receiver->notify_value(send_op->consume());
            }
            break;
        case state_closed:
            // If the channel is closed, then all send operations result in
            // an error
            [[unlikely]] send_op->notify_error(errors::channel_closed);
            break;
        }
    }
```

An interesting feature of the send operation class is that when it is instructed to complete, it must:

- Move the value out of itself,
- Move the completion handler out of itself,
- Destroy itself, returning memory back to the allocator.
- Post the completion handler to the correct executor.
- Return the value.

The order is important. Later on we will be adding Asio allocator awareness. In order to maximise efficiency, Asio
asynchronous operations must free their memory back to the allocator before completing. This is so that during the
execution of the completion handler, the same memory that was just freed into asio's special purpose allocators will be
allocated and used to compose the next completion handler. This memory will be at the head of the allocator's list of
free blocks (and therefore found first) and it will be in cached memory, having just been touched.

```cpp
template < class ValueType, class Executor, class Handler >
auto
basic_channel_send_op< ValueType, Executor, Handler >::consume() -> ValueType
{
    // move the result value to the local scope
    auto result  = std::move(this->value_);
    
    // move the handler to local scope and transform it to be associated with
    // the correct executor.
    auto handler = ::boost::asio::bind_executor(
        std::move(exec_),
        [handler = std::move(handler_)]() mutable { handler(error_code()); });
    
    // then destroy this object (equivalent to delete this)
    destroy();
    
    // post the modified handler to its associated executor
    asio::post(std::move(handler));
    
    // return the value from the local scope to the caller (but note that NRVO
    // will guarantee that there is not actually a second move)
    return result;
}
```

That's all for now. I'll add extra blog entries as and when I make any significant progress to the library.

In the meantime, I'm always happy to receive queries by email or as issues in the github repo.

Thanks for reading.

Richard Hodges<br/>
for C++ Alliance<br/>
[hodges.r@gmail.com](mailto:hodges.r@gmail.com)
