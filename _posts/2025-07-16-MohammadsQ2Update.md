---
layout: post
nav-class: dark
categories: mohammad
title: 'Boost.RunTimeServices: The Glue for Optional Runtime Features'
author-id: mohammad
---

## How Boost.RunTimeServices Emerged from Boost.HTTP.Proto Development

During the development of the
[**Boost.HTTP.Proto**](https://github.com/cppalliance/http_proto) library, we
recognized the need for a flexible mechanism to install and access optional
services at runtime without requiring prior knowledge of their specific
implementations. For example, building a library with optional support
for zlib and Brotli compression, even if those libraries weren’t installed on
the user's machine. This challenge led to the creation of
[**Boost.RunTimeServices**](https://github.com/cppalliance/rts), a solution that
offers several key benefits to both library developers and users, which I will
briefly outline below.

#### Libraries With No Configuration Macros

One approach to managing optional dependencies in libraries is to use
configuration macros at build time, such as `BOOST_HTTP_PROTO_HAS_ZLIB` or
`BOOST_COOKIES_HAS_PSL`. However, this approach has major drawbacks:

1. Combinatorial explosion of binary variants.
2. Users can't easily determine which features are enabled in a binary.
3. Configuration macros leak into downstream libraries, compounding complexity.
4. Changing features requires full rebuilds of all dependent code.
5. Difficult to distribute a single binary via package managers.

With **Boost.RunTimeServices**, configuration macros become unnecessary.
Features can be queried and installed at runtime. For example, installing an
optional zlib inflate service:

```CPP
rts::context rts_ctx;
rts::zlib::install_inflate_service(rts_ctx);
```

Then, a library can conditionally use the service:

```CPP
if(cfg.decompression)
{
  auto& svc = ctx.get_service<rts::zlib::inflate_service>();
  svc.inflate(stream, rts::zlib::flush::finish);
}
```

#### Smaller Binaries by Stripping Unused Features

Since service interfaces are decoupled from implementations, unused services and
their dependencies can be eliminated by the linker. For example the following is
part of the implementation of `rts::zlib::inflate_service`:

```CPP
class inflate_service_impl
    : public inflate_service
{
public:
    using key_type = inflate_service;

    int
    init2(stream& st, int windowBits) const override
    {
        stream_cast sc(st);
        return inflateInit2(sc.get(), windowBits);
    }

    int
    inflate(stream& st, int flush) const override
    {
        stream_cast sc(st);
        return ::inflate(sc.get(), flush);
    }

    // ...
}
```

The implementation class is only instantiated within:

```CPP
inflate_service&
install_inflate_service(context& ctx)
{
    return ctx.make_service<inflate_service_impl>();
}
```

Libraries interact only with the abstract interface:

```CPP
struct BOOST_SYMBOL_VISIBLE
inflate_service
    : public service
{
    virtual int init2(stream& st, int windowBits) const = 0;
    virtual int inflate(stream& st, int flush) const = 0;
    // ...
};
```

If the user never calls `install_inflate_service`, the implementation and its
dependencies are omitted from the binary.

In this particular example, having separate services for inflation and deflation
gives us more granularity on the matter. For instance, a client
application that uses **Boost.HTTP.Proto** will more likely only need to install
`rts::zlib::inflate_service`, because it typically only needs to parse
compressed HTTP response messages and compression of HTTP requests almost never
happens in client applications. The reverse is true for server applications and
they might only need to install `rts::zlib::deflate_service`, since client
requests usually arrive uncompressed and the server needs to compress responses
(if requested).

#### Libraries Built Independent of the Availability of Optional Services

Because a library that uses an optional service needs only the interface of that
service, there is no need for a build-time dependency. Therefore, we can always
build a single version of a library that takes advantage of all optional
services if they are available at runtime.

For example, in the case of **Boost.HTTP.Proto**, one can use the library
without any compression services, as users simply don’t install those services
and there’s no need to link any extra libraries.

Another user can use the exact same binary of **Boost.HTTP.Proto** with zlib and
Brotli decompression algorithms:

```CPP
rts::context rts_ctx;
rts::zlib::install_inflate_service(rts_ctx); // links against boost_rts_zlib
rts::brotli::install_decoder_service(rts_ctx); // links against boost_rts_brotli
```

#### Optional Services in Downstream Libraries

Assume we want to create a library named **Boost.Request** that uses
**Boost.HTTP.Proto** and **Boost.HTTP.IO**, and provides an easy-to-use
interface for client-side usage. Such a library doesn't need to care about
optional services and can delegate that responsibility to the end user, allowing
them to decide which services to install. For example, **Boost.Request** can
internally query the availability of these services and make requests
accordingly:

```CPP
if(rts_ctx.has_service<brotli::decoder_service>())
    encodings.append("br");

if(rts_ctx.has_service<zlib::inflate_service>())
{
    encodings.append("deflate");
    encodings.append("gzip");
}

if(!accept_encoding.empty())
    request.set(field::accept_encoding, encodings.str());
```

## Why This Needs to Be a Separate Library

This is a core library that many other libraries may want to use. For example, a
user who installs zlib services expects them to be usable in both
**Boost.HTTP.Proto** and **Boost.WS.Proto**:

```cpp
rts::context rts_ctx;
rts::zlib::install_inflate_service(rts_ctx);
rts::zlib::install_deflate_service(rts_ctx);

// Usage site
http_proto::parser parser(rts_ctx);
ws_proto::stream stream(rts_ctx);
```

User libraries need to link against `boost_rts` in order to access
`rts::context`. Note that `boost_rts` is a lightweight target with no dependency
on optional services like zlib or Brotli.

## Existing Challenges

#### Minimum Library For Mandatory Symbols

A library that uses an optional service might still need to link against a
minimal version that provides necessary symbols such as `error_category`
instances, because we usually need to instantiate them inside the source and
can't leave them in headers.

For example, assume a library that needs to call an API to provide the error
message:

```CPP
char const*
error_cat_type::
message(
    int ev,
    char*,
    std::size_t) const noexcept
{
    return c_api_get_error_message(ev);
}
```

This clearly can't be left in the headers because it would require the existence
of the `c_api_get_error_message` symbol at link time, which defeats the purpose
of optional services.

To allow optional linkage, a fallback could be provided:

```CPP
char const*
error_cat_type::
message(
    int ev,
    char*,
    std::size_t) const noexcept
{
    return "service not available";
}
```

But the remaining question is: where should this implementation go if we want
optional linkage against services? Currently, we place this code inside the core
**Boost.RunTimeServices** library, which could become a scalability problem in
the future as the number of services grows.

#### An Even Finer Grain Control Over Used and Unused Symbols

Even though separate services (e.g., `inflate_service`, `deflate_service`) help
the linker remove unused code; the granularity is still limited. For example, if
a library uses only `inflate_service::init`, the linker still includes
`inflate_service::init2` and other unused methods. This is because interfaces are
polymorphic and the linker can't remove individual virtual methods:


```CPP
class inflate_service_impl
    : public inflate_service
{
public:
    using key_type = inflate_service;

    int
    init(stream& st) const override
    {
        stream_cast sc(st);
        return inflateInit(sc.get());
    }

    int
    init2(stream& st, int windowBits) const override
    {
        stream_cast sc(st);
        return inflateInit2(sc.get(), windowBits);
    }

    // ...
}
```

#### Space Overhead and Indirection Cost of Virtual Services

This is probably not an issue for most users, as these costs are negligible in
real-world applications. However, a solution that provides the same
functionality as virtual service interfaces but without these overheads would be
highly desirable.
