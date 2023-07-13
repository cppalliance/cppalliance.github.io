---
layout: post
nav-class: dark
categories: asio
title: Coroutine 101 - A simple serializer
author-id: klemens
---

This is the first post in a series explaining C++20 coroutines by example.

# Goal 

The goal for this article is to create a simple non-recursive stream serializer, that can be used like this: 

```cpp
stream::serializer serialize_ints(std::vector<int> data)
{
  for (auto idx = 0u; idx < data.size(); idx++)
  {
    if (idx != 0)
      co_yield ',';
    co_yield std::to_string(data[idx]);
  }
}

int main(int argc, char *argv[])
{
  auto s = serialize_ints({1,2,3,4,5,6,7,8,9,10});
  std::string buffer;
  buffer.resize(10);

  using std::operator""sv;

  assert(s.read_some(buffer) == "1,2,3,4,5,"sv);
  assert(s.read_some(buffer) == "6,7,8,9,10"sv);

  return 0;
}
```

That is we want a serializer coroutine that can `co_yield` strings and chars,
and can get consumed by a simple sync interface.


# Serializer

The serializer interface itself is very simple:

```cpp
struct serializer
{
  // The promise_type tells how to make this a coroutine.
  using promise_type = detail::serializer_promise;

  bool done() const;
  std::string_view read_some(std::span<char> buffer);

 private:
  // The data passed into read_some
  std::span<char> buffer_;
  // The amount written to the buffer
  std::size_t written_;
  // The bytes that couldn't be written bc the buffer was full.
  std::string_view remaining_;

  friend detail::serializer_promise;
  // The unique_handle is essentially a unique_ptr of a std::coroutine_handle (which doesn't free)
  detail::unique_handle<promise_type> impl_;
};
```

Next let's quickly define the done & read_some functions:

```cpp

bool serializer::done()  const
{
  // check if we have a coroutine attached & it's not done 
  // and that we don't have data remaining from a previously full buffer
  return (!impl_ || impl_.done()) && remaining_.empty();
}

std::string_view serializer::read_some(std::span<char> buffer)
{
  // consume data left from a previous co_yield.  
  auto n = (std::min)(remaining_.size(), buffer.size());
  std::copy_n(remaining_.begin(), n, buffer.begin());
  written_ = n;
  remaining_.remove_prefix(n);
  
  
  buffer_ = buffer;
  // if the coroutine is still active & we have buffer space left, resume it
  if (!done() && (buffer_.size() != written_))
  {
    // tell the coroutine promise where to write the data
    impl_.promise().ser = this;
    // resume the coroutine to yield more data
    impl_.resume();
  }

  return {buffer.data(), written_};
}
```

The `resume` function will resume the serializer coroutine until it
either yields or returns.

# Awaitables

Before we get into the promise itself, we need to establish what awaitables are.

And awaitable is a type with three functions:

```cpp
struct my_awaitable
{
   bool await_ready();
   void await_suspend(std::coroutine_handle<T>);
   T await_resume();
};
```
When a coroutine awaits an awaitable, it will call `await_ready` first. 
If it returns `true` the coroutine does not need to suspend and will call `await_resume` to the await result (always void in this example).
If `await_ready` returns false, the coroutine suspends and `await_suspend` will be called with the coroutines handle passed it.
Once the coroutine gets resumed (by calling `resume()` on the handle)
it will call `await_resume` to get the result and return the value.

The main point is that `await_ready` can be used to avoid suspension
of the coroutine, which can awaiting something an noop.

The standard provides two awaitables:

 - std::suspend_never
 - std::suspend_always

`suspend_never` will do nothing (`await_ready` returns true),
while `suspend_always` will just suspend the coroutine (`await_ready` returns false).

# Serializer Promise

With that cleared up, let's look a the promise:

```cpp
struct serializer_promise
{
  std::suspend_always initial_suspend() noexcept {return {};}
  std::suspend_always final_suspend  () noexcept {return {};}

  serializer get_return_object();

  void return_void() {}

  void unhandled_exception() { throw;  }

  struct conditional_suspend
  {
    bool written;
    bool await_ready()
    {
      [[likely]]
      if (written)
        return true;
      else
        return false;
    }
    void await_suspend(std::coroutine_handle<serializer_promise>) {}
    void await_resume() {}
  };

  conditional_suspend yield_value(const char & c);
  conditional_suspend yield_value(std::string_view c);

  serializer * ser;
};
```

The next five functions are mandatory for any coroutine

## initial_suspend

The `initial_suspend` function gets called when the coroutine is created (i.e. when `serialize_ints` is called) and it's result
awaited. 
In this case want the coroutine to be lazy, i.e. do nothing until `read_some` resumes it. Therefor we return `std::suspend_always`.

## final_suspend

Once the coroutine is past the `co_return` it will call final_suspend
and wait the result. This can be used for continuations and cleanup.
In our case, the `serializer` object holds the coroutine handle and
will clean it up, so we also call `std::suspend_always`.

## get_return_object

The `get_return_object` function is used to gets called to create the 
handle of the coroutine, in our case a `serialize` object.

The implementation is pretty straight forward:

```cpp
serializer serializer_promise::get_return_object()
{
  serializer s;
  s.impl_ = detail::unique_handle<serializer_promise>::from_promise(*this);
  return s;
}
```

## return_void

A coroutine either defines `return_void` if there is not return value
or `return_value` if there is. 
Since we check the completion through the handle, we don't need to do anything here.

## unhandled_exception

If the coroutine exits with an exception it can be intercepted here.
We just rethrow it, so the caller to .resume will receive it.
That is it will be thrown from `serializer.read_some`.

## conditional_suspend

The `conditional_suspend` is an awaitable that let's you dynamically chose between `std::suspend_never` and `std::suspend_always`.

We use this so we only suspend if the buffer is full and we tell
the compiler to optimize for this case using `[[likely]]`.

## yield_value

The `yield_value` functions are needed when `co_yield` should be possible within the coroutine function.

The function will get called with one value and
it's return value will be awaited. This way we can conditionally suspend if the buffer is full. In our coroutine, 
we can yield a string_view and a single char.


```cpp
auto serializer_promise::yield_value(const char & c) -> conditional_suspend
{
  // we got room in the buffer, just write the data
  if (ser->written_ < ser->buffer_.size())
  {
    ser->buffer_[ser->written_] = c;
    ser->written_++;
    // don't suspend, we sent the data.
    return conditional_suspend{true};
  }
  else // the buffer is full. store it as remaining
  {
    ser->remaining_ = {&c, 1u};
    return conditional_suspend{false};
  }
}

auto serializer_promise::yield_value(std::string_view c) -> conditional_suspend
{

  if (ser->written_ < ser->buffer_.size())
  {
    // write as many bytes to the buffer as you can.
    auto n = (std::min)(c.size(), (ser->buffer_.size() - ser->written_));
    std::copy_n(c.begin(), n, ser->buffer_.begin() + ser->written_);
    ser->written_ += n;

    c.remove_prefix(n);
    if (!c.empty())
      ser->remaining_ = c;

    // suspend if we couldn't write all of the data
    return conditional_suspend{c.empty()};
  }
  else
  {
    // not space remaining, suspend
    ser->remaining_ = c;
    return conditional_suspend{false};
  }
    
}
```

## Conclusion

And with that we can write a stream serializer without confusing syntax.

In the next article, we'll make the serializer recursive, i.e.
allow one serializer to await another one.

