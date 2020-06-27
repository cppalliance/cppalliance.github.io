---
layout: post
nav-class: dark
categories: richard
title: Richard's March Update
author: Richard Hodges
author-id: richard
---

# Coding in the time of a Pandemic

It has been an interesting month, there having been the minor distraction of a lockdown of our
little country. The borders with Spain and France were closed about three weeks ago and
all residents have been asked to stay at home other than to buy groceries or walk their dogs.
Fortunately I have dogs so I at least have a legitimate reason to see the sun.

One of the advantages of living in a tiny country is that the government has been able to 
secure the supply of 150,000 COVID-19 testing kits, which represents two tests per resident.
They are also working on supplying every resident with masks for use when shopping.
I am hoping to report in my next blog that we are allowed outside subject to a negative
test and the wearing of a mask and gloves.

Fortunately, until today, our internet has been uninterrupted. Communication with my friends
and colleagues at the C++ Alliance and the wider developer community has continued.

# Boost Release

The Boost 1.73 release is imminent. Thus much of my focus in the latter half of the month has 
been on addressing any remaining issues in Beast that represent an easy win in terms of 
demonstrating progress between releases.

This brings to a close my first quarter as a maintainer of the Beast library. I would have 
liked to have produced more in terms of feature development and architectural improvements,
but a few interesting things came up which delayed this; some of which I will share with you
here.

# (Possibly) Interesting Asio Things

To say that Boost.Beast has a strong dependency on Boost.Asio would be an understatement. It 
should therefore come as no surprise that the Beast team spend a lot of time working with 
Asio and (certainly in my case) a lot of time working to understand the internals.

We had cause to reach out to Chris Kohlhoff, Asio's author, on two occasions in recent 
times. If you read my February blog you would have seen the issues we have faced with the
`DynamicBuffer` concept. This month it was about the thread-safety of composed operations and 
IO objects.

But first, the result of a question I asked myself:

## Is it possible to write an asynchronous composed operation entirely as a lambda?

In short, if you're using c++14 or better, the answer is happily yes!

Here is the smallest program I could think of:

a: Implemented asynchronously

b: Targeting a POSIX system (just because I happen to know more about POSIX than Windows)

This program simply copies the contents of `stdin` to `stdout`:
 
```cpp
int
main()
{
    asio::io_context ioc;
    auto exec = ioc.get_executor();

    auto in = asio::posix::stream_descriptor(exec, ::dup(STDIN_FILENO));
    auto out = asio::posix::stream_descriptor(exec, ::dup(STDOUT_FILENO));

    async_copy_all(in, out, [](auto&& ec, auto total){
        std::cout << "\ntransferred " << total << " bytes\n";
        if (ec.failed())
        {
            std::cerr << "transfer failure: " << ec.message() << std::endl;
            std::exit(ec.value());
        }
    });

    ioc.run();

    return 0;
}
```

People who are unused to writing composed operations (asynchronous operations that fit into 
the  ASIO ecosystem), or people who have written them longer ago than last year, might at 
this stage feel their hearts sinking in anticipation of the complex horror show awaiting 
them when writing the function `async_copy_all`.

Fortunately, Asio's new(ish) `async_compose` template function makes this reasonably 
painless:

```cpp
template<class InStream, class OutStream, class CompletionToken>
auto
async_copy_all(
    InStream &fd_in,
    OutStream &fd_out,
    CompletionToken &&completion)
{
    return asio::async_compose<
        CompletionToken,
        void(system::error_code const &,std::size_t)>(
            [&fd_in, &fd_out,
                    coro = asio::coroutine(),
                    total = std::size_t(0),
                    store = std::make_unique<char[]>(4096)]
               (auto &self,
                system::error_code ec = {},
                std::size_t bytes_transferred = 0) mutable
        {
            BOOST_ASIO_CORO_REENTER(coro)
            for(;;)
            {
                BOOST_ASIO_CORO_YIELD
                {
                    auto buf = asio::buffer(store.get(), 4096);
                    fd_in.async_read_some(buf, std::move(self));
                }
                if (ec.failed() || bytes_transferred == 0)
                {
                    if (ec == asio::error::eof)
                        ec.clear();
                    return self.complete(ec, total);
                }

                BOOST_ASIO_CORO_YIELD
                {
                    auto buf = asio::buffer(store.get(), bytes_transferred);
                    fd_out.async_write_some(buf, std::move(self));
                }
                total += bytes_transferred;
                if (ec.failed())
                    return self.complete(ec, total);
            }
        },
        completion, fd_in, fd_out);
}
```

There are a few things to note in the implementation. 

1. The first is that the entire asynchronous operation's implementation state is captured 
in the capture block of the lambda (this is why we need c++14 or higher)
2. Secondly, the lambda is mutable. This is so we can update the state and then `move` it 
into the completion handler of each internal asynchronous operation.
3. The second and third arguments of the lambda's function signature are defaulted. This is 
because `async_compose` will cause the implementation (in this case, our lambda) to be called
once with no arguments (other than `self`) during initiation.
4. There is an explicit check for `eof` after the yielding call to `fd_in.async_read_some`. 
In Asio, `eof` is one of a few error codes that represents an informational condition 
rather than an actual error. Another is `connection_aborted`, which can occur during 
an `accept` operation on a TCP socket. Failing to check for this error-that-is-not-an-error 
can result in asio-based servers suddenly going quiet for 'no apparent reason'.
5. Notice that the un-named object created by `async_compose` intercepts every invocation on
it and transfers control to our lambda by prepending a reference to itself to the argument
list. The type of `Self` is actually a specialisation of an `asio::detail::composed_op<...>` 
(as at Boost 1.72). However, since this class is in the detail namespace, this should never 
be relied on in any program or library.
6. Note that I create the buffer object `buf` in separate statements to the initiations of 
the async operations on the streams. This is because the `unique_ptr` called `store` is going
to be `move`d during the initiating function call. Remember that arguments to function calls
are evaluated in unknowable order in c++, so accessing `store` in the same statement in 
which the entire completion handler has been `move`d would result in UB.
7. Finally, `async_compose` is passed both the input and output stream (in addition to their
references being captured in the lambda) so that both streams' associated executors can be
informed that there is outstanding work. It may be surprising to some that the input and 
output streams may legally be associated with different executors.

Actually, now that I write this, it occurs to me that it is unclear to me what is the 
'associated executor' of the composed operation we just created. Asio's documentation is 
silent on the subject. 

Inspecting the code while single-stepping through a debug build revealed that the executor is 
taken from the first of the `io_objects_or_executors&&...` arguments to `async_compose` which
itself has an associated executor. If none of them do, then the `system_executor` is chosen as 
the default executor (more on why this may cause surprises and headaches later). Note that as 
always, wrapping the lambda in a call to `bind_executor` will force the composed operation's
intermediate invocations to happen on the bound executor.

In our case, it is `fd_in` which will be providing the executor and as a result, every 
invocation of our lambda (except the first) is guaranteed to be happen by being invoked 
as if by `post(fd_in.get_executor(), <lambda>(...))`.

## `system_executor` and "What Could Possibly Go Wrong?"

Once upon a time, when I first started using Asio, there were no `executor`s at all. In
fact, there were no `io_context`s either. There was an `io_service` object. At some point 
(I don't remember the exact version of Asio, but it was at least five years ago) the 
`io_service` was replace with `io_context`, an object which did basically the same job.

More recently, the `io_context` represents the shared state of a model of the `Executor`
Named Type Requirement (aka Concept). The state of the art is moving towards passing copies
of `Executor`s rather than references to `io_context`s.

Asio now contains a concrete type, the `executor` which is a type-erased wrapper which
may be assigned any any class which models an `Executor`.

As you might expect, we are heading into a world where there might be more than one model
of `Executor`. In anticipation of this, by default, all Asio IO objects are now associated
with the polymorphic wrapper type `executor` rather than a `io_context::executor_type`.

One such model of `Executor` supplied by Asio is the `system_executor`, which is actually 
chosen as the default associated executor of any completion handler. That is, if you initiate
an asynchronous operation in Asio today, against a hypothetical io_object that does not have
an associated executor and you do not bind your handler to an executor of your own, then
your handler will be invoked as-if by `post(asio::system_executor(), <handler>)` - that is,
it will be called on some implementation-defined thread.

Now that the basics are covered, back to _what could possibly go wrong_?

Well imagine a hypothetical home-grown IO Object or _AsyncStream_. Older versions of the Asio 
documentation used to include an example user IO Object, the logging socket.

The basic premise of our logging socket is that it will do everything a socket will do, plus
log the sending and receiving of data, along with the error codes associated with each read
or write operation. 

Clearly the implementation of this object will contain an asio socket object and some kind of 
logger. The internal state must be touched on every asynchronous operation initiation (to 
actually initiate the underlying operation and record the event) *and* during every 
completion handler invocation, in order to update the logger with the results of the 
asynchronous operation. 

As we know, invocations of intermediate completion handlers happen on the executor associated 
with the final completion handler provided by the user, so in our case, the actions will be
something like this:

```
on the initiating thread:
  logging_socket::async_write_some
    logging_socket::async_write_some_op::operator()()
      logging_socket::impl::update_logger(...)
      socket::async_write_some(...)

... time passes...

on a thread associated with the associated executor:
  logging_socket::async_write_some_op::operator()(ec, bytes_transferred)
    logging_socket::impl::update_logger()
    user_completion_handler(ec, bytes_transferred)
```

The situation will be similar for a write operation.

Now consider the following code (`ls` is an object of our hypothetical type `logging_socket`:

```cpp
  ls.async_write_some(
    get_tx_buffer(),
    net::bind_executor(
      net::system_executor(),
      [](auto ec, auto size){
        /* what happens here is not relevant */
      }));
  ls.async_read_some(
    get_rx_buffer(),
    net::bind_executor(
      net::system_executor(),
      [](auto ec, auto size){
        /* what happens here is not relevant */
      }));
```

What have I done? Not much, simply initiated a read and a write at the same time - a 
perfectly normal state of affairs for a socket. The interesting part is that I have
bound both asynchronous completion handlers to the `system_executor`. This means that 
each of the handlers will be invoked (without synchronisation) on two arbitrary threads.

Looking at our pseudo-code above, it becomes clear that there will be a race for the
`logging_socket`'s implementation:

* Between the initiation of the read and the completion of the write, and
* between the completion of the read and the completion of the write

Again the Asio documentation is silent on the correct method of mitigating this situation.
Two possible workarounds have occurred to me so far:

1. Never use a `system_executor` unless first wrapping it in a `strand`.
2. Ensure that all composed operations of IO objects are thread-safe with respect to 
   mutation of the implementation. If this is made true, it almost inevitably follows that
   the entire IO Object may as well be made thread-safe (which Asio IO Objects are not).

I have reached out to Chris for final judgement and will update the blog (and possibly much
of Beast!) in response to a definitive answer.

# Unified Web Client

I have been given the go-ahead to make a start on exploring a unified web-client library
which will eventually become a candidate for inclusion into Boost.

The obvious course of action, building directly on top of Beast is a no-go. If the 
library is to be used on platforms such as tablets and phones, or appear in the various 
app stores of vendors, there are restrictions on which implementations of communications 
libraries may be used. To cut a long story short, vendors want to minimise the risk of 
security vulnerabilities being introduced by people's home-grown communications and 
encryption code.

So my initial focus will be on establishing an object model that:
 
 * Provides a high degree of utility (make simple things simple).
 * Emulates or captures the subtleties of vendor's Web Client frameworks.
 * Efficiently slots into the Asio asynchronous completion model.

Of course, linux and proprietary embedded systems do not have a mandated communications
libraries, so there will certainly be heavy use of Beast in the unconstrained platform-
specific code. 
  
More information as it becomes available.

