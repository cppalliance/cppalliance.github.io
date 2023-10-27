---
layout: post
nav-class: dark
categories: fernando
title: Fernando's Q3 Update
author-id: fernando
---

I'd like to share with you some of the initiatives and projects I've had the pleasure of collaborating on over the past few months.

# Exploring Projects

Engaged in detailed exploration of the following projects, diving deep into their codebases and documentation to gain comprehensive insights:

- Boost Asio
- Boost Beast
- Boost URL
- Boost Requests (not in Boost yet, by Klemens)

It was a journey through these projects' philosophy, design choices, and intricacies.

# Recent Adventures

- Took a deep dive into Asio's new features, aiming for a more comprehensive grasp.
- Collaborated with Klemens on tests for Boost Requests.
- Got a close look at MrDox, understanding its structure and inner workings.
- Appointed as the maintainer of Boost Beast and managed its latest release.
- Mohammad has stepped in as the maintainer of Boost Beast, with my oversight. I'm ensuring everything is primed for the Boost 1.84 release.
- Started to immerse myself in Boost's modularization efforts, getting familiar with b2 and the latest tweaks by René.

# Constexpr Tools for Advanced Language Processing:

I've ventured into the intriguing world of constexpr lexers, parsers, code generators, specifically targeting URLs and niche programming languages. The vision I pursued was to develop generic tools for constexpr lexing and parsing as an EDSL (Embedded Domain Specific Language). Moreover, I aimed to specialize in compiling a language similar to Array (like BQN, UIUA, ...) and generating code during compile time. The allure behind this approach was to leverage the natural affinity these languages have with vectorization (SIMD).

While I find this exploration deeply enthralling and see its immense potential, I've encountered challenges in pitching the idea. Locating concrete examples of its real-world application proved elusive, making it seem more like a research and lab endeavor rather than a tangible solution.

# Envisioning Boost's Modular Future

One area that truly excites me is the modularization of Boost. Boost currently uses two build tools: CMake and b2. With b2 evolving to embrace a modular Boost, it's thrilling to think of a future where users can seamlessly integrate any Boost library and its dependencies. Python, JavaScript, and Rust developers have this luxury. Why not C++? Boost's modularization could be a game-changer in making C++ more welcoming to new and seasoned developers alike.

# Boost Asio: Making Networking Approachable

Klemens came up with a brilliant idea: a tutorial or guidebook for Boost Asio. I think it's a fantastic initiative and I'd love to chip in and help out where I can.

Boost Asio is a standout within Boost for its networking and low-level I/O capabilities. Yet, its complexities can sometimes be daunting for those new to it. This guidebook is imagined to bridge that gap, aiming to make Boost Asio more accessible and empowering newcomers to tap into its full potential.
