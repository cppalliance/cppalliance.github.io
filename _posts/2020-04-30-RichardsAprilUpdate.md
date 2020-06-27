---
layout: post
nav-class: dark
categories: richard
title: Richard's April Update
author: Richard Hodges
author-id: richard
---

# Boost 1.73 Released and other Matters

The 1.73.0 release of Boost took up more attention than I had anticipated, but in the end all seemed to go well.

Since then I've been working through the issues list on GitHub and am now starting to make some headway.

I cam across a few other interesting (to me) topics this month.

# (Possibly) Interesting Asio Things

Last month I asked the question, "Is it possible to write an asynchronous composed operation entirely as a lambda?".

This month I went a little further with two items that interested me.

The first is whether asio's `async_compose` can be adapted so that we can implement a complex composed operation involving 
more than one IO object easily using the asio faux `coroutine` mechanism.

The second was whether is was possible to easily implement an async future in Asio.

## Async Asio Future

Here is my motivating use case:

```cpp
    auto p = async::promise<std::string>();
    auto f = p.get_future();

    // long-running process starts which will yield a string
    start_something(std::move(p));

    // wait on the future
    f.async_wait([](some_result_type x) {
      // use the x
    });

    // or
    auto str = co_await f.async_wait(net::use_awaitable);

   // or shorthand
   auto str = co_await f();

```

The salient points here are:
* no matter on which thread the promise is fulfilled, the future will complete on the associated executor of the handler
  passed to `async_wait`
* Ideally the promise/future should not make use of mutexes un-necessarily.
* (problematic for ASIO) It must work with objects that are not default-constructable.

In the end, I didn't achieve the second goal as this was not a priority project, but I would be interested to see
if anyone can improve on the design.

The source code is [here](https://github.com/madmongo1/webclient/blob/develop/include/boost/webclient/async/future.hpp)

I tried a couple of ways around the non-default-constructable requirement. My first was to require the CompletionToken
to the async_wait initiating function to be compatible with:

```cpp
void (error_code, std::optional<T>)
```

But I felt this was unwieldy.

Then I remembered Boost.Outcome. I have been looking for a use for this library for some time.
It turns out that you can legally write an ASIO composed operation who's handler takes a single
argument of any type, and this will translate cleanly when used with `net::use_future`, `net::use_awaitable` etc.

A default Boost.Outcome object almost fits the bill, except that its exception_ptr type is boost rather than standard.

This is easily solved with a typedef:
```cpp
template<class T> using myoutcome = boost::outcome2::basic_outcome<T, error:code, std::exception_ptr>;
```

I was feeling please with myself for figuring this out, until I came to test code code under C++11... and realised
that Boost.Outcome is only compatible with C++14 or higher.

So in the end, I cobbled together a 'good enough' version of outcome using a variant:

```cpp
template < class T >
struct outcome
{
    outcome(T arg) : var_(std::move(arg)) {}
    outcome(error_code const& arg) : var_(arg) {}
    outcome(std::exception_ptr const& arg) : var_(arg) {}

    auto has_value() const -> bool { return polyfill::holds_alternative< T >(var_); }
    auto has_error() const -> bool { return polyfill::holds_alternative< error_code >(var_); }
    auto has_exception() const -> bool { return polyfill::holds_alternative< std::exception_ptr >(var_); }

    auto value() & -> T &;
    auto value() && -> T &&;
    auto value() const & -> T const &;

    auto error() const -> error_code const &;

    using variant_type = polyfill::variant< T, error_code, std::exception_ptr >;
    variant_type var_;
};
```

The code for this is [here](https://github.com/madmongo1/webclient/blob/develop/include/boost/webclient/polyfill/outcome.hpp)

Finally this allowed me to express intent at the call site like so:

```cpp
    auto f = p.get_future();

    f.async_wait([](outcome<std::string> os){
        if (os.has_value())
            // use the value
        else if (os.has_error())
            // use the error
        else
            // deal with the exception
    });
```

The coroutine interface can be made cleaner:

```cpp
    try {
        auto str = co_await f();
        // use the string
    }
    catch(system_error& ec) {
        // use the error code in ec.code()
    }
    catch(...) {
        // probably catastrophic
    }
```

For the above code to compile we'd have to add the following trivial transform:

```cpp
    template < class T >
    auto future< T >::operator()() -> net::awaitable< T >
    {
        auto r = co_await async_wait(net::use_awaitable);
        if (r.has_value())
            co_return std::move(r).assume_value();
        else if (r.has_error())
            throw system_error(r.assume_error());
        else
            throw r.exception();
    }
```


## Easy Complex Coroutines with async_compose

When your composed operation's intermediate completion handlers are invoked, 
the underlying `detail::composed_op` provides a mutable reference to itself. A typical completion handler looks like 
this:

```cpp
    template<class Self>
    void operator()(Self& self, error_code ec = {} , std::size_t bytes_transferred = 0)
    {
        reenter(this) {
            // yields and operations on Self
            yield async_write(sock, buf, std::move(self));  // note that self is moved
        }
    }
```  

What I wanted was a composed operation where the following is legal:

```cpp
    template<class Self>
    void operator()(Self self /* note copy */, error_code ec = {} , std::size_t bytes_transferred = 0)
    {
        reenter(this) {
            // yields and operations on Self
            yield 
            {
                async_write(sock, buf, self);
                timer.async_wait(self);
                writing = true;
                sending = true;
            }

            while(writing || sending)
                yield
                    // something needs to happen here to reset the flags and handle errors and cancellation. 
                ;
        }
    }
```  

Which I think looks reasonably clear and easy to follow.

In this work I had to overcome two problems - writing the framework to allow it, and thinking of a maintainable way to 
express intent in the interrelationships between the asynchronous operations on the timer and the socket.

Solving the copyable composed_op problem was easy. I did what I always do in situations like this. I cheated.

`asio::async_compose` produces a specialisation of a `detail::composed_op<>` template. Substituting a disregard of the
rules for knowledge and skill, I simply reached into the guts of asio and produced a copyable wrapper to this class.
I also cut/pasted some ancillary free functions in order to make asio work nicely with my new class:

Here's the code... it's not pretty:

```cpp
template < class Impl, class Work, class Handler, class Signature >
struct shared_composed_op
{
    using composed_op_type = boost::asio::detail::composed_op< Impl, Work, Handler, Signature >;

    using allocator_type = typename net::associated_allocator< composed_op_type >::type;
    using executor_type  = typename net::associated_executor< composed_op_type >::type;

    shared_composed_op(composed_op_type &&op)
    : impl_(std::make_shared< composed_op_type >(std::move(op)))
    {
    }

    shared_composed_op(std::shared_ptr< composed_op_type > op)
    : impl_(std::move(op))
    {
    }

    void initial_resume() { impl_->impl_(*this); }

    template < class... Args >
    void operator()(Args &&... args)
    {
        if (impl_->invocations_ < ~unsigned(0))
        {
            ++impl_->invocations_;
            impl_->impl_(*this, std::forward< Args >(args)...);
        }
    }

    template < class... Args >
    void complete(Args &&... args)
    {
        impl_->complete(std::forward< Args >(args)...);
    }

    auto get_allocator() const -> allocator_type { return impl_->get_allocator(); }
    auto get_executor() const -> executor_type { return impl_->get_executor(); }

    std::shared_ptr< composed_op_type > impl_;
};

template < class Impl, class Work, class Handler, class Signature >
auto share(boost::asio::detail::composed_op< Impl, Work, Handler, Signature > &composed_op)
    -> shared_composed_op< Impl, Work, Handler, Signature >
{
    auto op = shared_composed_op< Impl, Work, Handler, Signature >(std::move(composed_op));
    op.initial_resume();
    return op;
}

template < class Impl, class Work, class Handler, class Signature >
auto share(shared_composed_op< Impl, Work, Handler, Signature > shared_thing)
    -> shared_composed_op< Impl, Work, Handler, Signature >
{
    return shared_thing;
}

template < typename Impl, typename Work, typename Handler, typename Signature >
inline void *asio_handler_allocate(std::size_t size, shared_composed_op< Impl, Work, Handler, Signature > *this_handler)
{
    return boost_asio_handler_alloc_helpers::allocate(size, this_handler->impl_->handler_);
}

template < typename Impl, typename Work, typename Handler, typename Signature >
inline void asio_handler_deallocate(void *                                                pointer,
                                    std::size_t                                           size,
                                    shared_composed_op< Impl, Work, Handler, Signature > *this_handler)
{
    boost_asio_handler_alloc_helpers::deallocate(pointer, size, this_handler->impl_->handler_);
}

template < typename Impl, typename Work, typename Handler, typename Signature >
inline bool asio_handler_is_continuation(shared_composed_op< Impl, Work, Handler, Signature > *this_handler)
{
    return asio_handler_is_continuation(this_handler->impl_.get());
}

template < typename Function, typename Impl, typename Work, typename Handler, typename Signature >
inline void asio_handler_invoke(Function &function, shared_composed_op< Impl, Work, Handler, Signature > *this_handler)
{
    boost_asio_handler_invoke_helpers::invoke(function, this_handler->impl_->handler_);
}

template < typename Function, typename Impl, typename Work, typename Handler, typename Signature >
inline void asio_handler_invoke(const Function &                                      function,
                                shared_composed_op< Impl, Work, Handler, Signature > *this_handler)
{
    boost_asio_handler_invoke_helpers::invoke(function, this_handler->impl_->handler_);
}

```

With that in hand, and with a little more _jiggery pokery_, I was able to express intent thus:

```cpp
    template < class Self >
    void operator()(Self &self, error_code ec = {}, std::size_t bytes_transferred = 0)
    {
...
        auto &state = *state_;

        reenter(this)
        {
            ...

            // here's the interesting bit - self becomes a copyable handle to itself
            yield share(self);

            // deduce the port
            yield
            {
                this->initiate_resolve(share(self), state.uri.hostname(), deduce_http_service(state.uri));
                this->initiate_timout(share(self), state.session_.resolve_timeout());
            }

            while (this->resolving() || this->timeout_outstanding())
                yield;

            if (this->error)
                goto finish;

            // connect the socket

            state.current_resolve_result = this->resolved_endpoints().begin();
            while (state.current_resolve_result != this->resolved_endpoints().end())
            {
                state.tcp_stream().expires_after(state.session_.connect_timeout());
                yield state.tcp_stream().async_connect(state.current_resolve_result->endpoint(), share(self));
                log("Connect to: ", state.current_resolve_result->endpoint(), " result: ", ec);
                // if the connect is successful, we can exit the loop early.
                if (!ec)
                    goto connected;
                ++state.current_resolve_result;
            }
            // if we leave the loop, make sure there is an error of some kind
            this->set_error(ec);
            goto finish;

        connected:

            ...
```

The full code can be seen [here](https://github.com/madmongo1/webclient/blob/develop/include/boost/webclient/asio/get_op.hpp)

There are a couple of interesting things to note:

If you start two or more async operations that will complete on the same object, they must all be allowed to complete.
This is why we yield and wait for both the socket and the timeout:

```cpp
            while (this->resolving() || this->timeout_outstanding())
                yield;
```

This leads directly to the problem of managing the error_code. Two error_codes will be produced - one for the timer 
(which we hope to cancel before it times out) and one for the resolve operation. 
This means we have to store the first relevant error code somewhere:

```cpp
/// @brief a mixin to manage overall operation error state
struct has_error_code
{
    auto set_error(error_code const &ec) -> error_code &
    {
        if (!error)
        {
            if (ec && ec != net::error::operation_aborted)
                error = ec;
        }
        return error;
    }

    error_code error;
};
```

And we need a means of allowing communication between the timeout timer and the resolver:

```cpp
    template < class Self >
    void initiate_resolve(Self self, std::string const &host, std::string const &service)
    {
        results_.reset();
        resolver_.async_resolve(host, service, std::move(self));
    }

    template < class Self >
    void operator()(Self &self, error_code ec, resolver_type::results_type results)
    {
        results_.emplace(std::move(results));

        auto &this_ = *static_cast< Derived * >(this);
        this_.on_resolved(ec);

        auto &has_err = static_cast< has_error_code & >(this_);
        this_(self, has_err.set_error(ec));
    }

```

One cancels the other....

```cpp
    void on_timeout()
    {
        this->cancel_resolver();
        log("Timeout");
    }

    void on_resolved(error_code const &ec)
    {
        this->cancel_timeout();
        log("Resolve complete: ", ec);
    }
```

```cpp
    auto resolving() const -> bool { return !results_.has_value(); }

    auto cancel_resolver() -> void { resolver_.cancel(); }
```

In the end I was unsure how much is gained, other than pretty code (which does have value in itself).

# Unified WebClient

Exploratory work started on the unified web client. After some discussion, Vinnie and I agreed on the following design
decisions:

* Interface to model closely the very popular Python Requests module.
* Sync and Async modes available.
* Homogenous (mostly non-template) interface, behind which system-specific implementations can reside.
* Where native library support is available, that will be used,
* Where not, internally the library will be implemented in Asio/Beast.
* Coroutine friendly.

Once more progress has been made on the Boost.Beast issue tracker, I will be focusing attention here.

