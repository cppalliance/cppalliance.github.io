---
layout: post
nav-class: dark
categories: richard
title: Richard's September Update
author-id: richard
---

# Cancellation in Beast/Asio and Better Compile Performance with Beast.Websocket

This month I will be discussing two issues. One of interest to many people who come to us with questions on the 
[Github Issue Tracker](https://github.com/boostorg/beast/issues) and the #beast channel of 
(Cpplang Slack)[https://cppalliance.org/slack/].

## Compile Times and Separation of Concerns
 
A common complaint about Boost.Beast is that compilation units that use the `websocket::stream` template class
often take a long time to compile, and that because websocket::stream is a template, this compilation overhead can
become viral in an application.

This is a valid complaint and we believe there are some reasonable tradeoffs we can make by refactoring the websocket
stream to use fewer templates internally. Vinnie has started work to express the WebSocket's 
intermediate completion handlers, buffer sequence and executor in terms of a polymorphic object. This would mean a 
few indirect jumps in the compiled code but would significantly reduce the number of internal template expansions.
In the scheme of things, we don't believe that the virtual function calls will materially affect runtime performance.
The branch is [here](https://github.com/vinniefalco/beast/tree/async-an)

I will be continuing work in this area in the coming days.

In the meantime, our general response is to suggest that users create a base class to handle the transport, and 
communicate important events such as frame received, connection state and the close notification to a derived 
application-layer class through a private polymorphic interface.

In this way, the websocket transport compilation unit may take a while to compile, but it needs to be done only once
since the transport layer will rarely change during the development life of an application. Whenever there is a change
to the application layer, the transport layer is not affected so websocket-related code is not affected.

This approach has a number of benefits. Not least of which is that developing another client implementation over 
a different websocket connection in the same application becomes trivial.

Another benefit is that the application can be designed such that application-level concerns are agnostic of the 
transport mechanism. Such as when the server can be accessed by multiple means - WSS, WS, long poll, direct connection, 
unix sockets and so on.

In this blog I will present a simplified implementation of this idea. My thanks to the cpplang Slack user @elegracer
who most recently asked for guidance on reducing compile times. It was (his/her? Slack is silent on the matter) question
which prompted me to finally conjure up a demo. @elegracer's problem was needing to connect to multiple cryptocurrency
exchanges in the same app over websocket. In this particular example I'll demonstrate a simplified connection to
the public FMex market data feed since that was the subject of the original question. 

## Correct Cancellation

Our examples in the Beast Repository are rudimentary and don't cover the issue of graceful shutdown of an application
in response to a SIGINT (i.e. the user pressing ctrl-c). It is common for simple programs to exit suddenly in response
to this signal, which is the default behaviour. For many applications, this is perfectly fine but not all. We may want 
active objects in the program to write data to disk, we may want to ensure that the underlying websocket is 
shut down cleanly and we may want to give the user an opportunity to prevent the shutdown.

I will further annotate the example by providing this ability to prevent the shutdown. The user will have to confirm the 
first SIGINT with another within 5 seconds to confirm.

# Designing the application

When I write IO applications involving Asio and Beast, I prefer to create an "application" object. This has the 
responsibility of monitoring signals and starting the initial connection objects. It also provides the communication
between the two.

The construction and configuration of the `io_context` and `ssl::context` stay in `main()`. The executor and ssl context
are passed to the application by reference as dependencies. The application can then pass on these refrences as 
required. It is also worth mentioning that I don't pass the io_context's executor as a polymorphic `any_io_executor` 
type at this stage. The reason is that I may want in future to upgrade my program to be multi-threaded. If I do this, 
then each individual io_enabled object such as a connection or the application will need to have its _own_ strand.
Getting the strand out of an any_io_executor is not possible in the general case as it will have been type-erased, so 
for top level objects I pass the executor as `io_context::executor_type`. It is then up to each object to create its own
strand internally which will have the type `strand<io_context::executor_type>`. The `strand` type provides the method
`get_inner_executor` which allows the application to extract the underlying `io_context::executor_type` and pass it to
the constructor of any subordinate but otherwise self-contained io objects. The subordinates can then build their own
strands from this. 

## Step 1 - A Simple Application Framework That Supports ctrl-C

OK, let's get started and build the framework. Here's a link to 
[step 1](https://github.com/test-scenarios/boost_beast_websocket_echo/tree/blog-2020-09-step-1/pre-cxx20/blog-2020-09).

`ssl.hpp` and `net.hpp` simply configure the project to use boost.asio. The idea of these little configuration headers
is that they could be generated by the cmake project if necessary to allow the option of upgrading to std networking
if it ever arrives.

As a matter of style, I like to ensure that no names are created in the global namespace other than `main`. This saves
headaches that could occur if I wrote code on one platform, but then happened to port it to another where the name
was already in use by the native system libraries.

`main.cpp` simply creates the io execution context and a default ssl context, creates the application, starts it and
runs the io context.
 
At the moment, the only interesting part of our program is the `signit_state`. This is a state machine which handles the
behaviour of the program when a `SIGINT` is received. Our state machine is doing something a little fancy. Here is the 
state diagram:

![sigint_state](/images/posts/richard/2020-09-sigint-state.png)

Rather than reproduce the code here, please refer to the link above to see the source code.

At this point the program will run and successfully handle ctrl-c:

```
$ ./blog_2020_09 
Application starting
Press ctrl-c to interrupt.
^CInterrupt detected. Press ctrl-c again within 5 seconds to exit
Interrupt unconfirmed. Ignoring
^CInterrupt detected. Press ctrl-c again within 5 seconds to exit
^CInterrupt confirmed. Shutting down
```
