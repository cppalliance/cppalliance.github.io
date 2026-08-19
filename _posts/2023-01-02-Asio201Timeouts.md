---
layout: post
nav-class: dark
categories: asio
title: Asio 201 - timeouts, cancellation & custom tokens
author-id: klemens
---

Since asio added and beast implemented per-operation cancellation,
the way timeouts can be implemented in asio code has changed significantly.

In this article, we'll go from simple timeouts to building our own timeout completion token helper.

# Cancellation

A timeout is a defined interval after which a cancellation
will be triggered, if an action didn't complete by then.

Timeouts *can* be a way of handling runtime errors, but one should generally be prudent about their usage. Indiscriminate application
of timeouts with intervals based on the programmer's feelings can
lead to bad code and odd behavior.

## Previous solutions

Previous to per-operation cancellation, one could only cancel all operations on a given io-object. E.g.:

```cpp
extern asio::ip::tcp::socket sock;
extern std::string read_buffer, write_buffer;

asio::async_read(sock, asio::dynamic_buffer(read_buffer), asio::detached);
asio::async_write(sock, asio::buffer(write_buffer), asio::detached);

// cancel both the write and the read, by cancelling all outstanding operations
sock.cancel(); 
```

Due to the popularity of timeouts, beast provides it's own stream wrappers, `tcp_stream` & `ssl_stream` that (among other things) provide
a timeout using this kind of cancellation based on internal timers.

## Per operation cancellation

Per operation cancellation is a much more fine-tuned model; 
instead of cancelling all outstanding operations on an io-object,
it cancels particular ones.

```cpp

extern asio::ip::tcp::socket sock;
extern std::string read_buffer, write_buffer;

asio::cancellation_signal cancel_read, cancel_write;

asio::async_read(sock, asio::dynamic_buffer(read_buffer), asio::bind_cancellation_slot(cancel_read.slot(), asio::detached));
asio::async_write(sock, asio::buffer(write_buffer), asio::bind_cancellation_slot(cancel_write.slot(), asio::detached));

// cancel only the read op with cancellation type terminal
cancel_read.emit(asio::cancellation_type::terminal);
```

## Cancellation types

The different kinds of cancellation are:

 - *terminal*:
Requests cancellation where, following a successful cancellation, the only safe operations on the I/O object are closure or destruction.

 - *partial*:
Requests cancellation where a successful cancellation may result in partial side effects or no side effects. Following cancellation, the I/O object is in a well-known state, and may be used for further operations.

 - *total*:
Requests cancellation where a successful cancellation results in no apparent side effects. Following cancellation, the I/O object is in the same observable state as it was prior to the operation.

The sender may combine multiple types with `operator|`; the receiver uses the cancellation as a signal he may ignore and he should satisfy the lowest level of cancellation possible.

## Full example

To give an example of the cancellation types on a protocol level,
consider the following function (written as a coroutine for simplicity):

```cpp
// read data from the stream and forward it to the parser
// until one full value is read.
// whatever is leftover goes into the `buf` to be used for the next value.
template<typename Stream, typename DynamicBuffer>
auto async_read_json(Stream & stream, 
                     json::stream_parser & parser, 
                     DynamicBuffer & buf /*< beast style buffer! */)
    -> asio::awaitable<json::value>
{
    
    // 0: Nothing happened
    while (!parser.done())
    {
        // 1: read the next chunk
        const std::size_t read_n = 
                co_await stream.async_read_some(
                    buf.prepare(4096), asio::use_awaitable);
        // 2: move it to the read buffer
        buf.commit(read_n);
        // 3: write it to the parser
        const auto wbuf = buf.cdata();
        const std::size_t writ_n = parser.write(static_cast<const char*>(wbuf.data()), wbuf.size());
        // 4: remove parsed bytes from the buffer
        buf.consume(writ_n);
    }

    co_return parser.release();
}
```

*terminal*: this means the data & the stream can only be closed. That is, if the algorithm receives a cancellation in step (1), it can just exit directly, because
the cancellation indicates the caller doesn't care about the data anymore.

*partial*: this means the operation might have read actual data, but can be resumed later on. If partial cancellation occurs we need to at least transfer the read data into the buffer; in this case however, they should also be sent to the parser, 
as the json might be complete and next run async_read_some will prevent us from completing.

*total*: Total cancellation means no side effects, i.e. nothing was read. This may happen on our first iteration through the loop, if async_read_some gets cancellation before a single byte has been written.

With this in mind we can rewrite out coroutine to handle cancellation - 
note that `awaitable`s have an internal cancellation state.

```cpp
template<typename Stream, typename DynamicBuffer>
auto  async_read_json(Stream & stream, 
                      json::stream_parser & parser, 
                      DynamicBuffer & buf /*< beast style buffer! */)
    -> asio::awaitable<json::value>
{
    // by default awaitables only allow terminal cancellation
    // we'll enable all types here:
    co_await asio::this_coro::reset_cancellation_state(asio::enable_total_cancellation());
    
    while (!parser.done())
    {
        // check if we've been cancelled!
        asio::cancellation_state cs = co_await asio::this_coro::cancellation_state;
        if (cs.cancelled() != asio::cancellation_type::none)
            break;
        // capture ec, so nothing gets thrown
        const auto [ec, read_n] = 
                co_await stream.async_read_some(
                    buf.prepare(4096), asio::as_tuple(asio::use_awaitable));
        if (ec == asio::error::operation_aborted)
        {
            using c_t = asio::cancellation_type;
            //update the state
            cs = co_await asio::this_coro::cancellation_state;
            c_t c = cs.cancelled(); 
            // total means nothing happened,
            // terminal means the data doesn't matter
            if ((c & (c_t::total | c_t::terminal)) != c_t::none)
                throw system::system_error(ec);
            // partial means we need to finish the loop
            // so we just do nothing and do NOT reset the filter!
        }
        else if (ec) // indiscriminately throw everything else
            throw system::system_error(ec);
        else
                    // reset it to partial after the first read;
            co_await asio::this_coro::reset_cancellation_state(
                asio::enable_partial_cancellation());

        buf.commit(read_n);
        const auto wbuf = buf.cdata();
        const std::size_t writ_n = 
                    parser.write(static_cast<const char*>(wbuf.data()), wbuf.size());
        buf.consume(writ_n);
    }

    asio::cancellation_state cs = co_await asio::this_coro::cancellation_state;
    if (cs.cancelled() != asio::cancellation_type::none)
        throw system::system_error(asio::error::operation_aborted);

    co_return parser.release();
}
```

The above example is complex because it is considering different kinds of cancellation
and when they can be provided to the caller.

# Timeouts

Based on the previous discussion, we may now use a timer 
and connect it to a cancellation slot to provide a timeout.

```cpp
asio::awaitable<std::string> do_read(
    asio::ip::tcp::socket &sock,
    std::chrono::seconds timeout = std::chrono::seconds(5)
)
{
    asio::steady_timer tim{co_await asio::this_coro::executor, timeout};
    asio::cancellation_signal cancel_read;
    std::string read_buffer;

    tim.async_wait(
        [&](system::error_code ec)
        {
            if (!ec) // timer completed without getting cancelled himself
                cancel_read.emit(asio::cancellation_type::all);
        });

    co_await asio::async_read(sock, asio::dynamic_buffer(read_buffer), 
        asio::bind_cancellation_slot(cancel_read.slot(), asio::use_awaitable));
    tim.cancel();

    co_return read_buffer;
}
```

There is a problem in the above code: any cancellation delivered to `do_read` gets ignored. That is, the `awaitable` itself is an async operation that can get cancelled.

```cpp
extern asio::ip::tcp::socket sock;
asio::cancellation_signal dr_c;
asio::co_spawn(sock.get_executor(), do_read(sock), 
               asio::bind_cancellation_slot(dr_c.slot(), asio::detached));
dr_c.emit(asio::cancellation_type::all); // < ignored!
```

In order to rectify this, we need to also need to forward the cancellation received by the `awaitable`:

```cpp
asio::awaitable<std::string> do_read(
    asio::ip::tcp::socket &sock,
    std::chrono::seconds timeout = std::chrono::seconds(5)
)
{
    asio::steady_timer tim{co_await asio::this_coro::executor, timeout};
    asio::cancellation_signal cancel_read;
    asio::cancellation_slot sl = 
        (co_await asio::this_coro::cancellation_state).slot();

    std::string read_buffer;
    sl.assign(
        [&](asio::cancellation_type ct)
        {
            // cancel the timer, we don't need it anymore
            tim.cancel();
            // forward the cancellation
            cancel_read.emit(ct);
        });

    // reset the signal when we're done
    // this is very important, the outer signal might fire after we're out of scope!
    struct scope_exit
    {
        asio::cancellation_slot sl;
        ~scope_exit() { if(sl.is_connected()) sl.clear();}
    } scope_exit_{sl};

    // regular timeout with a timer.
    tim.async_wait(
        [&](system::error_code ec)
        {
            if (!ec) // timer completed without getting cancelled himself
                cancel_read.emit(asio::cancellation_type::all);
        });

    // the actual op
    co_await asio::async_read(sock, asio::dynamic_buffer(read_buffer), 
        asio::bind_cancellation_slot(cancel_read.slot(), asio::use_awaitable));
    tim.cancel();

    co_return read_buffer;
}
```

This is getting a bit verbose, so that users might look for alternatives.

## `parallel_group` / `operator||`

Thus the easiest way to implement a timeout is with a `parallel_group`. You might have seen the `awaitable_operators` used like this:

```cpp
using namespace asio::experimental::awaitable_operators;

extern asio::ip::tcp::socket sock;
extern steady_timer tim;
extern std::string read_buffer;

co_await (
    asio::async_read(sock, asio::dynamic_buffer(read_buffer), asio::use_awaitable) || tim.async_wait(asio::use_awaitable));
```

The `operator||` runs two awaitables in parallel, waiting for one to finish. When the first completes it cancels the other ones `terminal`y.

This gives us a timeout, that will always be terminal, and is implement by means of [parallel_group](https://www.boost.org/doc/libs/master/doc/html/boost_asio/reference/experimental__parallel_group/async_wait.html), i.e. similar to this:

```cpp
co_await 
    experimental::make_parallel_group(
        asio::async_read(sock, asio::dynamic_buffer(read_buffer), asio::deferred),
    tim.async_await(asio::deferred)
        ).async_wait(
            experimental::wait_for_one(),
            asio::use_awaitable
        );
```

This is fine for many simple solutions & examples, 
but it's a very blunt & not terribly efficient way to achieve only terminal cancellation.

It is important to mention, that a per low level operation timeout might also not be the right approach altogether. On the one hand, it might not be required that a particular single operation (like connect) completes within a certain amount of time, but that a series of operations does so (like resolve + connect + handshake).

This means choosing where to put timeouts is a task for careful engineering.

## Watchdogs

Another popular pattern is a watchdog, 
when the requirement is to assure continuous progress. 
That is, we want to make sure, that a long running does not get stuck, but every so often does some successful work.
Consider downloading a huge file; we can't really put a timeout on it, but we can check that it did download some bytes every few seconds.

You would usually use this for complex & long running operations, but for our example, we'll just reuse the 
async_read_json function.

```cpp

template<typename Stream, typename DynamicBuffer>
auto async_read_json(Stream & stream, 
                json::stream_parser & parser, 
                DynamicBuffer & buf, /*< beast style buffer! */
                watchdog & wuff)
    -> asio::awaitable<json::value>
{
    wuff.reset();
    while (!parser.done())
    {
        const std::size_t read_n = 
                co_await stream.async_read_some(
                    buf.prepare(4096), asio::use_awaitable);
        wuff.reset();
        buf.commit(read_n);
        const auto wbuf = buf.cdata();
        const std::size_t writ_n = parser.write(
            static_cast<const char*>(wbuf.data()), wbuf.size());

        buf.consume(writ_n);
    }

    co_return parser.release();
}
```

If the `.reset` function on the watchdog isn't called during the watchdog interval, 
it will cancel the operation.

This watchdog can be as simple as this:

```cpp
struct watchdog
{
    watchdog(asio::any_io_executor exec, std::chrono::milliseconds interval) 
        : tim(exec, interval), interval(interval)
    {}
    
    asio::steady_timer tim;
    std::chrono::milliseconds interval;
    asio::cancellation_signal cancel;
    void reset()
    {
        tim.expires_after(interval);
        tim.async_wait( 
            [this](system::error_code ec)
            {
                if (!ec)
                    cancel.emit(asio::cancellation_type::terminal);
            });
    }
};
```

And we can use it with our awaitable by a simple bind:

```cpp
extern asio::ip::tcp::socket sock;

beast::flat_buffer buf;
json::stream_parser parser;

watchdog wuff{sock.get_executor(), std::chrono::milliseconds(5000)};
asio::co_spawn(sock.get_executor(),
                async_read_json(sock, parser, buf, wuff)
                asio::bind_cancellation_slot(wuff.cancel.slot(), asio::detached)
                );
```

# A custom timeout token

While writing your own completion tokens is a bit of a hassle, 
it may be worth the effort if an entire application is using it. 

Here, we will write a `timeout` utility that utilizes different timeouts
to fire a sequence of all cancellation types. The idea is that we do not want to use terminal cancellation right away, as we might corrupt data unnecessarily with that.

Instead we have three intervals. After the first, we try `total` cancellation; 
if that doesn't do anything, we wait the second interval and use `partial` cancellation.
If nothing happens after that, we go for `terminal`.

```cpp
struct timeout_provider;

// that's our completion token with the timeout attached
template<typename Token>
struct with_timeout
{
    timeout_provider * provider;
    Token token;
};

// this is the timeout source
struct timeout_provider
{
    timeout_provider(
        asio::any_io_executor exec
    ) : tim{exec, std::chrono::steady_clock::time_point::max()} {}
    
    asio::steady_timer tim;

    std::chrono::milliseconds tt_total   = std::chrono::milliseconds(2000);
    std::chrono::milliseconds tt_partial = std::chrono::milliseconds(3000);
    std::chrono::milliseconds tt_partial = std::chrono::milliseconds(5000);

    asio::cancellation_slot parent;
    asio::cancellation_signal timeout;

    asio::cancellation_type last_fired{asio::cancellation_type::none};

    ~timeout_provider()
    {
        if (parent.is_connected())
            parent.clear();
    }

    // to use it 
    template<typename Token>
    auto operator()(Token && token)
    {
        return with_timeout<std::decay_t<Token>>{
                this, std::forward<Token>(token)
        };
    }

    // set up the timer and get ready to trigger
    void arm()
    {
        last_fired = asio::cancellation_type::none;
        tim.expires_after(tt_total);
        if (parent.is_connected())
            parent.assign([this](asio::cancellation_type ct){timeout.emit(ct);});
        tim.async_wait(
            [this](system::error_code ec)
            {
                if (!ec) fire_total();
            });
    }

    void fire_total()
    {
        timeout.emit(last_fired = asio::cancellation_type::total);
        tim.expires_after(tt_partial);
        tim.async_wait(
            [this](system::error_code ec)
            {
                if (!ec) fire_partial();
            });
    }

    void fire_partial()
    {
        timeout.emit(last_fired = asio::cancellation_type::partial);
        tim.expires_after(tt_terminal);
        tim.async_wait(
            [this](system::error_code ec)
            {
                if (!ec) fire_terminal();
            });
    }
    
    void fire_terminal()
    {
        timeout.emit(last_fired = asio::cancellation_type::terminal);
    }    
};
```

The plan is then to use this like so:

```cpp
asio::awaitable<std::string> do_read(
    asio::ip::tcp::socket &sock,
    timeout_provider & timeout)
{
    std::string read_buffer;
    co_await asio::async_read(sock, asio::dynamic_buffer(read_buffer), 
        timeout(asio::use_awaitable));
    co_return read_buffer;
}
```

In order to do that we need to provide a custom async_initiate with a 
custom token. The reason we need a custom handler is that lazy operations like use_awaitable and deferred still work.

Before we jump into a rather long piece of code, let's recap how async initiation works.

We pass a completion token to async_initiate, together with the initiation of our op (e.g. `async_initiate_read`).
The completion token must have a specialization of `async_result` that will call `initiate` with it's completion handler
and return a result value. The handler is usually some internal type, that has associators (e.g. an associated allocator).
For example, `use_awaitable` is a token, `awaitable` the return type of it's initialization and some `detail` type it's handler.

In order for our timeout to work, we need to wrap the other completion token, and then intercept the call to the initiation 
to obtain the handler, and wrap it as well.

```cpp
// the completion handler
// that's our completion token with the timeout attached
template<typename Handler>
struct with_timeout_binder
{
    timeout_provider * provider;
    Handler handler;

    template<typename ...Args>
    void operator()(Args && ... args)
    {
        //cancel the time, we're done!
        provider->tim.cancel();
        std::move(handler)(std::forward<Args>(args)...);
    }
};

namespace boost::asio
{

// This is the class to specialize when implementing a completion token.
template<typename InnerToken, typename ... Signatures>
struct async_result<with_timeout<InnerToken>, Signatures...>
{
    using return_type = typename async_result<InnerToken, Signatures...>::return_type;

    // this wrapper goes around the inner initiation, because we need to capture their cancellation slot
    template<typename Initiation>
    struct init_wrapper
    {
        Initiation initiation;
        timeout_provider * provider;

        // the forwards to the initiation and lets us access the actual handler.
        template <typename Handler, typename... Args>
        void operator()(
            Handler && handler,
            Args && ... args)
        {
            auto sl = asio::get_associated_cancellation_slot(handler);
            if (sl.is_connected())
                provider->parent = sl;
            provider->arm();
            std::move(initiation)(
                with_timeout_binder<std::decay_t<Handler>>{
                    provider,
                    std::forward<Handler>(handler)
                }, std::forward<Args>(args)...);
        }        
    }

    // the actual initiation
    template<typename Initiation, typename RawToken,
             typename ... Args>
    static auto initiate(Initiation && init,
                    RawToken && token,
                    Args && ... args) -> return_type
    {
        return async_result<InnerToken, Signatures...>::initiate(
            // here we wrap the initiation so we enable the above injection
            init_wrapper<std::decay_t<Initiation>>(std::forward<Initiation>(init), token.provider),
            std::move(token.token), 
            std::forward<Args>(args)...);
    }
};


// forward the other associators, such as allocator & executor
template <template <typename, typename> class Associator,
    typename T, typename DefaultCandidate>
struct associator<Associator,
    with_timeout_binder<T>,
    DefaultCandidate>
{
  typedef typename Associator<T, DefaultCandidate>::type type;

  static type get(const with_timeout_binder<T>& b,
      const DefaultCandidate& c = DefaultCandidate()) noexcept
  {
    return Associator<T, DefaultCandidate>::get(b.handler, c);
  }
};

// set the slot explicitly
template <typename T, typename CancellationSlot1>
struct associated_cancellation_slot<
    with_timeout_binder<T>,
    CancellationSlot1>
{
  typedef asio::cancellation_slot type;

  static type get(const with_timeout_binder<T>& b,
      const CancellationSlot1& = CancellationSlot1()) noexcept
  {
    return b.provider->timeout.slot();
  }
};

}
```

The above code can be found in a working example [here](https://gcc.godbolt.org/z/ndxes7Gaf)

While the above code is quite a handful, it does create a new completion token. 
It does however give us more fine-tuned control over timeouts in a very readable 
& fine-tuned way.

