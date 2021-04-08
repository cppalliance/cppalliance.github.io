---
layout: post
nav-class: dark
categories: richard
title: Richard's April Update
author-id: richard
---

# A new responsibility

Last month I took over the maintenance of the Boost Property Tree library. 

This library is in ubiquitous use but has been without a full time maintainer for some time. 
There was a backlog of commits on develop that had not made it to master for the boost releases. 
This is changing in upcoming 1.76 release. Property Tree PRs and issues will get more attention going forward.
In addition, Property Tree has gained CI courtesy of GitHub Actions. The test status can be seen 
[here](https://github.com/boostorg/property_tree)

# Beast CI

Beast has acquired two new continuous integration pipelines. Drone and Github Actions.
Drone is the canonical source of truth for the Linux/Windows badge on the
[readme page](https://github.com/boostorg/beast) while GitHub Actions provides a more comprehensive matrix of
targets, C++ standards and compiler versions which I use during the development cycle.

# Boost Version 1.76

The 1.76 release of boost is imminent. As far as Beast and Property Tree is concerned, this is a maintenance release. 

