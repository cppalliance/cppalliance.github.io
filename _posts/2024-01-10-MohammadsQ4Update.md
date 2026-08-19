---
layout: post
nav-class: dark
categories: mohammad
title: Mohammad's Q4 2023 Update
author-id: mohammad
---

Over the last few months I have been mainly working on Boost.Beast and Boost.PropertyTree.


### Keeping Boost.Beast in Good Form

I've recently taken on a more active role in maintaining Boost.Beast. To begin, I reviewed all the open issues to gain a better understanding of the project's current state. In the course of this process, I successfully addressed several issues that did not necessitate significant refactoring.

Here are a couple of contributions to the project that I find interesting:

##### Specializing `asio::associator` for `bind_wrapper` and `bind_front_wrapper`

Because `bind_wrapper` and `bind_front_wrapper` wrap the user's handlers, all of the associators with the original handler become invisible to Asio. In order to resolve that, Beast has been specializing each associator individually for bound wrappers. However, this makes Asio consistently assume the presence of an associated executor with the bound handlers.

Fortunately, the fix is easy; we only need to specialize `asio::associator` for the bound wrappers, and it can query all the associators from the wrapper handler. You can read more in [this pull request](https://github.com/boostorg/beast/pull/2782).

##### Replacing internal uses of `beast::bind_front_handler` with `asio::prepend`

`bind_front_handler` is a utility in Beast that allows binding a list of arguments to an existing handler and creating a new handler with a different signature. This is especially useful when we want to pass additional arguments to handlers. For example, the following code binds an error code to a handler, making it invokable without needing any argument:

```C++
asio::dispatch(ex, beast::bind_front_handler(std::move(handler), ec));
```

With the introduction of `asio::prepend` in Boost 1.80, we can replace the previous code with:

```C++
asio::dispatch(ex, asio::prepend(std::move(handler), ec));
```

However, `beast::bind_front_handler` has a specialized invoke function for member functions, which makes it possible to concisely turn member functions into handlers:

```C++
ws_.async_read(
    buffer_,
    beast::bind_front_handler(
        &websocket_session::on_read,
        shared_from_this()));
```

This isn't possible with `asio::prepend`; that's why I decided to leave uses of `beast::bind_front_handler` in the examples intact.


### Trimming Dead Leaves off Boost.PropertyTree

[PropertyTree](https://github.com/boostorg/property_tree) has served Boost users for almost two decades. However, it experienced a period without an active maintainer, resulting in a backlog of issues and pull requests in its repository.

Given PropertyTree's shift to maintenance mode, we made the decision to refrain from introducing new features or making breaking changes to the interfaces. Consequently, I reviewed all the issues and pull requests, addressing them unless they involved adding a new feature. With these fixes implemented and an improved CI script, PropertyTree was prepared for the Boost 1.84 release, hopefully in a slightly better state.