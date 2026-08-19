---
layout: post
nav-class: dark
categories: richard
title: Richard's July Update
author-id: richard
---

# Boost 1.74 - Progress Update

Boost 1.74 beta release has been published and the various maintainers are applying last-minute bug fixes to their 
libraries in readiness for the final release on  12th August.

For us in the Beast team, a fair amount of attention has been spent monitoring last minutes changes to Asio, as Chris
makes the final tweaks after the Unified Executors update I mentioned in last month's blog.

## Comprehensive Testing

Last month I [committed](https://github.com/boostorg/beast/commit/b84d8ad3d48d173bd78ed6dc2ed8d26d84762af3) what I hoped 
would be the first of a suite of Dockerfiles which help the mass testing of Beast. The upstream changes to Asio
were a lesson in just how many compilers, hosts and target environments we have to support in order that our user base
is not surprised or impeded as a result of compiler selection or imposition.
 
I am not expert is Docker matters. I mean, I can read the manual and follow basic instructions like anyone else,
but I was hoping that someone would come along to help flesh out the suite a little. Particularly for the Windows
builds, since I have no experience in installing software from the command line in Windows, and the greatest respect
for those individuals who have mastered the art.

Fortunately for me, we've had a new addition to the team. Sam Darwin, who has submitted a number of commits which
increase Docker coverage. Of these I was most pleased to see the submission of the 
[Windows](https://github.com/boostorg/beast/commit/3486e9cb18aa39b392e07031a33e65b1792fbccf) build matrix which has 
been of enormous value. I think it would be fair to say that Microsoft Visual Studio is nothing short of notorious
for its subtle deviations from the standard. As if it were not difficult enough already to create useful and coherent 
template libraries, supporting (particularly older) versions of MSVC requires extra care and workarounds. 

Hopefully, now that two-phase lookup has been firmly 
[adopted](https://devblogs.microsoft.com/cppblog/two-phase-name-lookup-support-comes-to-msvc/) by Microsoft (some two 
decades after its standardisation), this kind of issue will become less of a concern as time moves forward and support 
for older compilers is gradually dropped.

To be fair to Microsoft, if my memory serves, they were pioneers of bringing the C++ language to the masses back in the 
days of Visual Studio 97 and prior to that, the separate product Visual C++ (which we used to have to pay for!).

In hindsight a number of errors were made in terms of implementation that had lasting effects on a generation of 
developers and their projects. But arguably, had Microsoft not championed this effort, it is likely that C++ may not
have achieved the penetration and exposure that it did.

# A Bug In Asio Resolver? Surely Not?

One of the examples in the Beast repository is a simple 
[web crawler](https://github.com/boostorg/beast/tree/develop/example/http/client/crawl). If you have taken sufficient
interest to read the code, you will have noticed that it follows the model of "multiple threads, `one io_context` per 
thread."

This may seem an odd decision, since a web crawler spends most of its time idle waiting for asynchronous IO to complete.
However, there is an unfortunate implementation detail in the *nix version of `asio::ip::tcp::resolver` which is due to
a limitation of the [`getaddrinfo`](https://linux.die.net/man/3/getaddrinfo) API upon which it depends.

For background, `getaddrinfo` is a thread-safe, blocking call. This means that Asio has to spawn a background thread
in order to perform the actual name resolution as part of the implementation of `async_resolve`.

So with that out of the way, why am I writing this?

One of the bugs I tackled this month was that this demo, when run with multiple (say 500) threads, can be reliably made 
to hang indefinitely on my Fedora 32 system. At first, I assumed that either we or Asio had introduced a race condition.
However, after digging into the lockup it turned out to almost always lock up while resolving the FQDN `secureupload.eu`.

Investigating further, it turns out that the nameserver response for this FQDN is too long to fit into a UDP packet.
This means that the DNS client on the Linux host is forced to revert to a TCP connection in order to receive the entire
record. This can be evidenced by using `nslookup` on the command line:

```
$ nslookup secureupload.eu
Server: 192.168.0.1                    <<-- address of my local nameserver
Address: 192.168.0.1#53

Non-authoritative answer:
Name: secureupload.eu
Address: 45.87.161.67

... many others ...

Name: secureupload.eu
Address: 45.76.235.58
;; Truncated, retrying in TCP mode.    <<-- indication that nslookup is switching to TCP
Name: secureupload.eu
Address: 2a04:5b82:3:209::2

... many others

Name: secureupload.eu
Address: 2a04:5b82:3:203::2
```

Furthermore, whenever I checked the call stack, the thread in question was always stuck in the glibc function 
[`send_vc()`](https://code.woboq.org/userspace/glibc/resolv/res_send.c.html#send_vc), which is called by `getaddrinfo` 
in response to the condition of a truncated UDP response.

So despite my initial assumption that there must be a race in user code, the evidence was starting to point to something
interesting about this particular FQDN. Now I've been writing software for over three decades on and off and I've seen
a lot of bugs in code that the authors were adamant they they had not put there. We are as a rule, our own worst 
critics. So I was reluctant to believe that there could be a data-driven bug in glibc. 

Nevertheless, a scan of the redhat bug tracker by Chris turned up 
[this little nugget](https://bugzilla.redhat.com/show_bug.cgi?id=1429442).

It turns out that what was happening was that the TCP connection to the upstream name server had gone quiet or had 
dropped packets - presumably courtesy my cheap Huawei Home Gateway router which was being swamped by 500 simultaneous
 requests by the 500 threads I had assigned to the crawler. Because the glibc implementation does not implement
a timeout on the request, the failed reception of a response by the nameserver caused the call to `gethostinfo` to hang
whenever this FQDN was being resolved.

So it turns out that there is indeed a bug in glibc, which can affect any *nix (or cygwin) program that performs DNS
address resolution when the requested domain's response is too long to fit in a UDP response message.

Until this bug is fixed, I have learned a lesson and you have been warned.
