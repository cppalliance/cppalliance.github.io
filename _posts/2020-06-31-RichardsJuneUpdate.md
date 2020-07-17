---
layout: post
nav-class: dark
categories: richard
title: Richard's June Update
author-id: richard
---

# Boost 1.74 - Interesting Developments in Asio

We're currently beta-testing Boost 1.74, the lead-up to which has seen a flurry of activity in Asio, which has
impacted Beast.

Recent versions of Asio have moved away from the idea of sequencing completion handlers directly on an `io_context`
(which used to be called an `io_service`) towards the execution of completion handlers by an Executor.

The basic idea being that the executor is a lightweight handle to some execution context, which did what the `io_context`
always used to do - schedule the execution of completion handlers.

The changes to Asio have been tracking 
[The Networking TS](http://www.open-std.org/jtc1/sc22/wg21/docs/papers/2018/n4771.pdf) which describes a concept
of Executor relevant to asynchronous IO.

It happens that there is a competing proposal for Executors circulating, known as 
[Unified Executors](http://www.open-std.org/jtc1/sc22/wg21/docs/papers/2019/p0443r11.html). The long and short of which
is that "a place to execute work" can be thought of as a somewhat more generic idea than merely an IO loop or thread
pool.

Latest Asio, and Boost.Asio 1.74 has been updated to accommodate both models of executors, with the Unified Executors
model being the default. It's important to note that most users won't notice the change in API this time around since 
by default the Asio in 1.74 also includes the 1.73 interface.

There are a number of preprocessor macros that can be defined to change this default behaviour:

## `BOOST_ASIO_NO_TS_EXECUTORS`

Defining this macro disables the Networking TS executor model. The most immediate thing you'll notice if you define this
macro is that for some executor `e`, the expression `e.context()` becomes invalid.

In the Unified Executors world, this operation is expressed as a query against the executor:
```c++
auto& ctx = asio::query(e, asio::execution::context);
```
The idea being that the execution context is a _property_ of an executor that can be _queried_ for.

Another change which users are likely to notice when this macro is defined is that the `asio::executor_work_guard<>` 
template corresponding `asio::make_work_guard` function is no longer defined.

You may well ask then, how we would prevent an underlying execution context from running out of work?

In the Unified Executors world, we can think of Executors as an unbounded set of types with various properties
enabled or disabled. The idea is that the state of the properties define the behaviour of the interaction between the 
executor and its underlying context.

In the new world, we don't explicitly create a work guard which references the executor. We 'simply' create a new
executor which happens to have the property of 'tracking work' (i.e. this executor will in some way ensure that the 
underlying context has outstanding work until the executor's lifetime ends).

Again, given that `e` is some executor, here's how we spell this:

```c++
auto tracked = asio::require(e, asio::execution::outstanding_work.tracked);
```

After executing this statement, there are now two executors in play. The first, `e` may or may not be "tracking work"
(ensuring that the underlying context does not stop), but `tracked` certainly is.

There is another way to spell this, more useful in a generic programming environment.

Suppose you were writing generic code and you don't know the type of the executor presented to you, or even what kind
of execution context it is associated with. However, you do know that *if* the underlying context can stop if it runs
out of work, then we want to prevent it from doing so for the duration of some operation.

In this case, we can't use `require` because this will fail to compile if the given executor does not support the 
`outstanding_work::tracked` property. Therefore we would request the capability rather than require it:

```c++
auto maybe_tracked = asio::request(e, asio::execution::outstanding_work.tracked);
```  

We can now use `maybe_tracked` as the executor for our operation, and it will "do the right thing" regarding the tracking
of work whatever the underlying type of execution context. It is important to note that it _is_ an executor, not merely
a guard object that contains an executor.

### post, dispatch and defer

Another notable change in the Asio API when this macro is defined is that models of the Executor concept lose their
`post`, `dispatch` and `defer` member functions.

The free function versions still remain, so if you have code like this:
```c++
e.dispatch([]{ /* something */ });
```

you will need to rewrite it as:

```c++
asio::dispatch(e, []{ /* something */ });
```

or you can be more creative with the underlying property system:

```c++
asio::execution::execute(
    asio::prefer(
        e, 
        asio::execution::blocking.possibly), 
    []{ /* something */ });
```

Which is more-or-less what the implementation of `dispatch` does under the covers. It's actually a little more involved
than that since the completion token's associated allocator has to be taken into account. There is a 
property for that too: `asio::execution::allocator`.

In summary, all previous Asio and Networking TS execution/completion scenarios are now handled by executing a handler
in some executor supporting a set of relevant properties.

## BOOST_ASIO_NO_DEPRECATED

Defining this macro will ensure that old asio-style invocation and allocation completion handler customisation
functions will no longer be used. The newer paradigm is to explicitly query or require execution properties at the 
time of scheduling a completion handler for invocation. If you don't know what any of that means, you'd be in the 
majority and don't need to worry about it.

## BOOST_ASIO_USE_TS_EXECUTOR_AS_DEFAULT

As of Boost 1.74, Asio IO objects will be associated with the new `asio::any_io_executor` rather than the previous
polymorphic `asio::executor`. Defining this macro, undoes this change. It may be useful to you if you have written code
that depends on the use of `asio::executor`.

## Other observations

### Strands are Still a Thing

Asio `strand` objects still seem to occupy a twilight zone between executors and something other than executors.

To be honest, when I first saw the property mechanism, I assumed that a strand would be "just another executor" with 
some "sequential execution" property enabled. This turns out not to be the case. A strand has its own distinct execution
context which manages the sequencing of completion handler invocations within it. The strand keeps a copy of the inner
executor, which is the one where the strand's completion handlers will be invoked in turn.

However, a strand models the Executor concept, so it also *is an* executor.

### execute() looks set to become the new call().

Reading the Unified Executors paper is an interesting, exciting or horrifying experience - depending on your view of
what you'd like C++ to be.

My take from the paper, fleshed out a little with the experience of touching the implementation in Asio, is that in the 
new world, the programming thought process will go something like this,
imagine the following situation: 

"I need to execute this set of tasks,

Ideally I'd like them to execute in parallel,

I'd like to wait for them to be done"

As I understand things, the idea behind unified executors is that I will be able to express these desires and mandates
by executing my work function(s) in some executor yielded by a series of calls to `prefer` and `require`. 

Something like:

```c++
    auto eparallel = prefer(e, bulk_guarantee.unsequenced); // prefer parallel execution
    auto eblock = require(eparallel, blocking.always);      // require blocking
    execute(eblock, task1, task2, task3, task...);          // blocking call which will execute in parallel if possible
```

Proponents will no doubt think, 

"Great! Programming by expression of intent". 

Detractors might say, 

"Ugh! Nondeterministic programs. How do I debug this when it goes wrong?"

To be honest that this stage, I find myself in both camps. No doubt time will tell.

# Adventures in B2 (Boost Build)

Because of the pressure of testing Beast with the new multi-faceted Asio, I wanted a way to bulk compile and test many
different variants of:

* Compilers
* Preprocessor macro definitions
* C++ standards
* etc.

I was dimly aware that the Boost build tool, B2, was capable of doing this from one command-line invocation.

It's worth mentioning at this point that I have fairly recently discovered just how powerful B2 is. It's a shame that
it has never been offered to the world in a neat package with some friendly conversation-style documentation, which
seems to be the norm these days.

It can actually do anything CMake can do and more. For example, all of the above.

My thanks to Peter Dimov for teaching me about the existence of B2 *features* and how to use them. 

It turns out to be a simple 2-step process:

First defined a `user-config.jam` file to describe the feature and its settings:

```jam
import feature ;

feature.feature asio.mode : dflt nodep nots ts nodep-nots nodep-ts : propagated composite ;
feature.compose <asio.mode>nodep : <define>"BOOST_ASIO_NO_DEPRECATED" ;
feature.compose <asio.mode>nots : <define>"BOOST_ASIO_NO_TS_EXECUTORS" ;
feature.compose <asio.mode>ts : <define>"BOOST_ASIO_USE_TS_EXECUTOR_AS_DEFAULT" ;
feature.compose <asio.mode>nodep-nots : <define>"BOOST_ASIO_NO_DEPRECATED" <define>"BOOST_ASIO_NO_TS_EXECUTORS" ;
feature.compose <asio.mode>nodep-ts : <define>"BOOST_ASIO_NO_DEPRECATED" <define>"BOOST_ASIO_USE_TS_EXECUTOR_AS_DEFAULT" ;

using clang :   : clang++ : <stdlib>"libc++" <cxxflags>"-Wno-c99-extensions" ;
using gcc :   : g++ : <cxxflags>"-Wno-c99-extensions" ;
``` 

Then ask b2 to do the rest:

```
./b2 --user-config=./user-config.jam \
  toolset=clang,gcc \
  asio.mode=dflt,nodep,nots,ts,nodep-nots,nodep-ts \
  variant=release \
  cxxstd=2a,17,14,11 \
  -j`grep processor /proc/cpuinfo | wc -l` \
  libs/beast/test libs/beast/example
```

This will compile all examples and run all tests in beast on a linux platform for the cross-product of:

1. clang and gcc
2. all 6 of the legal combinations of the preprocessor macros BOOST_ASIO_NO_DEPRECATED, BOOST_ASIO_NO_TS_EXECUTORS and 
BOOST_ASIO_USE_TS_EXECUTOR_AS_DEFAULT
3. C++ standards 2a, 17, 14 and 11

So that's 48 separate scenarios.

It will also:

* Build any dependencies.
* Build each scenario into its own separately named path in the bin.v2 directory.
* Understand which tests passed and failed so that passing tests are not re-run on subsequent calls to b2 unless a
  dependent file has changed.
* Use as many CPUs as are available on the host (in my case, fortunately that's 48, otherwise this would take a long time
  to run)

