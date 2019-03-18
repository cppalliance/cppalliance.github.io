---
layout: post
nav-class: dark
categories: company, damian
---
# Certify - X509 certificate validation
I always knew that validating a certificate chain presented by a peer is not an
easy procedure, but my recent work in Certify to port over the procedure from
Chromium has only proven that I underestimated the complexity of it. Certificate
revocation seems to be a particularly hard issue, with 2 main categories of
solutions - offline and online validation.

## Online validation - OCSP
OCSP is a protocol designed to allow checking the revocation status of a
certificate by sending a request over a subset of HTTP/1.1. At first glance, it
seems it solves the status checking problem on its own. However, OCSP has
problems, inherent to online checking.

First of all, the validation server might not be currently available - so a lack
of response is most definitely not a state in which a chain can be trusted.
Secondly, the check may be slow, after all, it requires connecting to a separate
service. Additionally, the native Windows API for certificate verification does
the status check synchronously, which means potentially blocking a user's thread
that typically services asynchronous operations. There is a feature that
alleviates most of these issues, at least from the point of view of a TLS
client, OCSP stapling. Sadly, it's not very widespread and actually few large
services support it, due to the fact that it increases bandwidth requirements.
Certify will, at some point support both OCSP status checks on the client side
and support for OCSP stapling. The problem here is that OCSP requires a fairly
functional HTTP client and ASN.1 parsing. A lot of this functionality is already
present in OpenSSL, however, integrating it with ASIO and Beast may be tricky.


## Offline validation - CRLs and Google CRLSets
The traditional method of checking the status of a certificate involves looking
up revocation lists installed in the OS's store, or downloaded by the
application from the CA. Unfortunately CRLs have issues - an example would be an
incident from a few years ago when CloudFlare performed a mass revocation which
blew up the size of the CRLs by a few orders of magnitude, resulting in a
requirement to download multiple megabytes of data, turning CAs into a major
performance bottleneck. Google came up with a different mechanism, called
CRLSets, which involves a periodic download of a revocation list which is
created by Google's crawler querying certificate status over OCSP. This
verification method is fairly attractive for applications that run on systems
that already have Google products, since this database is shared, which is why
I've chosen to provide an opt-in implementation in Certify. For now, updating
the database will be out of scope, because that requires a few utilties that are
missing from Boost at this time (XML, JSON and an HTTP Client).

Don't forget to star the repository: https://github.com/djarek/certify!
