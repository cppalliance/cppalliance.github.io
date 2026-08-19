---
layout: post
nav-class: dark
categories: joaquin
title: Joaquín's Q2 2024 Update
author-id: joaquin
author-name: Joaquín M López Muñoz
---

During Q2 2024, I've been working in the following areas:

### Boost.Unordered

* Equipped open-addressing and concurrent containers to internally calculate and provide statistical metrics affected by the quality of the hash function.
([PR#247](https://github.com/boostorg/unordered/pull/247), to be released in Boost 1.86.0).
* Reviewed Braden's work on addition of Natvis visualizers ([PR#249](https://github.com/boostorg/unordered/pull/249), see also his [article](https://blog.ganets.ky/NatvisForUnordered/),
to be released in Boost 1.86.0).
* Updated the `is_avalanching` trait protocol ([PR#250](https://github.com/boostorg/unordered/pull/250), to be released in Boost 1.86.0).
* Did some maintenance work on the CI infrastructure ([PR#253](https://github.com/boostorg/unordered/pull/253), [PR#254](https://github.com/boostorg/unordered/pull/254)).
* Tested the ability of concurrent containers to work when accessed through shared memory by different processes, and fixed the stats component for this scenario as well ([PR#258](https://github.com/boostorg/unordered/pull/258)).
This is currently provided as undocumented functionality, we need to decide whether to eventually make it official; the scenarios it allows are very interesting, however.
* As part of my ongoing investigation on perfect hashing, I gave a [talk](https://youtu.be/yOo6GnbKzp8) at [using std::cpp 2024](https://eventos.uc3m.es/105614/detail/using-std-cpp-2024.html) ([presentation](https://github.com/joaquintides/usingstdcpp2024/raw/main/Perfect%20hashing%20in%20an%20imperfect%20world.pdf), [repo](https://github.com/joaquintides/usingstdcpp2024)).

### Boost promotion and new website

* I've authored several promotional tweets such as [this](https://x.com/Boost_Libraries/status/1779944878446670208), [this](https://x.com/Boost_Libraries/status/1797703928475529335)
and [this](https://x.com/Boost_Libraries/status/1799016259734172062).
* I'm serving as PM for the new Boost website project (preview at [boost.io](https://www.boost.io/)).
The announcement to the community that the website is ready for migration to boost.org was done on [June 17](https://lists.boost.org/Archives/boost/2024/06/256965.php).
This is an ongoing project that won't stop after launch, so your feedback is most welcome! Reach out if you have comments or suggestions.

### Support to the community

I try to help Boost authors and users in those areas where I have some expertise. In particular:

* I've been reviewing and discussing Alfredo Correa's [Boost.Multi](https://gitlab.com/correaa/boost-multi) upcoming proposal. I hope Alfredo will get a review slot very soon.
* Ion Gaztañaga is writing a [development plan](https://docs.google.com/document/d/1VdMTheFUczC946dP3VKPseOoUq3sVKjU73oMvK8FE3o/edit#heading=h.3i7eohxxi73i) for Boost.Container to which I have provided some minor contributions.

### WG21, Boost, and the ways of standardization 

Many (and often opposing) opinions are being circulated about the innovation processes of WG21 and the role Boost plays in them.
In order to organize my ideas, and as a small contribution to this discussion, I wrote an [article](https://bannalia.blogspot.com/2024/05/wg21-boost-and-ways-of-standardization.html)
that hopefully can add some value to the discussion. In particular, I think that library innovation should not aim for standardization as a default
goal, and provided a [conceptual model](https://bannalia.blogspot.com/2024/05/wg21-boost-and-ways-of-standardization.html#an-assessment-model-for-library-standardization) for the assessment of standardization pros and cons.
