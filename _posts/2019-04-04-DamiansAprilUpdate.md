---
layout: post
nav-class: dark
categories: company, damian
title: Damian's March Update
---

This month I've been working on the following projects:
- Certify
- Boost.Beast
- Boost.Build
- BeastLounge

# Certify
Certify now properly verifies the hostname of a TLS server according to RFC 2818
or TLS-DANE if available. Additionally, initial support for CRLSets has been
merged, although it's still missing integration into the verification code.

I've also invested a fair bit of time into researching what other open source
libraries do to perform certificate status checking. I've looked into BoringSSL,
mbedTLS, Botan and even the Go standard library. It's interesting that no
library has a default way of performing the status check of a certificate and
it's left up to the user.

The Windows implementation of the certificate store in Certify will now properly
use the entire chain passed by the peer, which resolves certificate failures in
less common cases.

Don't forget to star the repository: [https://github.com/djarek/certify](https://github.com/djarek/certify)!

# Boost.Beast
Most of the work this month involved making Beast compile faster and use less
memory by expanding the code that can use split compilation and reducing redundant
dependencies in a few places.

# Boost.Build
I've worked on implementing 2 improvements that make it less painful to work with b2:
- support for finding OpenSSL
- support for sanitizers in gcc and clang
Both are currently still in review.

# BeastLounge
The project lacked functioning CI so I implemented one. Since the project was
previously only compiled on MSVC, this proved to be quite challenging, because
MSVC accepts code that is not valid C++11. I've also created a deplyoment docker
image, which allows running the application in popular cloud environments, like
Heroku. A development version of the app is available at [https://beast-lounge.herokuapp.com/](https://beast-lounge.herokuapp.com/).
