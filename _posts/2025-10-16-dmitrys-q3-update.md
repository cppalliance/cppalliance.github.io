---
layout: post
nav-class: dark
categories: dmitry
title: Conan Packages for Boost
author-id: dmitry
author-name: Dmitry Arkhipov
---

Back in April my former colleague Christian Mazakas [has
announced](https://lists.boost.org/archives/list/boost@lists.boost.org/message/SW4QNUPFHJPT46Y3OY2CFCR3F73QKLRW/)
his work on [registry of nightly Boost packages for
vcpkg](https://github.com/cmazakas/vcpkg-registry-test). That same month
[Conan](https://conan.io) developers have [introduced a new
feature](https://blog.conan.io/2024/04/23/Introducing-local-recipes-index-remote.html)
that significantly simplified providing of an alternative Conan package source.
These two events gave me an idea to create an index of nightly Boost packages
for Conan.

## Conan Remotes

Conan installs packages from a _remote_, which is usually a web server. When
you request a package in a particular version range, the remote determines if
it has a version that satisfies that range, and then sends you the package
recipe and, if possible, compatible binaries for the package.

Local-recipes-index is a new kind of Conan remote that is not actually a
remote server and is just a local directory hierarchy of this kind:

```
recipes
├── pkg1
│   ├── all
│   │   ├── conandata.yml
│   │   ├── conanfile.py
│   │   └── test_package
│   │       └── ...
│   └── config.yml
└── pkg2
    ├── all
    │   ├── conandata.yml
    │   ├── conanfile.py
    │   └── test_package
    │       └── ...
    └── config.yml
```

The directory structure is based on the Conan Center's [underlying GitHub
project](https://github.com/conan-io/conan-center-index). In actuality only
the `config.yml` and `conanfile.py` files are necessary. The former tells Conan
where to find the package recipes for each version (and hence determines the
set of available versions), the latter is the package recipe. In theory there
could be many subdirectories for different versions, but in reality most if not
all packages simply push all version differences into data files like
`conandata.yml` and select the corresponding data in the recipe script.

My idea in a nutshell was to set up a scheduled CI job that each day would run
a script that takes Boost superproject's latest commits from `develop` and
`master` branches and generates a local-recipes-index directory hierarchy. Then
to have recipes directories coming from different branches merged together, and
the result be merged with the results of the previous run. Thus, after a while
an index of Boost snapshots from each day would accumulate.

## Modular Boost

The project would have been fairly simple if my goal was to _just_ provide
nightly packages for Boost. Simply take the recipe from the Conan Center
project and replace getting sources from a release archive with getting sources
from GitHub. But I also wanted to package every Boost library separately. This
is generally known as modular Boost packages (not to be confused with Boost C++
modules). There is an apparent demand for such packages, and in fact this is
exactly how vcpkg users consume Boost libraries.

In addition to the direct results---the Conan packages for Boost
libraries---such project is a great test of the _modularity_ of Boost. Whether
each library properly spells out all of its dependencies, whether there's
enough associated metadata that describes the library, whether the project's
build files are usable without the superproject, and so on. Conan Center (the
default Conan remote) does not currently provide modular Boost packages, only
packages for monolithic Boost (although it provides options to disable building
of specific libraries). Due to that I decided to generate package recipes not
only for nightly builds, but for tagged releases too.

Given that, the core element of the project is the script that creates the
index from a Boost superproject _Git ref_ (branch name or tag). Each library is
a git submodule of the superproject. Every superproject commit contains
references to specific commits in submodules' projects. The script checks out
each such commit, determines the library's dependencies and other properties
important for Conan, and outputs `config.yml`, `conanfile.py`, `conandata.yml`,
and `test_package` contents.

## Versions

As previously mentioned, `config.yml` contains a list of supported versions.
After one runs the generator script that file will contain exactly one version.
You might ask, what exactly is that version? After some research I ended up
with the scheme `MAJOR.MINOR.0-a.B+YY.MM.DD.HH.mm`, where:

* `MAJOR.MINOR.0` is the _next_ Boost release version;
* `a` implies an alpha-version pre-release;
* `B` is `m` for the `master` branch and `d` for the `develop` branch;
* `YY.MM.DD.HH.mm` is the authorship date and time of the source commit.

For example, a commit authored at 12:15 on 15th of August 2025 taken from the
`master` branch before Boost 1.90.0 was released would be represented by the
version `1.90.0-a.m+25.08.15.12.15`. The scheme is an example of [semantic
versioning](https://semver.org). The part between the hyphen and the plus
specifies a pre-release, and the part following the plus identifies a specific
build. All parts of the version contribute to the versions order after sorting.
Importantly, pre-releases are ordered _before_ the release they predate, which
makes sense, but isn't obvious from the first glance.

I originally did not plan to put commit time into the version scheme, as the
scheduled CI job only runs once a day. But while working on the project, I also
had the package index updated on pushes into the `master` branch, which
overwrote previously indexed versions, and that was never the intention. Also,
originally the pre-release part was just the name of the branch, which was good
enough to sort `master` and `develop`. But with the scope of the project
including actual Boost releases and betas, I needed beta versions to sort
after `master` and `develop` versions, but before releases, hence I made them
alpha versions explicitly.

One may ask, why do I even care about betas? By having specific beta versions
I want to encourage more people to check out Boost libraries in beta state and
find the bugs early on. I hope that if obtaining a beta version is as easy as
simply changing one string in a configuration file, more people will check them
and that would reduce the amount of bugs shipped in Boost libraries.

## Conan Generators

One of the most important Conan features in my opinion is its support for any
build system rather than for a limited selection of them. This is done via
_generators_---utilities that Convert platform description and dependency data
into configuration files for build systems. In Conan 2.x the regular approach
is to have a set of 2 generators for a given build system.

The main one is a dependencies generator, which creates files that tell the
build system how to find dependencies. For example, if you are familiar with
CMake, the `CMakeDependencies` generator creates [config
modules](https://cmake.org/cmake/help/latest/manual/cmake-packages.7.html#package-configuration-file)
for every dependency.

The other one is a toolchain generator. Those convert platform information into
build system configuration files which determine the compiler, computer
architecture, OS, and so on. Using CMake as an example again, the
`CMakeToolchain` generator creates a [toolchain
file](https://cmake.org/cmake/help/latest/manual/cmake-toolchains.7.html).

The reason for the split into 2 generators is that there are cases when you
use only one of them. For example, if you don't have any dependencies, you
don't need a dependencies generator. And when you are working on a project,
you might already have the necessary build system configuration files, so you
don't need a toolchain generator.

For my project I needed both for Boost's main build system,
[b2](https://www.bfgroup.xyz/b2). Boost can also be built with CMake, but
that's still not officially supported, and is tested less rigorously.
Unfortunately, Conan 2.x doesn't currently have in-built support for b2. It had
it in Conan 1.x, but with the major version increase they've removed most of
the old generators, and the PR to add it back did not go anywhere. So, I had to
implement those 2 generators for b2. Luckily, Conan supports putting such Conan
extensions into packages. So, now the package index generation script also
creates a package with b2 generators.

## The Current State and Lessons Learned

The work is still in its early stage, but the project is in a somewhat usable
state already. It is currently located
[here](https://github.com/grisumbras/boost-conan-index) (I plan to place it
under boostorg GitHub organisation with the Boost community's approval, or,
failing that, under cppalliance organisation). You can clone the project and
install and use some of the Boost libraries, but not all. I have tested that
those libraries build and work on Windows, Linux, and macOS. The b2 generators
are almost feature complete at this point.

My future work will be mostly dedicated to discovering special requirements of
the remaining libraries and working out ways to handle them. The most
interesting problems are handling projects with special "options" (e.g.
Boost.Context usually has to be told what the target platform ABI and binary
format are), and handling the few external dependencies (e.g. zlib and ICU).
Another interesting task is handling library projects with several binaries
(e.g. Boost.Log) and dealing with the fact that libraries can change from being
compiled to being header-only (yes, this does happen).

There were also several interesting findings. At first I tried determining
dependencies from the build scripts. But that turned out to be too brittle, so
in the end I decided to use
[`depinst`](https://github.com/boostorg/boostdep/blob/master/depinst/depinst.py),
the tool Boost projects use in CI to install dependencies. This is still a bit
too simplistic, as libraries can have optional and platform dependencies. But
I will have to address this later.

Switching to `depinst` uncovered that in Boost 1.89.0 a circular dependency
appeared between Boost.Geometry and Boost.Graph. This is actually a big problem
for package managers, as they have to build all dependencies for a project
before building it, and before that do the same thing for each of the
dependencies, and this creates a paradoxical situation where you need to build
the project before you build that same project. To make such circular
dependencies more apparent in the future, I've added a flag to `depinst` that
makes it exit with an error if a cycle is discovered.

Overall, I think Boost modularisation is going fairly well. Every library I've
tried yet builds correctly without the superproject present. I hope to finish
the project soon, preferably before the 1.90.0 release.

After that there's still an interesting possible addition. Christian's vcpkg
registry mentioned in the very beginning also had a package for a candidate
library, so that people could easily install it and try it out during the
review period. My package index could in the future also do that. Hopefully
that will motivate more people to participate in Boost reviews.
