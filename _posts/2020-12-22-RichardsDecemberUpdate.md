---
layout: post
nav-class: dark
categories: richard
title: Richard's November/December Update
author-id: richard
---

# A Coroutine Websocket Using Boost Beast

This month I thought I would present a little idea that I had a few months ago.

Boost.Beast is a very comprehensive and competent websocket implementation, but it is not what you might call
"straightforward" to use unless you are already wise in the ways of Asio.

Beast's documentation and design makes no apology for this. There is a disclaimer in the 
[documentation](https://www.boost.org/doc/libs/1_75_0/libs/beast/doc/html/beast/using_io/asio_refresher.html):
> To use Beast effectively, a prior understanding of Networking is required.

This is worth taking seriously (and if you are not fully aware of how Asio works with respect to the posting of 
completion handlers onto the associated executor, this page is worth studying).

## The Interface

I wanted to model my websocket object's interface roughly on the javascript websocket connection interface. There will
be a few differences of course, because the javascript version uses callbacks (or continuations) and I will be using 
C++ coroutines that execute on an Asio executor. In underlying implementation, these concepts are not actually that far
apart, since Asio awaitables are actually implemented in terms of the normal asio completion token/handler interaction.

Furthermore, I want my WebSocket's connection phase to be cancellable.

My websocket interface will look something like this:

```cpp
namespace websocket
{
    struct message 
    {
        bool is_binary() const;
        bool is_text() const;
        std::string_view operator*() const;
    }; 
    
    struct event 
    {
        bool is_error() const;
        bool is_message() const;
        error_code const& error() const; 
        message const& message() const;
    };
    
    struct connection
    {
        /// Schedule a frame to be sent at some point in the near future
        void 
        send(std::string_view data, bool as_text = true);

        /// Suspend and wait until either there is a message available or an error        
        net::awaitable<event> 
        consume();
        
        /// Close the websocket and suspend until it is closed.
        net::awaitable<void> 
        close(beast::websocket::close_reason = /* a sensible default */); 

        /// Send the close frame to the server but don't hang around to wait
        /// for the confirmation.
        void 
        drop(beast::websocket::close_reason = /* a sensible default */);

        /// If consume() exits with an error of beast::websocket::error::closed then this
        /// will return the reason for the closure as sent by the server.
        /// Otherwise undefined.        
        beast::websocket::close_reason
        reason() const;
    };
    
    net::awaitable<connection> 
    connect(std::string url, 
            connect_options options /* = some default */);
}
```

The idea here is to keep the interface as lightweight and as simple as possible. The websocket connection will run on 
the executor of the coroutine that created it. Any commands sent to the websocket will be executor safe. That is, 
internally their work will be dispatched to the websocket connection's executor. The exception to this will be the 
close_reason method, which must only be called once the connection's consume coroutine has returned an error event.
It is a guarantee that once `consume` returns an event that is an error, it will never return anything else, and no
other method on the connection will mutate its internal state. In this condition, it is legal to call the `reason` 
method. 

A typical use would look like this:

```cpp
    // default options
    auto ws = co_await websocket::connect("wss://echo.websocket.org"); 

    for(;;)
    {
        auto event = co_await ws.consume();
        if (event.is_error())
            break;
        else
            on_message(std::move(event.message()));
    }    
```

The above code example does not provide any means to write to the websocket. But it would be trivial to either spawn
another coroutine to handle the writer, or call a function in order to signal some orthogonal process that the websocket 
was ready.

```cpp
    // default options
    auto ws = co_await websocket::connect("wss://echo.websocket.org"); 
    
    on_connected(ws); // The websocket object should be shared-copyable

    for(;;)
    {
        auto event = co_await ws.consume();
        if (event.is_error()) {
            on_close();
            break;
        }
        else
            on_message(std::move(event.message()));
    }    
```

Another way to visualise a websocket is exactly as javascript's websocket connection does, using callbacks or 
continuations in order to notify user code that the websocket has received data or closed. It would be trivial to wrap
our coroutine version in order to provide this functionality. We would need to spawn a coroutine in order to run 
the `consume()` loop and then somehow signal it to stop if the websocket was disposed of.

User code might then start to look something like this:

```cpp
    websocket::connect("wss://echo.websocket.org", options)
        .on_connect([](websocket::connection ws)
        {
            run_my_loop(ws);
        });
        
void run_my_loop(websocket::connection ws)
{
    bool closed = false;
    ws.on_close([&]{ closed = true; });
    ws.on_error([&]{ closed = true; });
    ws.on_message([&](websocket::message msg){ process_message(msg); });

    // some time later
    ws.send("Hello, World!");
}
```

With this style of interface we would need some means of passing the executor on which the continuations would be 
invoked. A reasonable place to do this might be the `options` parameter.

In the JavaScript style interface, it would be important to be able to detect when the websocket has gone out of scope
and ensure that it closes correctly, otherwise we'll have a rogue resource out there with no handle by which we can 
close it. This argues that the actual `websocket::connection` class should be a handle to an internal implementation
and that the destructor of the handle should ensure that the implementation is signalled so that it can `drop` the 
connection and shutdown cleanly. Under the covers, we're implementing this websocket in Boost.Beast. As with all Asio
objects, there could be (probably will be) asynchronous operations in progress at the time the websocket handle goes 
out of scope.

Thinking this through, it means that:
 - The implementation is going to live longer than the lifetime of the last copy of the handle owning the implementation.
 - There needs to be some mechanism to cancel the underlying implementation's operations.

Coroutines can be visualised as threads of execution. In the world of threads (e.g. `std::thread`) we have primitives
such as `std::stop_token` and `std::condition_variable`. The C++ Standard Library does not yet have these primitives
for coroutines. And if it did it would be questionable whether they would be suitable for networking code where 
coroutines are actually built on top of Asio composed operations. Does Asio itself provide anything we can use?

## Asio's Hidden Asynchronous condition_variable

The answer is surprisingly, yes. But not in the form I was expecting when I asked Chris Kohlhoff (Asio's author and 
maintainer) about it. It turns out that asio's timer models an asynchronous version of a condition variable perfectly. 
Consider:

Given:
```cpp
auto t = net::steady_timer(co_await net::this_coro::executor);
t.expires_at(std::chrono::stready_clock::time_point::max());
```

Then we can write:

```cpp
template<class Pred>
net::awaitable<void>
wait(net::steady_timer& t, Pred predicate)
{
    error_code ec;
    while(!ec && !predicate())
    {
        co_await t.async_wait(net::redirect_error(net::use_awaitable, ec));
        if (ec == net::error::operation_aborted)
            // timer cancelled
            continue;
        else
            throw std::logic_error("unexpected error");
    } 
}

void
notify(net::steady_timer& t)
{
    // assuming we are executing on the same executor as the wait()
    t.cancel();
}
```

Which gives us a simple asynchronous condition_variable (this one does not implement timeouts, but it would be trivial
to extend this code to accommodate them).

## Asynchronous Stop Token

The `std::stop_token` is a welcome addition to the standard, but it is a little heavyweight for asynchronous code that 
runs in an executor, which is already thread-safe by design. A simple in-executor stop source can be implemented 
something like this:

```cpp
namespace async {
namespace detail {
struct shared_state {
    void stop()
    {
        if (!std::exchange(stopped_, true))
        {
            auto sigs = std::move(signals_);
            signals_.clear();
            for(auto& s : sigs)
                s();
        }
    }
    
    std::list<std::function<void()>> signals_;
    bool stopped_ =  false;
};
}
struct stop_source {
    void stop() {
        impl_->stop();
    }
    std::shared_ptr<shared_state> impl_;
}

struct stop_connection
{
};

struct stop_token
{
    stop_token(stop_source& source)
    : impl_(source.impl_) {
    }
    
    bool 
    stopped() const { return !impl_ || impl_->stopped_; }
    
    stop_connection 
    connect(std::function<void()> slot);
     
    std::shared_ptr<shared_state> impl_;
}
}
```

The use case would look something like this:

```cpp

net::awaitable<void>
something_with_websocket(async::stop_token token)
{
    // passing the stop token allows the connect call to abort early
    // if the owner of the stop_source wants to end the use of the
    // websocket before it is connected
    auto ws = websocket::connect("wss://echo.websocket.org", 
        websocket::connect_options { .stop_token = token });

    // connect a slot to the stop token which drops the connection        
    auto stopconn = token.connect([&] { ws.drop(); };
    
    for(;;} {
        auto event = co_await ws.consume();
        // ...etc
    }
    
}   
```

Now, armed with both a `stop_token` and a `condition_variable`, we gain a great deal of flexibility with programs 
running on an Asio-style executor.

So let's build a little chat app to talk the the echo bot.

## Coding style when using Asio coroutines.

I mentioned earlier that I like to decompose objects with complex lifetimes into an impl and handle. My personal 
programming style for naming the components is as follows:

### The implementation

This is the class that implements the complex functionality that we want. I generally give this class an `_impl` suffix
and apply the following guidelines:
- The impl does not control its own lifetime.
- Calls to the impl are expected to already be executing on the correct thread or strand, and in the case of 
  multi-threaded code, are expected to have already taken a lock on any mutex.
  
This is a personal preference which I find tends to lower the complexity of the object, since the interface functions
do not have to manage more than one concern, and deadlocks etc are not possible.

### The lifetime

When holding an object in shared_ptr, we get a chance to intercept the destruction of the last handle. At this point
we do not have to destroy the implementation, but can allow it to shut down gracefully before destruction.
In order to do this, particularly with an object that is referenced by internal coroutines, I have found that it's 
useful to separate the public lifetime of the object, and its internal lifetime, which may be longer than the public 
one.

A convenient, if not especially efficient way to do this is to hold two shared_ptr's in the handle. One being a
shared_ptr<void> which has a custom destructor - the lifetime ptr, and one being a normal shared_ptr to the 
implementation which can be copied in order to extend its private lifetime while it shuts down.
It is the responsibility of the custom deleter to signal the implementation that it should start shutting down.

In this case, the websocket connection's public handle may look something like this:

```cpp
namespace websocket {

struct connection_lifetime
{
    connection_lifetime(std::shared_ptr<connection_impl>&& adopted)
    : impl_(std::move(adopted))
    , lifetime_(new_lifetime(impl_))
    {
    }
    
    static std::shared_ptr<void>
    new_lifetime(std::shared_ptr<connection_impl> const& impl)
    {
        static int useful_address;
        auto deleter = [impl](int*) noexcept
        {
            net::co_spawn(impl->get_executor(), 
                [impl]() -> net::awaitable<void>
                { 
                    co_await impl->stop();
                }, net::detached);
        };
        
        return std::shared_ptr<void>(&useful_address, deleter);
    }
    
    std::shared_ptr<connection_impl> impl_;
    std::shared_ptr<void> lifetime_;
};

struct connection
{
    connection(connection_lifetime l);
};
}
```

The interesting part here is in the function `new_lifetime`. There are a few things going on here.
First, we are capturing the internal lifetime of our `connection_impl` and storing it in the deleter of the lifetime 
pointer. This of course means that the private implementation will live at least as long as the public lifetime.
Secondly, the deleter does not actually delete anything. It merely captures a copy of the impl pointer and runs a 
coroutine on the impl to completion before releasing the impl pointer. The idea is that this coroutine will not complete
until all internal coroutines within the implementation have completed. The provides the fortunate side effect that
operations running inside the impl do not have to capture the impl's lifetime via shared_from_this.
It turns out that this aids composability, since subordinate coroutines within the implementation can be written as free
functions, and ported to other implementations that may not involve a shared_ptr.
It also means that the impl itself can be composed, since it has no restrictions on lifetime semantics.
i.e. If I wanted to implement a JSON-RPC connection by deriving from the websocket::connection_impl, I do not have to 
be concerned about translating shared_ptrs internally in the derived class.

# Once it's all put together

Finally, having created all the primitives (which I really should start collating into a library), we can test our
little websocket chat client, which becomes a very simple program:

Here's main:
```cpp
int
main()
{
    net::io_context ioctx;

    net::co_spawn(
        ioctx.get_executor(), [] { return chat(); }, net::detached);

    ioctx.run();
}
```

And here's the chat() coroutine:

```cpp
net::awaitable< void >
chat()
{
    // connect the websocket
    auto ws = co_await websocket::connect("wss://echo.websocket.org");

    // spawn the coroutine to read console input and send it to the websocket
    auto stop_children = async::stop_source();
    net::co_spawn(
        co_await net::this_coro::executor,
        [stop = async::stop_token(stop_children), ws]() mutable {
            return do_console(std::move(stop), std::move(ws));
        },
        net::detached);

    // read events from the websocket connection.
    for (;;)
    {
        auto event = co_await ws.consume();
        if (event.is_error())
        {
            if (event.error() == beast::websocket::error::closed)
                std::cerr << "peer closed connection: " << ws.reason()
                          << std::endl;
            else
                std::cerr << "connection error: " << event.error() << std::endl;
            break;
        }
        else
        {
            std::cout << "message received: " << event.message() << std::endl;
        }
    }
    
    // at this point, the stop_source goes out of scope, 
    // which will cause the console coroutine to exit.
}
```

And finally, the do_console() coroutine. Note that I have used asio's posix interface to collect console input. 
In order to run compile in a WIN32 environment, we'd need to do something different (suggestions welcome via PR!).

```cpp
net::awaitable< void >
do_console(async::stop_token stop, websocket::connection ws)
try
{
    auto console = asio::posix::stream_descriptor(
        co_await net::this_coro::executor, ::dup(STDIN_FILENO));
    auto stopconn = stop.connect([&] { console.cancel(); });

    std::string console_chars;
    while (!stop.stopped())
    {
        auto line_len =
            co_await net::async_read_until(console,
                                           net::dynamic_buffer(console_chars),
                                           '\n',
                                           net::use_awaitable);
        auto line = console_chars.substr(0, line_len - 1);
        console_chars.erase(0, line_len);
        std::cout << "you typed this: " << line << std::endl;
        ws.send(line);
    }
}
catch(...) {
  // error handling here
}
```

If you'd like to look into the complete code, submit a PR or offer some (probably well-deserved) criticism, you will
find the [code repository here](https://github.com/madmongo1/blog-december-2020).
