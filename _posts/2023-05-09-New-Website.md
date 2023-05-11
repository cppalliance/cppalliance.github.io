---
layout: post
nav-class: dark
categories: Boost
author-id: vinnie
title: New Website
---

Hey, it’s Vinnie here again! I have some very exciting news to share with you. The renovated website for Boost that we’ve been working on for far too long is now going into its Public Beta phase! Feel free to poke around and kick the tires but keep in mind this is a piece of software and it is still under development. Some parts are missing, incomplete,or buggy. Without further ado:

[https://boost.revsys.dev](https://boost.revsys.dev)

This public beta will extend for at least 10 weeks as we finish the last remaining features, and put a few more rounds of polish on the artwork, visual styling, and user interface. After that if you like what you see then we will reset the database, move the repositories and the site to their new homes, and then deploy it for real! If you have suggestions or wish to report problems please feel welcome to open an issue here:

[https://github.com/cppalliance/boost.org/issues](https://github.com/cppalliance/boost.org/issues)

This is a Django site written and maintained in Python by a great group of folks from [https://www.revsys.com/](https://www.revsys.com/). The project is coordinated by Frank Wiles (https://www.revsys.com/about/bio/frankwiles), who shares the same deep commitment to open source that we Boost people do. We chose Django because it is well understood and supported, and because Python composes well with ease of maintenance. This technology stack allows us to execute on our future plans with confidence.

Some cool things about this website include:

* Log in with GitHub or Google
* Light and Dark themes with selector
* Asciidoc markdown for dynamic content
* Antora content sources for site documentation
* Data-driven dynamic pages for libraries and releases
* Integrated control panel for producing Boost releases
* Full-text search across the documentation and library headers
* Professionally designed logo to evoke identity and instant recognition

The layout of the site is carefully thought out to make sure that information can be found quickly. Fundamental topics each get a dedicated word in the top level navigation, visible on every page including the site and library documentation. Most of the information which is not library-specific is warehoused in “site docs” which is a collection of individual Antora content sources each authored in Asciidoc. Anyone can update the information on the website simply by contributing to the site-docs via pull request:

[https://github.com/cppalliance/site-docs](https://www.revsys.com/)

Antora and Asciidoc are potent technologies that offer Boost plenty of room to grow to make our site documentation and library documentation more effective for users. While the initial release of the website after the beta will only have the basic functionality, we have many future plans. Some of these you have heard about already and some are new:

* A web-based forum which interacts seamlessly with the mailing list
* Polls and surveys for measuring the sentiment of Boost users and stakeholders
* News section for aggregating off-site links, blog posts, and release progress messages
* Integrated Review process. Outcomes go in the database and become dynamic content.
* User Profiles record and show activity such as review participation or library submission

We’re all very excited and proud of the work that went into this thing and hope that it really fulfills the positive impact that we intended.

Thanks!

Vinnie
