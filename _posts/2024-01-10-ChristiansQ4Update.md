---
layout: post
nav-class: dark
categories: christian
title: Christian's Q4 2023 Update
author-id: christian
author-name: Christian Mazakas
---

This last quarter has been an interesting one. Development on the Unordered
library has slowed down so I've been re-tasked with aiding in the development
of a whole new slew of HTTP/1-based libraries.

The new year is a common time for reflection on where one's been and how far one
has come. When I first started working on Unordered, I knew relatively little
about hash tables. I was somewhat versed in C++ container design and
implementation but in hindsight, I knew little to nothing in actuality.

I've now since become an expert in library minutiae. As an example, I spent no
less than an hour discussing the validity of allocator-constructing a
stack-local variable as part of an optimization technique for Unordered's flat
maps.

It's been quite a privilege to essentially study C++ under a couple of world
experts, Joaquín M López Muñoz and Peter Dimov. I'll never be able to see
hash table design the way Joaquín does but his incredibly sharp and compact way
of solving complex problems has forever changed how I write C++ code. On the
other hand, Peter's helped guide and shape how I think about testing and
actualizing it in code effectively.

My new found aptitude for testing has led to a shift in how I develop software
going forward, something I'm calling "failure driven development". While most
TDD workflows involve starting with a failing test case first, they don't often
stress the importance of testing failures themselves. For example, code that
opens a file and the file does not exist. I've applied the principles I learned
on the job to my hobby projects and because of this, I've actually found a bug
in the io_uring Linux kernel module. I also helped diagnose a performance
regression as well.

A principle I've learned is that you don't really understand code or a system
until you test what kinds of errors it outputs and how it behaves under those
conditions.

I look forward to the future in helping deliver these HTTP/1 libraries as
they're going to be dramatic improvements over the existing Beast library but
I'll never forget what Unordered taught me.

It's interesting working for a fully remote company like the Alliance because
my coworkers are scattered all over the globe, from Spain to Bulgaria and
beyond. Expertise is scattered all throughout the world and it's amazing how
technology enables so much collaboration. It also enables me to hone my skills
in slow-cooking recipes and I'm now on a quest to completely master the dish
chile colorado.
