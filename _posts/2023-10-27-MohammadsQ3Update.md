---
layout: post
nav-class: dark
categories: mohammad
title: Mohammad's Q3 2023 Update
author-id: mohammad
---

During Q3 2023, I've been making progress in the following areas:

### Psql

[Psql](https://github.com/ashtum/psql) is a C++ PostgreSQL client based on Boost.Asio and libpq. I initiated this project with the aim of creating an easy-to-use and easy-to-maintain client-side library. In this quarter, I achieved the following milestones:

- Gained a comprehensive understanding of the libpq interface and its utilization in asynchronous mode.
- Explored various possibilities for the `connection` and `connection_pool` interfaces.
- Implemented support for pipelined queries.
- Created user-friendly C++ wrappers for libpq result types, simplifying the conversion between different types.
- Introduced an interface for receiving PostgreSQL notifications.
- Enhanced support for working with user-defined types and automatic retrieval of their Oid upon query.

### Boost.Beast

I have recently become more involved in the maintenance of Boost.Beast. Since Klemens is currently occupied with Boost.Cobalt and [not yet Boost].Request, I have contributed minor PRs such as [fixing the issue of using `asio::deferred` as a completion token](https://github.com/boostorg/beast/pull/2728). Additionally, my primary focus has been addressing user issues.

### Search Functionality for the New Website

I made some adjustments to the [boost-gecko](https://github.com/cppalliance/boost-gecko/tree/new-website) project to better align with the new website's style and adapt to dark/light mode switching.
