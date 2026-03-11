---
layout: post
nav-class: dark
categories: ruben
title: "Corosio Beta: Coroutine-Native Networking for C++20"
author-name: Mark Cooper
---

# Corosio Beta: Coroutine-Native Networking for C++20

*The C++ Alliance is releasing the Corosio beta, a networking library designed from the ground up for C++20 coroutines. We are inviting serious C++ developers to use it, break it, and tell us what needs to change before it goes to Boost formal review.*

---

## The Gap C++20 Left Open

C++20 gave us coroutines. It did not give us networking to go with them. Boost.Asio has added coroutine support over the years, but its foundations were laid for a world of callbacks and completion handlers. Retrofitting coroutines onto that model produces code that works, but never quite feels like the language you are writing in. We decided to find out what networking looks like when you start over.

---

## What Corosio Is

Corosio is a coroutine-only networking library for C++20. It provides TCP sockets, acceptors, TLS streams, timers, and DNS resolution. Every operation is an awaitable. You write `co_await` and the library handles executor affinity, cancellation, and frame allocation. No callbacks. No futures. No sender/receiver.

```c
auto [socket] = co_await acceptor.async_accept();
auto n = co_await socket.async_read_some(buffer);
co_await socket.async_write(response);
```

Corosio runs on Windows (IOCP), Linux (epoll), and macOS (kqueue). It targets GCC 12+, Clang 17+, and MSVC 14.34+, with no dependencies outside the standard library. Capy, its I/O foundation, is fetched automatically by CMake.

---

## Built on Capy

Corosio is built on Capy, a coroutine I/O foundation library that ships alongside it. The core insight driving Capy's design comes from Peter Dimov: *an API designed from the ground up to use C++20 coroutines can achieve performance and ergonomics which cannot otherwise be obtained.*

Capy's *IoAwaitable* protocol ensures coroutines resume on the correct executor after I/O completes, without thread-local globals, implicit context, or manual dispatch. Cancellation follows the same forward-propagation model: stop tokens flow from the top of a coroutine chain to the platform API boundary, giving you uniform cancellation across all operations. Frame allocation uses thread-local recycling pools to achieve zero steady-state heap allocations after warmup.

---

## What We Are Asking For

We are looking for feedback on correctness, ergonomics, platform behavior, documentation, and performance under real workloads. Specifically:

* Does the executor affinity model hold up under production conditions?  
* Does cancellation behave correctly across complex coroutine chains?  
* Are there platform-specific edge cases in the IOCP, epoll, or kqueue backends?  
* Does the zero-allocation model hold in your deployment scenarios?

We are inviting serious C++ developers, especially if you have shipped networking code, to use it, break it, and tell us what your experience was. The Boost review process rewards libraries that arrive having already faced serious scrutiny.

---

## Get It

```shell
git clone https://github.com/cppalliance/corosio.git
cd corosio
cmake -S . -B build -G Ninja
cmake --build build

```

Or with CMake FetchContent:

```
include(FetchContent)
FetchContent_Declare(corosio
  GIT_REPOSITORY https://github.com/cppalliance/corosio.git
  GIT_TAG        develop
  GIT_SHALLOW    TRUE)
FetchContent_MakeAvailable(corosio)
target_link_libraries(my_app Boost::corosio)
```

**Requires:** CMake 3.25+, GCC 12+ / Clang 17+ / MSVC 14.34+

---

## Resources

[Corosio on GitHub](https://github.com/cppalliance/corosio) – https://github.com/cppalliance/corosio

[Corosio Docs](https://master.corosio.cpp.al/) – https://develop.corosio.cpp.al/

[Capy on GitHub](https://github.com/cppalliance/capy) – https://github.com/cppalliance/capy

[Capy Docs](https://master.capy.cpp.al/) – https://develop.capy.cpp.al/

[File an Issue](https://github.com/cppalliance/corosio/issues) – https://github.com/cppalliance/corosio/issues

