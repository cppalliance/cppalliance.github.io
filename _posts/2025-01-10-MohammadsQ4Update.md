---
layout: post
nav-class: dark
categories: mohammad
title: Boost.Http.Io and Boost.Http.Proto Project Highlights
author-id: mohammad
---

Here’s a look at some recent projects I've been focusing on:

## Boost.Http.Io

### `burl` project

We've recently started adding a new example to the
[http-io](https://github.com/cppalliance/http_io) library called
[burl](https://github.com/cppalliance/http_io/tree/develop/example/client/burl).
This is a relatively large example application designed to serve as a drop-in
replacement for Curl's HTTP functionality.

The primary goal of the project is to ensure that
[http-proto](https://github.com/cppalliance/http_proto) and
[http-io](https://github.com/cppalliance/http_io) provide all the necessary
features for building a curl-like application. It also aims to demonstrate how
these libraries can be leveraged to perform common HTTP tasks. The project has
made excellent progress so far, with support for around 90 Curl command-line
options, covering nearly all HTTP and TLS-related features provided by Curl.

During development, we identified the need for three additional libraries (or
http-proto services) that could benefit users:

- **Multipart/form-data Library**: A container and parser/serializer for working
  with form data on both the client and server sides.
- **CookieJar Library**: A utility for storing cookies and tracking
  modifications made to the jar.
- **Public Suffix List Library**: A library that utilizes Mozilla’s Public
  Suffix List to accurately and efficiently identify a domain suffix. This is
  crucial for enhancing the CookieJar implementation by preventing supercookie
  vulnerabilities and proper validation of wildcard SSL/TLS certificates.


## Boost.Http.Proto

### Different Styles of Body Attachment in the Parser Interface

The [http-proto](https://github.com/cppalliance/http_proto) library is a sans-IO
implementation of the HTTP protocol. It is designed to facilitate the reception
of HTTP message bodies with minimal bookkeeping required from the user at the
call site.

Currently, the library supports three distinct styles of body attachment:

#### In-Place Body

This style allows users to leverage the parser's internal buffer to read the
body either in chunks or as a complete view if it fits entirely within the
internal buffer. This approach is efficient for scenarios where the body size is
known to be small or when incremental processing is required.

```C++
read_header(stream, parser);

// When the entire body fits in the internal buffer
read(stream, parser);
string_view body = parser.body();

// Reading the body in chunks
while (!parser.is_complete())
{
    read_some(stream, parser);
    auto buf = parser.pull_body();
    parser.consume_body(buffer::buffer_size(buf));
}
```


#### Sink Body

The sink body style allows users to process body content directly from the
parser's internal buffer, either in one step or through multiple iterations.
This method is particularly useful for writing body data to external storage,
such as a file. The parser takes ownership of the sink object, driving the
processing logic by invoking its virtual interfaces. This style is ideal for
streaming large bodies directly to a sink without needing to hold the entire
body in memory.

```C++
read_header(stream, parser);

http_proto::file file;
system::error_code ec;
file.open("./index.html", file_mode::write_new, ec);
if (ec.failed())
    return ec;

parser.set_body<file_body>(std::move(file));

read(stream, parser);
```

#### Dynamic Buffer

The dynamic buffer interface allows the parser to write body content directly
into a user-provided buffer or container, reducing the need for additional
copying and intermediate buffering.

```C++
read_header(stream, parser);

std::string body;
parser.set_body(buffers::dynamic_for(body));

read(stream, parser);
```
