---
layout: post
nav-class: dark
categories: joaquin
title: Joaquín's Q3 2023 Update
author-id: joaquin
author-name: Joaquín M López Muñoz
---

During Q4 2023, I've been working (mostly in collaboration with Chris) in the following areas:

### Boost.Unordered

* Implemented _bulk visitation_ for `boost::concurrent_flat_[map|set]`.  In short, bulk visitation
visits a bunch of elements at once, so instead of writing:</br></br>
<pre>std::array<int, N> keys;
...
for(const auto& key: keys) {
  m.visit(key, [](auto& x) { ++x.second; });
}</pre><br/><br/>
we can do this:</br></br>
<pre>
m.visit(keys.begin(), keys.end(), [](auto& x) { ++x.second; });</pre><br/><br/>
This functionality is not provided for mere syntactic convenience: Boost.Unordered speeds up
the entire process by pipelining the different internal stages of each individual visitation,
which results in performance improvements of 40% and more. The article
["Bulk visitation in `boost::concurrent_flat_map`"](https://bannalia.blogspot.com/2023/10/bulk-visitation-in-boostconcurrentflatm.html)
discusses this new feature in much detail.
* [Removed some unneeded using declarations](https://github.com/boostorg/unordered/pull/218) (removal of unneeded
using declarations), contributed some [hardening code](https://github.com/boostorg/unordered/commit/dbe93c765c56cb242c99a3801828f9d506fbb658),
[revamped the repo's README.md](https://github.com/boostorg/unordered/pull/219).
* Shipped [Boost.Unordered 1.84](https://www.boost.org/doc/libs/1_84_0/libs/unordered/doc/html/unordered.html#changes_release_1_84_0_major_update).
* Begun exploratory work towards adding new containers based on
[_perfect hashing_](https://en.wikipedia.org/wiki/Perfect_hash_function). The key idea behind
a perfect hashmap is that its elements are known in advance at initialization time, which
allows for the construction of an ad hoc hash function guaranteeing _zero collisions_ (for
the given set of elements). There's a tradeoff between lookup times (which can be extremely
fast based on the zero-collision assumption) and construction times (typically much larger
than for a classical hashmap), and moreover elements can't be inserted and deleted once
the map is built. We have explored so far two well-known techniques from the literature for
the generation of the associated perfect hash function:
[Hash, Displace and Compress](https://cmph.sourceforge.net/papers/esa09.pdf) (without the compress part)
and the algorithm from [Fredman, Komlós and Szemerédi](https://dl.acm.org/doi/pdf/10.1145/828.1884)
(FKS), with promising results. Progress, however, has been slower than expected, so the
target for new perfect containers in Boost.Unordered is Boost 1.86 (Aug 2024).
* After our launch of `boost::concurrent_flat_map`, a new contender 
called [ParlayHash](https://github.com/cmuparlay/parlayhash) has arisen. ParlayHash achieves
very good performance for massively parallel scenarios (dozens of cores) thanks to its
smart latch-free design based on [epochs](http://csng.cs.toronto.edu/publication_files/0000/0159/jpdc07.pdf)
for the reclamation of erased elements. The design imposes some limitations not present
in `boost::concurrent_flat_map`, most notably that elements must be immutable, but
its excellent performance has spurred Fernando and I to begin exploratory work towards adopting similar
techniques in the open-addressing context we use. It's currently too early to know if this
work will result in the addition of new concurrent containers to Boost.Unordered. As a
spin-off of this activity, a variant of `boost::concurrent_flat_map` with
[almost-latch-free insertion](https://github.com/boostorg/unordered/tree/feature/cfoa_alf_insert)
has been implemented —the decision is pending whether this will be officially merged.

### New website

* I've contributed a small section on [tweet proposals](https://www.preview.boost.org/doc/contributor-guide/tweeting.html).
Although the presence of Boost in social media has increased notably in the last few years,
I think much more need to be done, and has to be done with contributions from the entire community.

### Looking back and forward

I began collaborating with the C++ Alliance almost two years ago, when I was gently hooked by
Vinnie and Peter to work on the evolution project for Boost.Unordered alongide my colleague
Chris Mazakas. The experience so far has been a joyous one, and I've had the opportunity
to meet and work with a group of outstanding professionals from all over the globe.
Braden Ganetsky recently joined the Boost.Unordered maintainance team,
and it's been my pleasure to guide him through the onboarding process.

Going forward, I feel that most of the [goals for Boost.Unordered](https://pdimov.github.io/articles/unordered_dev_plan.html)
put forth by Peter Dimov in 2022 have been met, and it's only natural that the activitiy
in this library will decrease along this year. I'm totally open to new challenges for
the evolution of Boost, particularly if they're math-oriented and can advance the state of
the art for C++ in general —drop me a line if you have an idea in mind!
