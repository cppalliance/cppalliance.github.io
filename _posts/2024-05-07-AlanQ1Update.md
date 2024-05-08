---
layout: post
nav-class: dark
categories: [ alan ]
title: Alan's Q1 Update 2024
author-id: alan
---

# Summary

- [MrDocs](#mrdocs)
- [Boost Libraries](#boost-libraries)
- [Boost Release Tools](#boost-release-tools)
- [Boost Website](#boost-website)
- [C++ Github Actions](#c-github-actions)

## MrDocs

Over the last quarter, we continued our work on [MrDocs](https://github.com/cppalliance/mrdocs), a
documentation generator for C++ projects. I have been overseeing and reviewing all the work done by the other
contributors
to the project. Besides the work done by Krystian and Fernando, George H. (an author
of https://github.com/hdoc/hdoc[HDoc])
also joined the project as a contributor.

We have been working on making the project at least as competitive as the [Doxygen](https://www.doxygen.nl/) with
[Docca](https://github.com/boostorg/docca) we have been using with other libraries. The goal is to use it in a
subset of Boost libraries that will also use [Antora](https://antora.org/) for their documentation.
In this process, we have also been improving usability and documentation, considering the feedback we received.

### Features

In particular, work in Q1/2024 included:

- Updating the LLVM version we have been using and adapting the project to the new version
- Updating CI workflows to use official releases for all dependencies, which is an essential step in the direction of
  making the project more stable for user instructions, CI, and standalone binaries
- Improve the documentation to provide more straightforward installation instructions and examples.
- New Antora plugins were included to make the documentation more interactive and easier to navigate.
- A new CI workflow that builds and caches LLVM from source, making it easier to update the LLVM versions and
  deprecate the old workflow that required manual intervention to update binaries on the MrDocs website
- Custom scripts and presets for dependencies that do not provide them, such as Duktape and LLVM
- Adjust CI to replicate the instructions in the documentation and vice-versa precisely.
- CMake Presets updated to improve the build time and reflect the documentation instructions
- Work on sanitizing references in Javadoc commands that need to know whether the first argument is an identifier.
  Clang often provides these references as simple text.
- Support for multi-node HTML tags: Clang represents several HTML tags by multiple nodes. MrDocs simply ignored these
  tags, but now they are correctly represented in the DOM.
- Support for several new Javadoc and ("throws", "details", "see") HTML tags ("br", "img", "input", "hr",
  "meta", "link", "base", "area", "col", "command", "embed", "keygen", "param", "source", "track", "wbr"). These tags
  were already present in the Boost.URL documentation, but MrDocs did not support them.
- Simplify the ASTVisitor by generalizing the traverse function.
- Provide demos with their mrdocs.yml files and use them instead of generating new ones. This change allows the
  projects to handle their custom parameters instead of relying on the global configuration.
- Support input filters to include or exclude files according to their paths.
- Create a bash argument parser so that mrdocs.yml parameters that represent CMake options can use the
  same syntax used to call CMake from the command line.
- Support for automatic CMake execution by MrDocs to generate the `compile_commands.json` file. This feature was
  implemented over many commits.
- Support for C source files.
- Filter sanitizer flags in the command database.
- A number of improvements to the [C++ Actions](#c-github-actions) project directed at benefiting MrDocs.
- Dozens of minor bug fixes and improvements to the implementation

### Binaries

While working on these concrete issues, I have also explored strategies to generate stable standalone binaries
for MrDocs. The motivation is that it is time-consuming to build MrDocs, so the way MrDocs is supposed to be most
commonly used is with scripts that download portable executables and run the tool. These scripts will usually be run
in CI on some Ubuntu-X container.

The problem is we are using recent versions of Ubuntu (Ubuntu 23.04 now) to originally build MrDocs because of the C++
features we need. However, users (including the [Boost Release Tools](https://github.com/boostorg/release-tools))
usually use earlier versions of Ubuntu (usually from 18.04 to 22.04) for various reasons. Binaries built on
Ubuntu X (say 23.04) does not work under Ubuntu <X (say 20.04). For this reason, we need to provide portable executables
that people can use.

I have researched many complex strategies to solve the problem and have been experimenting with each of them
for weeks.

- Solutions based on `-static`/`-static-libgcc` did not work because they still depend on the kernel for libc.
- Using [musl](https://wiki.musl-libc.org/) also did not work because using Musl with C++ is complex, and there needs to
  be a
  toolchain for the compilers we need. The latest C++/Musl toolchain is GCC 11.
- [Cosmopolitan](https://github.com/jart/cosmopolitan) turned out to be inappropriate for our needs. It is very
  experimental and attempts to be much more general than we need.
- GCC `-ffreestanding` compile mode limits the standard libraries available, which is not an option for MrDocs.
- A combination of MrDocs downgrading Ubuntu and Boost release tools upgrading Ubuntu. We have already implemented that,
  but
  the solution is still not portable enough for Boost let alone other workflows. There is also a limit on how much we
  can
  downgrade Ubuntu because of the C++ features we need. For instance, downgrading to 20.04 would require us to compile
  another compiler from source before building MrDocs: this is overly complex, hard to maintain, slow to test, not
  general enough, and just failed to work in practice.
- ApBuild (a gcc wrapper that enforces GLIB_C version and does a few other binary compatibility tricks) was  
  a solution somewhat similar to a wrapper overriding system libraries (see below). However, it has not been maintained
  , and a custom wrapper is likely to work better.

The solution I'm currently exploring
is [a wrapper overriding system libs](https://blog.gibson.sh/2017/11/26/creating-portable-linux-binaries/#a-wrapper-that-selectively-overrides-system-libs).
Considering the limitations of the other ideas we have tried, I will explore a strategy
similar to APBuild, but one that is manual and more stable. It is also similar to how CMake provides its binaries.
It consists of patching the release so that:

- The libraries required by MrDocs are identified and bundled with the MrDocs release in subdirectories of `lib`
- `bin/mrdocs` is renamed `mrdocs.real` (or something to this end)
- A C wrapper is compiled to replace the original `bin/mrdocs`. This wrapper adjusts the library paths and calls
  `mrdocs.real`. It should be compiled with a very old version of GCC and Ubuntu. The wrapper can be compiled once or
  in CI.

This wrapper approach has the following benefits:

- This wrapper also seemed like a complex solution at first, but it turned out to be much simpler and more effective
  than
  the other solutions we tried.
- It is easy to maintain. We can use the same logic and wrapper no matter what version of Ubuntu we initially
  used to compile MrDocs. This simplicity also means we have more freedom to upgrade the MrDocs toolchain and use more
  recent C++
  standards.
- Testing is much easier because these binaries require no specific workflow. The releases would be a patched version of
  the same
  binaries we have produced. Also, it involves no custom-built compilers.
- It is a much more general solution. We can build MrDocs on Ubuntu 23.04 and use the release binaries on Ubuntu 16.04
  if
  we have to.

### Integrations

As Boost.URL keeps integrating MrDocs, it has been inspiring the features we need in MrDocs and is temporarily
generating the documentation with both Doxygen+Docca and Antora+MrDocs. The same workflow has also been implemented
in [Boost.Buffers](https://github.com/cppalliance/buffers), which is now inspiring new feature requests, such
as the identification of [Niebloids](https://github.com/cppalliance/mrdocs/issues/564) and
[SFINAE constraints](https://github.com/cppalliance/mrdocs/issues/565) in the documentation.

### General work

In general, I've been responsible in MrDocs for:

- setting up and maintaining CI for the project;
- MrDocs and LLVM release binaries;
- build scripts;
- setting up and integrating dependencies;
- setting up and deploying the Antora toolchains and documentation to the project website;
- working on supporting libraries;
- supervising and reviewing the work done by other contributors (Krystian, Fernando, and George H.); and
- fixing bugs.

### Handlebars

The MrDocs also includes a support library that reimplements the [Handlebars](https://handlebarsjs.com/) template engine
in C++.
This module is used to generate documentation from templates. The Handlebars library has achieved a stable state and is
now used in
MrDocs to generate the documentation. It includes C++/JavaScript bindings that work both ways so that users can
provide helpers for their templates. We may consider splitting Handlebars into a separate project.

## Boost Libraries

As in other quarters, the Boost Library I have been investing most of my time
in is [Boost.URL](https://github.com/boostorg/url). The library is in maintenance mode since our focus shifted to
MrDocs,
but there is a constant demand for work fixing bugs and improving the documentation:

- Multiple commits related to the Antora+MrDocs workflow.
- Many new tests have been included to improve the library's coverage, which is now at 99%.
- Dozens of minor bug fixes and improvements to the implementation, documentation, and CI workflows

Many improvements had to be coordinated with the [C++ Github Actions](#c-github-actions) project, which implemented new
features for these use cases. Many bugs in the actions were also revealed by
[Boost.HTTP](https://github.com/cppalliance/http_proto) now uses the actions in its CI.

In general, I have been responsible for:

- upgrading CI, primarily coordinating with the [C++ Github Actions](#c-github-actions);
- maintaining, simplifying, and updating build scripts;
- integrating more spec tests, such as the Ada tests included more recently;
- including more examples, such as the more recent sanitize-URL example;
- fixing documentation content out of date; and
- fixing bugs.

Besides Boost.URL, as usual, I have been overseeing and fixing smaller issues with other boost libraries. I have been
also helping [Boost.HTTP](https://github.com/cppalliance/http_proto)
and [Boost.Buffers](https://github.com/cppalliance/buffers)
in their efforts to improve CI and integrate MrDocs.

## Boost Release Tools

I have been working on the integration of toolchains I developed into the Boost Release Tools to add support for
features
desired for the new Boost website.

We needed many improvements to the workflow for Antora support in the release tools, as bugs and inconveniences
have been identified since the official Boost release 1.84.0. Antora directories are now patched and moved to another
location.

We also kept working on an initiative to support archive variants in the release tools. This pull request is
still under review and will be considered for inclusion in a period between Boost releases when priority
moves from the [Boost website](#boost-website).

## Boost Website

Among the many support projects for the new Boost website, I have been helping the most on
[`website-v2-docs`](https://github.com/boostorg/website-v2-docs), which includes the Boost website documentation as
an Antora project.
Its components represent the website's "User Guide," "Contributor Guide," and "Formal Review" sections.

Since the beginning of the project, I have been overseeing and reviewing the work of the other contributors.

In general, I continue to be responsible for:

- reviewing and merging all pull requests to the project;
- setting up and maintaining CI for the project;
- coordinating with the website project on content uploaded to AWS buckets;
- build scripts to be reused by the release tools and previews;
- writing sections of the documentation that require technical knowledge;
- developing custom Boost/Antora extensions, such as the Boost Macro extension;
- maintaining the Antora toolchain and templates; and
- adjusted Boost libraries to match formats expected by the website.

## C++ Github Actions

[C++ Github Actions](https://github.com/alandefreitas/cpp-actions) is a project I have maintained
since 2023. It is a collection of composable, independent, and reusable GitHub Actions for any C++ project
that needs to be tested on various compilers and environments.

MrDocs, Boost.URL, Boost.HTTP, and Boost.Buffers are currently using these actions in their CI. All of these projects
have been allowing us to get more feedback and improve the actions.

The project includes actions to:

- Generate a Github Actions Matrix for C++ projects;
- Setup C++ compilers;
- Install and setup packages;
- Clone Boost modules;
- Run complete CMake and `b2` workflows;
- Generate changelogs from conventional commits;
- Generate summaries; and
- Generate time-trace reports and flame graphs

One notable problem with GitHub actions in Q1/2024 is that GitHub decided to update the base version of Node.js to 20.
Because Node.Js is not statically linked, this change [broke](https://github.com/actions/setup-node/issues/922) many
actions that depended on it. All projects that depend on older containers now get an error related to the appropriate
`glic` version not being found. Attempting to use older versions of Node.js still works temporarily, but it also emits
a warning. This [bug](https://github.com/actions/runner/issues/2906) will need to be addressed in the
future.

In particular, a number of new features were added to the C++ Actions project in Q1 2024.

- Boost optimistic caching is now disabled by default. Caching is optional.
  Expressions in the main workflow to override these parameters.
- Cmake workflow includes a complete bash command line parser for the CMake arguments. It makes the workflow more
  reliable as commands are now properly passed through to CMake in a way that matches the user's expectations.
- Cmake workflow supports combinatorial variants of extra arguments. For instance, this could be used in integration
  tests (as has been implemented in Boost.URL) where the same workflow is run with slightly different arguments.
- CMake setup is cached in the GitHub Actions tool cache. The binary is also added to PATH.
- All C++ Matrix suggestions are now customizable for ranges of compiler versions. This feature eliminates the need for
  expressions to override matrix options.
- C++ Matrix supports custom images.
- C++ Matrix has a new option for combinatorial factors. Unlike other factors that apply to the latest or an
  intermediary version of a toolset, combinatorial factors duplicate all entries for a compiler and set a new flag
  to identify that kind of test. For instance, it could be used to test clang with libc++ and libstdc++ in parallel
  for each clang version.
- C++ Matrix includes flags for intermediary compiler versions. These flags are handy when a test does not need
  to occur in intermediary versions of a compiler that have no unique factors applied to it.
- C++ Matrix supports composite factors. Composite factors allow two factors to be determined at once for a test.
  For instance, the factor `TSan+Asan` will set the flags for both TSan and Asan in the same test, with having to create
  a test for each. This type of factor is useful when the factors are mutually exclusive.
- The C++ Matrix uses containers by default when appropriate. In particular, this eliminates errors with Clang, which
  often picks up an uncommon version of stdlibc++ when running tests. This choice is often an incompatible version that
  does not
  represent the most common use case by the user.
- B2 workflow supports versioned toolsets. For instance, a toolset `gcc-13` would appropriately set only `gcc` in
  `user-config.jam` while calling `b2` with the appropriate complete flag.
- B2 workflow support for dozens of options specific to B2. These include options supported by B2 that do not apply to
  CMake: `clean`, `clean-all`, `abbreviate-paths` (default is `true`), `hash`, `rebuild-all`, `dry-run`,
  `stop-on-error`, `config`, `site-config`, `user-config`, `project-config`, `debug-configuration`, `debug-building`,
  `debug-generators`, `include`, `define`, and `runtime-link`. A number of these options have been necessary in other
  Boost projects using these actions.
- Package-Install supports `add-architecture`.
- Dozens of other minor improvements, bug fixes, and updates to the documentation.

In addition to new features, most work has been done to fix issues revealed by testing the actions in new environments.
About ~50 bugs with various levels of severity have been fixed in Q1/2024.
