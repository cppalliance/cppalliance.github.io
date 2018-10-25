---
layout: post
nav-class: dark
categories: company, damian
---
# Initial work on `Certify` complete
It's been mentioned in my initial blog post that I'd be working on a TLS
certificate store abstraction library, with the intent of submitting it for
formal review for Boost, at some point in the (hopefully near) future.
The initial setup phase (things that every Software Engineer hates) is more
or less complete. CI setup was a bit tricky - getting OpenSSL to run with
the boost build system on both Windows and Linux (and in the future MacOS)
has provided a lot of "fun" thanks to the inherent weirdness of OpenSSL.

The test harness currently consists of two test runners that loads certificates
from a database (big name for a folder structure stored in git) that has the
certificate chains divided into two groups. Chains that will fail due to various
reasons (e.g. self-signed certificates, wrong domain name) and ones that will pass
(when using a valid certificate store). I'm still working on checking whether
the failure was for the expected reason. All the verification is done offline
(i.e. no communication with external servers is performed, only chain verification).

At this point it looks like I should consider, whether the current design of
the verification code is a good approach. Using the verification callback
from OpenSSL and asio::ssl is quite an easy way of integrating the platform-specific
certificate store API it causes issues with error propagation (transporting a platform-specific
error through OpenSSL) and may be fairly slow, because it requires certificates to be
reencdoded into the DER format so that they can be fed into the platform-specific API.
An alternative to this approach would be load the entire root certificate store, along with CRLs and
OCSP configuration into an OpenSSL context. This is potentially a little bit harder to get right but
may offer better performance (no reencoding required when veryfing certificate chains) and eliminates
the issues related to error handling. Further investigation, as to which approach is better, is required.

Don't forget to star the repository: https://github.com/djarek/certify!
