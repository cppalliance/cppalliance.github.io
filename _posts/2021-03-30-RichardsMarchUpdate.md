---
layout: post
nav-class: dark
categories: richard
title: Richard's February/March Update
author-id: richard
---

# Boost.PropertyTree is back in the saddle!

Last month I took over the maintenance of the Boost Property Tree library. 

This library is in ubiquitous use but has been without a full time maintainer for some time. 
There was a backlog of commits on develop that had not made it to master for the boost releases. 
This is changing in upcoming 1.76 release. Property Tree PRs and issues will get more attention going forward.
In addition, Property Tree has gained CI courtesy of GitHub Actions. The test status can be seen 
[here](https://github.com/boostorg/property_tree)

# Beast CI

Beast has acquired two new continuous integration pipelines. Drone and Github Actions.
Drone is the canonical source of truth for the Linux/Windows badge on the
[readme page](https://github.com/boostorg/beast) while GitHub Actions provides a more comprehensive matrix of
targets, C++ standards and compiler versions which I use during the development cycle.

# Boost Version 1.76

The 1.76 release of boost is imminent. As far as Beast and Property Tree is concerned, this is a maintenance release. 

# Other Activities

Much of the past two months has been devoted to resolving user queries, and examining suggestions for changes to Beast 
and Property Tree. 

Changes to Property tree are not taken likely. It is used in a great deal of legacy code in the wild and there are few 
tests.
It would be a shame to break existing code noisily, or worse, silently.
For better or worse, the behaviour is probably not going to change very much going forward until there are more tests in 
place.

Accepting changes to beast's behaviour or interface is something we consider very carefully for a different reason.
Beast is already a complex library. Like Asio upon which it is built, it is already extremely configurable, with a
myriad (actually potentially an unbounded set) of completion tokens, completion handlers and buffer types.

Something I am often asked is whether we would consider a "multi-send" interface. For example:

```cpp
std::vector<std::string> messages;
ws.write(buffer, messages);
```

Arguably there are some efficiencies available here, since we could potentially build all the resulting websocket frames
in one pass, and send as one IO operation.

There are some issues however. One is buffer space. What do we do if the buffer runs out of space while be are half way 
through building the frames? Fail the operation, return a partial failure? Block?
Also, what do we do if the ensuing IO operation(s) partially fail(s)? Asio currently has no protocol to report a partial 
failure. We would have to create such a protocol, test it and then teach it.

In reality people's requirements are often different. Some people may require confirmation of each frame within a time 
period, some will want all-or-nothing delivery and some are happy with partial delivery.

One approach is to start providing options for such things as timeouts, partial completion, etc. But the feeling here is
that this starts to dictate to users of the library how they write code, which we feel is outside the remit of Beast.

Perhaps there is a case for a function that separates out the building of a websocket frame from the sending of it. 
I'll give it some thought.
