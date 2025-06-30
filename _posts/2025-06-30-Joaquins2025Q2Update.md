---
layout: post
nav-class: dark
categories: joaquin
title: Boost.Bloom ready for shipping in Boost 1.89
author-id: joaquin
author-name: Joaquín M López Muñoz
---

During Q2 2025, I've been working in the following areas:

### Boost.Bloom

The acceptance review for [Boost.Bloom](https://github.com/boostorg/bloom)
took place between the 13th and 22nd of May,
and the final verdict was [acceptance into Boost](https://lists.boost.org/archives/list/boost@lists.boost.org/message/L4X3LREHFIZXNJRL7XLMC4NPOLWXXVCA/).
Arnauld Becheler did an awesome job at managing the review, which was one of the most
lively and productive I remember in recent years. Incorporating the feedback from the review
took me the last five weeks of this quarter, but everything's ready for shipping with Boost 1.89 (Aug 2025):

* [Review feedback as compiled by Arnauld](https://github.com/boostorg/bloom/issues?q=is%3Aissue%20state%3Aclosed%20author%3ABecheler)
* [Post-review changes](https://github.com/boostorg/bloom/pull/32)
* [Docs on `develop` branch](https://www.boost.org/doc/libs/develop/libs/bloom/doc/html/bloom.html)

### Boost.ContainerHash

* Added `boost::hash_is_avalanching` trait ([PR#40](https://github.com/boostorg/container_hash/pull/40)).
This trait was originally in Boost.Unordered, but it makes sense that it be moved here because
Boost.Bloom also uses it.
 

### Boost.Unordered

* Added `pull(const_iterator)` to open-addressing containers ([PR#309](https://github.com/boostorg/unordered/pull/309)).
* CI maintenance work ([PR#310](https://github.com/boostorg/unordered/pull/310), [PR#311](https://github.com/boostorg/unordered/pull/311)).
* Improved documentation of `erase_if` ([PR#312](https://github.com/boostorg/unordered/pull/312)).
* Deprecated `boost::unordered::hash_is_avalanching` in favor of `boost::hash_is_avalanching` ([PR#313](https://github.com/boostorg/unordered/pull/313)).
* Addressed some user-filed issues ([#305](https://github.com/boostorg/unordered/issues/305), [#308](https://github.com/boostorg/unordered/issues/308)).

### Boost.MultiIndex

* CI maintenance work ([PR#82](https://github.com/boostorg/multi_index/pull/82)).
* Addressed a user-filed issue ([#81](https://github.com/boostorg/multi_index/issues/81)).

### Boost.Flyweight

* CI maintenance work ([PR#21](https://github.com/boostorg/flyweight/pull/21)).

### Boost.PolyCollection

* CI maintenance work ([PR#31](https://github.com/boostorg/poly_collection/pull/31)).

### Boost.Interprocess

* Filed some issues ([#258](https://github.com/boostorg/interprocess/issues/258), [#259](https://github.com/boostorg/interprocess/issues/259)).

### Boost website

* Filed some issues ([#1760](https://github.com/boostorg/website-v2/issues/1760), [#1792](https://github.com/boostorg/website-v2/issues/1792), [#1832](https://github.com/boostorg/website-v2/issues/1832)).

### Boost promotion

* Posted several tweets on Boost's X account:
  * [Boost 1.88 announcement](https://x.com/Boost_Libraries/status/1910454023079289213)
  * [Boost.MQTT5 promotion](https://x.com/Boost_Libraries/status/1910991838606991446)
  * [Boost.OpenMethod review announcement](https://x.com/Boost_Libraries/status/1916512666778009719)
  * [New website announcement](https://x.com/Boost_Libraries/status/1921946625502486634)
  * [Boost.Bloom review announcement](https://x.com/Boost_Libraries/status/1922243232097824902)
  * [Boost.OpenMethod review result](https://x.com/Boost_Libraries/status/1927809347205091779)
  * [Boost.Bloom review result](https://x.com/Boost_Libraries/status/1928128488583672161)
  * [Promotion of a talk about cancellations in Asio](https://x.com/Boost_Libraries/status/1933540234026971535)
  * [Promotion of a compilation of videos on Boost from the Utah C++ Programmers Group](https://x.com/Boost_Libraries/status/1937467125141995660)
* I also did a special series on X covering the presence of Boost on the latest WG21 meeting in Sofia, Bulgaria:
  * [Boost.Hash2](https://x.com/Boost_Libraries/status/1934649592403939668)
  * [Fiscal Sponsorship Agreement](https://x.com/Boost_Libraries/status/1934998270880723015)
  * [Boost.Parser](https://x.com/Boost_Libraries/status/1935366708837105997)
  * [Boost.Math](https://x.com/Boost_Libraries/status/1935757341934186575)
  * [Boost.Unordered](https://x.com/Boost_Libraries/status/1936092537032159615)
  * [Boost.MQTT5](https://x.com/Boost_Libraries/status/1936451629118521502)

### Support to the community

* [Reviewed](https://lists.boost.org/archives/list/boost@lists.boost.org/message/5L6ZCDS2DBUUZSBZYALCEPIFRAKNP25O/) Jean-Louis Leroy's Boost.OpenMethod proposal.
* Did a small theoretical analysis of [Boost.OpenMethod's perfect hashing algorithm](https://github.com/joaquintides/perfect_range_hash).
* Did some [`c2.py`](https://github.com/cmazakas/boost/blob/c2py/c2.py) testing for Chris Mazakas.
* Supporting the community as a member of the Fiscal Sponsorhip Committee (FSC).
The asset transfer from the Boost Foundation to the C++ Alliance was finally completed this quarter,
which has enabled the launch of the long-awaited new website.
