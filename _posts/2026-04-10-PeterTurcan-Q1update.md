---
layout: post
nav-class: dark
categories: peter
title: On Triremes, Aircraft, and Molecular Modelling Simulations
author-id: peter
author-name: Peter Turcan
---



First some personal news. To keep my coding skills sharp(ish), I updated my simulation of Greek and Persian triremes (rowed war-galleys with big bronze rams) with better graphics (splashy bows, greying sea and skies in strong wind, fire pots to illuminate courses) and some better AI. Originally the code was in C++, but changed to C# to work well with XNA graphics. I was unaware of the Ogre graphics library at the time, nor the Boost libraries - which might have given the performance to extend the AI look-ahead from a paltry six seconds to perhaps ten seconds or more (look-ahead is a combinatorial explosion and performance-critical). Called the updated game Trireme Commander 2, and put it up on itch.io. So far, sold one copy - only 999,999 to go and I will have sold a million! One step at a time I guess.

![Triremes](/images/posts/peterturcan/pandora-in-storm.png)

From discussions with new Cpp Alliance staff, I added two scenarios to the User Guide - aeronautical engineering and bio-tech. I do know something about aeronautical stuff - having worked on the awesome Microsoft Flight Simulator for four years (one of the best jobs I had in about 18 years at Microsoft). Modern aircraft should be considered as flying computers - so many systems working on our behalf and most of those systems (airspace, instrument landing, beacons, runways) well thought out with safety in mind. Writing real-time software for an aircraft though requires following a strict discipline and procedures that most of us are never aware of. If you have four airspeed sensors and two give one number, and two another, what do you do? Terrible things have happened if coders do things like just take the average. I added the scenario to the User Guide with some examples of the procedures and errors that come up with flight software, such as range failure, underflow, and order-dependent drift.

![Aircraft gear](/images/posts/peterturcan/aerospace-gear.png)

Whereas I know something about airplanes, I know little about bio-tech software - molecular modelling and stuff like that. However, my son works at Carnegie Mellon as a PhD and bio-tech assistant, and I was able to get a meaningful discussion going on phylogenetic trees - modelling evolution, species, and all those things that follow a biological tree structure. Fascinating, and I added the topic again to the User Guide advanced scenarios. Talk about airplanes being flying computers, carbon-based lifeforms are computers too only many times more involved and connected.

Documentation needs to feel alive too - it needs updated and new stuff added on a regular basis just to show it is active and evolving. Adding topics to the FAQs (User and Contributor) is something I do frequently - often looking at the discussions on #boost slack channels to pick up on current thinking and areas of difficulty or concern, such as compatibility issues, CMake, and conference attendance. Or, for contributors, topics such as documentation, navigation, and useful macros.

Reading proposed library documentation is always interesting. Always try to get the authors to focus on, or at least mention, use cases. It is use cases that pull in developers - saying what something "does" is so much more important than saying what something "is". Developers, understandably, are so close to the metal that it can be difficult for them to step back and focus on use over internals. There are many perspectives in looking at the same thing.