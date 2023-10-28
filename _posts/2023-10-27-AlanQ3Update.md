---
layout: post
nav-class: dark
categories: alan
title: Alan's Q3 Update
author-id: alan
---

# Summary

- [MrDocs](#mrdocs)
    - [Handlebars](#handlebars)
    - [The DOM](#the-dom)
    - [Javascript Bindings](#javascript-bindings)
    - [Unit tests](#unit-tests)
- [Boost Website](#boost-website)
- [Boost Release Tools](#boost-release-tools)
- [Boost Libraries](#boost-libraries)
- [C++ Github Actions](#c-github-actions)
- [Gray-box local search](#gray-box-local-search)

## MrDocs

Over the last quarter, we have been working intensely on [MrDocs](https://github.com/cppalliance/mrdocs), a documentation generator for C++ projects. I've been overseeing and reviewing all the work done by the other contributors in the project. I've also been responsible for:

- setting up and maintaining CI for the project; 
- MrDocs and LLVM release binaries; 
- build scripts; 
- setting up and integrating dependencies; 
- setting up and deploying the Antora toolchains and documentation to the project website; 
- working on supporting libraries; and 
- fixing bugs.

These are some of the highlights of the work done in the last quarter:

- Refactor library layout and scripts so all the implementation files are in [`src`](https://github.com/cppalliance/mrdocs/commit/04f75ddbeb666a65a3a8604b5cfaead1977e8c1c)
- [Automated deployment](https://github.com/cppalliance/mrdocs/commit/5bd2cc494d82e10189041f138efc6a9abf3bd55e) of demo documentation to the project website. The website is updated on every commit to the `develop` or `master` branches.  The action uses the actual release package to generate the documentation. This PR involved fixing all scripts and directory layouts for the release package to be properly usable. The new project layout uses the FHS standard. CMake modules to create a target to generate the documentation for projects were included in the installation. The MrDocs executable and libraries are installed as separate CMake package components. Any usage of FetchContent has been removed from the CMake scripts. The documentation was refactored to reflect the changes. Included complete instructions in the documentation pages for installation and usage, describing all commands and options.
- Deployed [new LLVM binaries to the website](https://mrdox.com/llvm+clang/) and [updated CI](https://github.com/cppalliance/mrdocs/commit/2584328ab143d50d4d8289ac83f019f622200fa4). The binaries were regenerated for all platforms in 4 modes: `Debug`, `Release`, `RelWithDebInfo`, and `DebWithOpt`. This involved fixing long-standing bugs related to conflicts in LLVM versions used by the project and providing new pre-built binaries on the website. In particular, the previous pre-built binaries used a special ReleaseWithDebInfo LLVM configuration that caused conflicts with MrDocs on MSVC, being used with a Debug CMake configuration variant by developers. This eliminated the need for the ad-hoc GitHub LLVM binaries release and for the special docker container we had been using so far.
- Added [support for CMakePresets](https://github.com/cppalliance/mrdocs/commit/ba63ed0f8cab4846dbff468b8d1f24d14f5d22c8). This allowed us to simplify the build process for MrDocs and its dependencies, which was previously counting on long command line commands and `CMakeUserPresets.json` files without a corresponding `CMakePresets.json` file. It was also a step towards the new installation instructions in the documentation. An example file for `CMakeUserPresets.json` including all compilers was provided. The base `CMakePresets.json` file included a special vendor configuration to hide base configurations from Visual Studio. `CMakeSettings.json` was deprecated.
- Added complete [installation instructions](https://github.com/cppalliance/mrdocs/commit/34912248fbbd006b163c6bd438e30ff52efc4fac) for the project. The instructions were adapted so that all commands are relative to an enclosing directory containing all the dependencies and MrDocs. Included instructions for all steps considering package managers, installed dependencies, or binaries provided on the project website. The CMake scripts were adapted to make it easier to build the project in a variety of environments according to the instructions.
- Included a [polyfill implementation of `std::expected`](https://github.com/cppalliance/mrdocs/commit/2e554c8b636f31815fb80656717e910e097fbb77) as `mrdocs::Expected`. This implementation is currently being used by MrDocs and support libraries.
- [Refactored MrDocs generators](https://github.com/cppalliance/mrdocs/commit/63ac382438b6fa78041210f67f0736d0977a924b) to use our custom [C++ implementation](#handlebars) of the Handlebars template engine. Javascript helpers are loaded with [duktape](https://duktape.org/) with our [Javascript Bindings](#javascript-bindings) and compiled into functions in the Javascript engine.
- Refactored the project name from MrDox to [MrDocs](https://github.com/cppalliance/mrdocs/commit/12c027f4f1b449570ae58b601634b29f5fdbfd3f)

### Handlebars

MrDocs includes a support library that reimplements the [Handlebars](https://handlebarsjs.com/) template engine in C++. This module is used to generate documentation from templates.

Over the last quarter, this is the MrDocs support library in which I have been investing most of my time. All the development started in this same quarter in July. It already supports all features from the original Handlebars test suite, including all mustache features. The library is already integrated with MrDocs to generate the documentation for the project website. 

- [Initial proposal](https://github.com/cppalliance/mrdocs/commit/81a5b886d09999a0cd36e983349515e5d0ae6d27) of the C++ Handlebars library. 
- Fixed and refactored code that relied on [references to temporaries](https://github.com/cppalliance/mrdocs/commit/353fe987825023c9a886411c76798e93e27adabb) generated by the Dom.
- Included support for [inverse blocks without helpers](https://github.com/cppalliance/mrdocs/commit/68491d0ee8a9d13088e2f0f96bd4aad6cfc78435)
- All features, specs, and tests from the original Handlebars test suite were then ported to C++ and are now passing: [basic specs](https://github.com/cppalliance/mrdocs/commit/74fd1f357543e3097e58e1a1e5ed3992c918402b); [partials and automatic indentation](https://github.com/cppalliance/mrdocs/commit/5a0409a032d99c2efef374f74f3e2cb7fc80d49c); [whitespace control](https://github.com/cppalliance/mrdocs/commit/7e5250ea35e5e5e30175d5cc533337739f3d46f9); [block helpers, mustache blocks, and chained blocks](https://github.com/cppalliance/mrdocs/commit/95210f86884ff831d0a6a7d7f22aee05b6ec281b); [subexpressions](https://github.com/cppalliance/mrdocs/commit/f3e686136212ade78c2b0573bb2e81b9edbc01bf); [builtin helpers](https://github.com/cppalliance/mrdocs/commit/7510558dce3950059470d3ec9f11870f6b7354e2); [private data](https://github.com/cppalliance/mrdocs/commit/c1223af5f866351821f3dd69fa4ed7f0d6deb9a8); [helper formats](https://github.com/cppalliance/mrdocs/commit/8f674d5bb220f24539ec46430cae234ebeb832ee); [track-ids mode](https://github.com/cppalliance/mrdocs/commit/517d4d41e0456f134f79710326f2b05c0c213267); [strict mode](https://github.com/cppalliance/mrdocs/commit/deaa47c876e50e5018ac22ede69a79f35a611fa4); [util](https://github.com/cppalliance/mrdocs/commit/d10a92142e7420d7af4656048e548ee314fd9ff9); [mustache](https://github.com/cppalliance/mrdocs/commit/f63df18387c3d2461ba8d2ae7dbe9b103cc69a10). As many handlebars features were undocumented in the original implementation, adjusting our handlebars implementation, which was only designed to handle basic templates, to pass all tests from the original Handlebars test suite involved multiple significant refactors and improvements to the entire codebase. The tests are a superset of the mustache specs, which are also passing. The previously available [SafeString](https://github.com/cppalliance/mrdocs/commit/2f9fe70c30b0d8deeaf4bb104258802b6aa1f138) type because a regular `dom::Value` with the implementation of the specs.
- Support for [`dom::Function`](https://github.com/cppalliance/mrdocs/commit/93a1bf991e4d754fdadb77dd3f1d175dfb77f60f) in all components of the Handlebars engine instead of custom callback types. This also allows the engine context to contain functions that can work similarly to helpers. The engine callback object is passed as the last argument in a helper, similar to the Javascript implementation. Because most built-in helpers support variable arguments, a new `dom::Function` implementation type was provided to support this use case.
- Support for [error handling via `Expected`](https://github.com/cppalliance/mrdocs/commit/2e554c8b636f31815fb80656717e910e097fbb77). All functions that might fail have a variant that throws exceptions and another that returns an `Expected` value. Helpers functions are also allowed to propagate errors via `mrdocs::Error`. 
- Fixed a [bug](https://github.com/cppalliance/mrdocs/commit/bf64028b4ec2cdb6cef34e53259fdd99bf199a98) that caused MrDocs to emit `[object Object]` for `{{'\n'}}` after the [transition to C++ handlebars](https://github.com/cppalliance/mrdocs/commit/63ac382438b6fa78041210f67f0736d0977a924b).
- The "find" helper was adjusted to [support strings, arrays, and objects](https://github.com/cppalliance/mrdocs/commit/60d79ff116a4eb7532aef218860e48818c2b95e2). This fixes a problem with the variants of similar but conflicting helpers that were categorized as container and string helpers.  

### The DOM

MrDocs also includes a support library called "DOM" that provides a C++ interface to type-erased property trees, such as JSON and Javascript Objects. This module is used by MrDocs to create opaque representations of property trees that can be used by the Handlebars engine and other library functions. Such representations can come from a variety of sources, including JSON files, Javascript objects, and internal C++ objects with information parsed by MrDocs. 
 
After completing the Handlebars implementation, I also included [complete unit tests](https://github.com/cppalliance/mrdocs/commit/cc9e397f25e9f969e0569a79327754bd2e6b26fa) for the DOM. Tests were included for all DOM types and many bugs have been fixed.

All classes have been documented to reflect their intended behavior, which is loosely modeled after JavaScript types and data structures. The APIs have also been adjusted to be safer and more consistent with the model for reference types. Objects and Value types received functions for nested object lookup and objects were generalized to support non-enumerable properties and Javascript bindings.

### Javascript Bindings

MrDocs includes a support library that wraps [duktape](https://duktape.org/) to provide a C++ interface to the Javascript engine. This module is used by the MrDocs executable to evaluate user-defined helpers.

I also included [unit tests](https://github.com/cppalliance/mrdocs/commit/d5b7b3d1bf983cde57619314e49681e3c73c1a02) for Javascript wrapper and bindings. 

Throughout the process, 

- the implementation was completed for classes that were placeholders and existing bugs have been fixed
- the API was documented
- The javascript `Scope` object was extended to support all types of alternative syntax to evaluate expressions. 
- Value types: support for integers and floating point numbers.
- Value types: support for all dom::Value operations using the native `duktape` functions
- Provided classes to wrap javascript Objects, Arrays, and Functions as [DOM](#the-dom) values
- `Scope` functions that might fail were adjusted to return `Expected` values

### Unit Tests

MrDocs includes a support library for unit tests. The library was initially adapted from the Boost.URL unit tests and extended to support the needs of MrDocs.

I had previously implemented a smaller system for the Handlebars unit tests which was then [integrated with the boost.url test suite library](https://github.com/cppalliance/mrdocs/commit/e14fe087c2ecb7884f0af21b94ce34414506b3ef). Features from the handlebars test suite library were ported to the boost.url test suite library, including the expression decomposer and the diff algorithm for golden master tests.

With this integration, Handlebars tests were then listed among any other tests in the library. These tests were later complemented with regular MrDocs tests. 

The decomposer has later been improved for [integral comparison operators](https://github.com/cppalliance/mrdocs/commit/831a691957de8266788dd42b3a4c1116c8f46505).

## Boost Website

In this last quarter, the Boost website went beta on https://www.preview.boost.org/. Among the many support projects for the website, I've been helping the most on the [`cppalliance/site-docs`](https://github.com/cppalliance/site-docs), which includes the Boost website documentation as an Antora project. Its components represent the "User Guide", "Contributor Guide", and "Formal Review" sections of the website. 

Since the inception of the project, I've been overseeing and reviewing all the work done by the other contributors to the project. I've also been responsible for:

- setting up and maintaining CI for the project;
- coordinating with [`cppalliance/temp-site`](https://github.com/cppalliance/temp-site) on content uploaded to AWS buckets;
- build scripts to be reused by the release tools and previews;
- writing sections of the documentation that require technical knowledge;
- developing custom Boost/Antora extensions, such as the Boost Macro extension;
- maintaining the Antora toolchain and templates; and
- adjusted Boost libraries to match formats expected by the website. 

The Antora [playbooks were recently adjusted](https://github.com/cppalliance/site-docs/commit/aefae2a6062cc19a731e007bc28c275180e290fd) to initially contain no content sources, now that the Antora-enabled build process also implemented by me was deployed in the official Boost release process.

## Boost Libraries

As in other quarters, the Boost Library in which I have been investing most of my time is [Boost.URL](https://github.com/boostorg/url), since it's our most recently accepted library. The library is in maintenance mode since our focus shifted to MrDocs, but considering how recent it is, there is a constant demand for work fixing bugs and improving the documentation. In Boost.URL, I've been responsible for:

- upgrading CI, mostly coordinating with the [C++ Github Actions](#c-github-actions);
- maintaining, simplifying, and updating build scripts; 
- integrating more spec tests, such as the Ada tests included more recently;
- including more examples, such as the more recent sanitize-URL example;
- fixing documentation content that is out of date; and
- fixing bugs.

Besides bugs, the library was recently refactored to remove what was previously called a "header-only" mode and deprecated several aliases, which caused some small friction in this last quarter. These are some of the highlights of the work done in the last quarter:

- Extended [fuzz testing](https://github.com/boostorg/url/commit/516e0093c55271a6ec9b9f271292fc29bcd586cd). `Fuzz` was included as a new clang factor in CI. The process was adjusted so that the corpus is properly reused from and stored in GitHub action archives. CMake scripts were refactored to include CMake options that control the fuzzer parameters. Fuzzers were included for each of the grammar rules for URLs.
- [Support `IP-literal` as `IPv6addrz`](https://github.com/boostorg/url/commit/f2bb191b902ab63fa2207c64cfe273bd516a719d). This is an [issue](https://github.com/boostorg/url/issues/711) where a valid `IPv6addrz` wasn't being considered an `IP-literal`. IPv6addrz includes a `ZoneID` at the end, delimited by an encoded `"%25"`. The `ipv6_address` class is unmodified, as the mapping from the `ZoneID` to a `std::uint32_t` is dependent on the application context. The original `ZoneID` can be obtained from the url_view but the library is agnostic about it.
- Included [GDB pretty printers](https://github.com/boostorg/url/commit/f3fe229c9d349d06083f9cdf1ae163b84b1ad1d8) and documentation. All available URL components are now pretty printed in GDB. A developer mode was also included which prints the URL components in a format corresponding to the internal URL string offsets.
- Updated the [content of both the documentation and README.adoc](https://github.com/boostorg/url/commit/7e47e9fef6fecce45f7c65277601b7e7ff38c365) so that they match current best practices. The documentation in README.md contained dated and incorrect information, while the quickbook documentation was missing important information and contained bad practices.

Some relevant bug fixes were:

- Enforced that appropriate CMake BOOST_INCLUDE_LIBRARIES are set [according to the build options](https://github.com/boostorg/url/commit/d0746ebf941230d0c8a535859da2a0f7e6a747ca). The previous implementation included these extra libraries whenever they were available, which caused problems for other libraries that depended on Boost.URL via `depinst.py`.
- Fix and include unit-tests for issues [#755](https://github.com/boostorg/url/issues/755) and [#446](https://github.com/boostorg/url/issues/446)  
- We [disabled](https://github.com/boostorg/url/commit/20ab896ffede3c4ac9cbfb6740e6e97f321ccd87) and [re-enabled](https://github.com/boostorg/url/commit/cac7c200e28e3559d4ea9ea43033bda5e8f66c39) drone caching. This is related to a bug where Drone would attempt to cache the `b2` binary, which would cause conflicts. This was fixed with [PR #123 in boostorg/boost-ci](https://github.com/boostorg/boost-ci/pull/213). 
- Remove quickbook [references to variant](https://github.com/boostorg/url/commit/b156eb230193e5f2d79980812106872f2d71c535). Links and references to `variant` in both the `.qbk` and `.xml` files were removed as the `variant` alias had been deprecated in [96438f6](https://github.com/boostorg/url/commit/96438f683e09e20183fab1b6059fa7f1b0ffe67d).
- Updated [javadoc deprecated references](https://github.com/boostorg/url/commit/705554ca127cc1deb5d66efcdbd16cc593e31950). This fixed a mistake where the Javadoc for many deprecated aliases included references to the deprecated alias `boost::core::string_view` instead of the correct deprecated aliases `boost::optional`, `system::error_category`, `system::error_code`, `system::error_condition`, `system::system_error`, and `system::result`.
- Replaced `@ref` prefixes [with backtick for references](https://github.com/boostorg/url/commit/3db1407cc9d792c1e192b401d31c2c12f607ec25) in javadocs. This caused an issue in the documentation since several aliases were deprecated in favor of symbols from Boost.Core. 
- [Refactored variable name in url::set_params](https://github.com/boostorg/url/commit/a1181275d02a0a4c6ab8147354f752ec36e1dd98). This issue was causing an error in the documentation for `url_base::set_params`.
- [Fix bug](https://github.com/boostorg/url/commit/0ca58467a472c72e84405a7d991201f58ffdf327) where `url_view`/`string_view` constructor would require a non-`url_view_base` as input. This [cased the constructor to reparse the `string_view`](https://github.com/boostorg/url/issues/756) from an already parsed `url_view_base`.
- [Fix bug](https://github.com/boostorg/url/commit/c97bc2782cdd9b343ede1492863a672805c255cd) where `parse_query` would recreate `std::string_view`s. This would make the query [include values in the underlying std::string beyond the expected string_view](https://github.com/boostorg/url/issues/757).
- Updated [changelog](https://github.com/boostorg/website/commit/8c39fd223c5c9f74f0d70d611c35360415d862da) for boost release.

Besides Boost.URL, as usual, I've been overseeing and fixing smaller issues with other boost libraries, such as Boost.Docca, Boost.StaticString, and helping with libraries by other contributors when asked for assistance, as in a more recent case with Boost.Outcome. 

In particular, we had to fix a smaller issue in Boost.Docca that was also affecting Boost.URL. The issue involved Boost.Docca's dependence on a deprecated version of Doxygen that is no longer supported by the Boost toolchain.   

## Boost Release Tools

Over the last quarter, I've been working on the integration of toolchains I developed into the Boost Release Tools to add support for features desired for the new website. 

Some of the highlights of the work done in the last quarter:

- Introduced support for libraries with Antora documentation [into the official Boost release process](https://github.com/boostorg/release-tools/commit/66670dfcf4d1ac69a963aa74cd9c06ffade73d58). Deployed new docker containers that include NodeJS, Gulp, and the Antora toolchain. With this enhancement, each library now can function as an Antora component within an Antora master project hosted in a separate repository (https://github.com/cppalliance/site-docs). This master project repository also contains additional components, such as the user guide, contributor guide, and a dedicated component for the review process. In a subsequent phase of the release process, this Antora documentation is seamlessly merged with the pre-existing in-source documentation, which has been generated using various other tools. When a library is "Antora-enabled", the release process will automatically generate the Antora documentation and publish it with the documentation of other libraries. No `b2` scripts are required to generate the documentation for the library. All Antora-enabled libraries use the same master Antora UI template that matches the design of the boost website. Antora [playbooks were adjusted](https://github.com/cppalliance/site-docs/commit/aefae2a6062cc19a731e007bc28c275180e290fd) to initially contain no content sources, now that the Antora-enabled build process in deployed in the official Boost release process.
- Deployed new container [to `boostorg/boost`](https://github.com/boostorg/boost/commit/30f0ef1de2d8f205502d2a557ee0c9cb5a3b4708) to support the new release process.
- New [archive variants](https://github.com/boostorg/release-tools/pull/52) for boost. Add extra archive variants such as `boost-docs` and `boost-source`. These variants can reduce expenses with JFrog download bandwidth, provide users with archives that are simpler to use, and provide docs-only archives for the website. The new MakeBoostDistro.py script includes parameters to determine what types of files should be included in the distribution. All other functions are adapted to handle these requirements accordingly. Switching to source-only downloads would save Boost $1000 per month.

## C++ Github Actions

[C++ Github Actions](https://github.com/alandefreitas/cpp-actions) is a project I created and have been maintaining since the second quarter of the year. It is a collection of reusable Github Actions for any C++ project that needs to be tested on a variety of compilers. Both MrDocs are Boost.URL are currently using these actions in their CI.

The project includes actions to:

- Generate a Github Actions Matrix for C++ projects;
- Setup C++ compilers;
- Install and setup packages;
- Clone Boost modules;
- Run complete CMake and `b2` workflows;
- Generate changelogs from conventional commits;
- Generate summaries; and
- Generate time-trace reports and flame graphs

These actions include a myriad of options and features. 

- The "setup-*" actions include logic to detect, install, and cache dependencies, which can be used by the CMake and `b2` actions. 
- Individual options and actions attempt to set up a wide variety of compilers on different platforms, including MSVC, GCC, Clang, MinGW, AppleClang, and Clang-CL. 
- Actions that generate reports include a multitude of tools and options to analyze changes, time traces, and coverage.

Since then, these actions have been adapted as needed to support the needs of MrDocs and Boost.URL, which have also been using conventional commits. Here's a recent summary report generated for Boost.URL by the CI workflow: https://github.com/boostorg/url/actions/runs/6512424067

The project documentation also uses the Antora UI template we have been maintaining for all other projects: https://alandefreitas.github.io/cpp-actions

## Gray-box local search

On 13 September 2023, the [following paper](https://link.springer.com/article/10.1007/s00500-023-09129-1) I co-authored was published:

```
Lopes, R.A., Freitas, A.R.R. 
Gray-box local search with groups of step sizes. 
Soft Computing. 
p. 1-14
2023
https://doi.org/10.1007/s00500-023-09129-1
```

The paper was accepted on 18 August 2023 and published on 13 September 2023.

While the paper is more aligned with my educational background than my daily C++ Alliance tasks, it is one more paper that carries the C++ Alliance in the affiliation, contributing to its reputation.
