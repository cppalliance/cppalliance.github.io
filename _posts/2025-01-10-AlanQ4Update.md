---
layout: post
nav-class: dark
categories: [ alan ]
title: Alan's Q4 Update 2024
author-id: alan
---

# Summary

- [MrDocs](#mrdocs)
- [Boost Libraries](#boost-libraries)
- [Boost Release Tools](#boost-release-tools)
- [Boost Website](#boost-website)
- [C++ Github Actions](#c-github-actions)

## MrDocs

[MrDocs](https://github.com/cppalliance/mrdocs) is a tool for generating reference documentation from C++ code and
javadoc comments. I have been overseeing and reviewing all contributions to the project.
We have been using the [GitHub project](https://github.com/orgs/cppalliance/projects/2/views/1) to guide our work toward the goals defined in the Gap Analysis, the MVP, and the Product Pitch.

- **Krystian** has focused on metadata extraction and issues related to Clang.
- **Fernando** has been tackling usability, critical bugs, and essential features.
- **My role** involves enhancing the CI setup and working on Antora extensions, which will be incorporated into `website-v2-docs`.

Currently, metadata extraction primarily involves features in the Clang javadoc parser. These contributions are made to the [llvm-project](https://github.com/llvm/llvm-project) and then ported to MrDocs.

Since our last report, we have implemented many features and bug fixes in MrDocs.

Major Features and Critical Updates:

- Added support for concepts and constraints, ensuring MrDocs remains up to date with modern C++ language features.
- Enabled support for Arm64 and MacOS, enhancing cross-platform accessibility for developers and users we use Antora with the MrDocs extension on MacOS.
- Updated the compilation database to set the identified target architecture, improving precision in build and analysis tools.
- Bundled LibC++ to ensure reproducible standard library results, providing consistent outputs for critical use cases such as the Boost release tools and CI.
- Bundled LibC stubs to ensure reproducible libc results, enhancing reliability in production environments.
- Updated LLVM version to maintain compatibility with the latest development tooling.
- Unified implicit C++23 behavior across all compilation databases, regardless of original compiler, to streamline compatibility with modern C++ features.

Usability Enhancements:

- Added warnings for duplicate javadoc commands to improve debugging and provide better user feedback.
- Created generators for configuration options from JSON files, automating repetitive development tasks and keeping documentation and code always up to date.
- Added a documentation target for configuration options to enhance maintainability and provide better information to users.
- Introduced a YAML schema for configuration files so that users can validate their configuration files against the schema directly from IDEs.
- Enabled tagfile generation in Doxygen format to improve interoperability with Doxygen workflows and allow symbols to be linked in Antora documentation with the tagfiles extension.
- Categorized info extraction modes (regular, dependency, see-below, or implementation-defined) for Corpus metadata.

Key Documentation and Presentation Improvements:

- Included HTML demos to showcase MrDocs' capabilities directly to users.
- Added demo tables in documentation to make feature demonstrations clearer and more accessible.
- Automated content creation by introducing generators for Info types from JSON files. The types in code and documentation are now always in sync.
- Unified and synchronized Asciidoc and HTML templates to ensure consistent documentation formatting across outputs.

Enhancements for Developers and Automation:

- Implemented tests for all MrDocs releases, improving confidence in updates.
- Automated the generation of LLVM release binaries for www.mrdocs.com, simplifying updates.
- Improved logic for temporary directories instead of always relying on the cache directory.
- Added coverage workflows to improve code quality assurance.

Advanced Handlebar and Template Features

- Unified and simplified handlebars generators to streamline template maintenance.
- Added support for recursive partial blocks in handlebars to allow these patterns in partials.
- Introduced an option for embedded handlebars. This is similar to the Asciidoc option and is used by the website, which only embeds the HTML output.
- Ensured universal Asciidoc escaping to handle special characters effectively across templates.
- Optimized processing by rendering all templates directly to the output streams.
- Improved rendering efficiency by preprocessing template layouts and partials.
- Tailored outputs with a custom escape function for different handlebars targets.
- Enhanced handling of symbols with a regular symbol partial for overloads.

Useful Improvements

- Added support for `CMAKE_ROOT` to specify the root the CMake installation used to generate the compilation database.
- Improved navigability with overload folding on a single page.
- Optimized resource handling by supporting lazy objects and arrays in handlebars values representing the corpus.
- Reduced redundancy in template management by unifying all handlebars helper partials for Adoc and HTML.
- Improved portability of generated output by relativizing paths in generator outputs.
- Enhanced documentation support for exceptions with support for resolved symbols in @throws tags.
- Improved clarity in documentation by supporting parameter and template parameter directions in/out/inout.
- Avoid conflicts in the adjusted MrDocs database with implicit language identification (C or C++) when necessary and appropriate implicit `stdlib` tags for each.

Specialized Features

- Enhanced flexibility in file and symbol filters by adding support for glob patterns.
- Introduced doxygen-like filters that replicate all file and symbol filters available in Doxygen.
- Support for inline styled text in javadoc paragraphs.
- Improved cross-referencing in documentation with javadoc reference resolution to alternative scope URLs when symbols lack pages.
- Streamlined template design by unifying symbol partials.
- Modular ASTVisitor and unified traverse function, avoiding bugs and duplicated code.
- Extraction of attribute lists and corresponding templates.
- Added support for anonymous unions to handle specialized C++ constructs.

Miscellaneous

- Merged function parameter names to enhance usability and maintain consistency.
- Added Asciidoctor and HTML output tests to ensure the accuracy of templates.
- Improved user customization with the introduction of the `__MRDOCS__` macro.

Besides these new features, ~210 bug fixes and improvements have been made to MrDocs since the last report. 

### Integrations

We continue to use Boost.URL as a testbed for MrDocs features. Boost.URL has already been using Antora and MrDocs for documentation for two Boost releases. Boost.Unordered is now in the process of migrating to Antora. 

### Responsibilities

Overall, my responsibilities in MrDocs include:

- Setting up and maintaining CI for the project;
- MrDocs and LLVM release binaries;
- Build scripts;
- Setting up and integrating dependencies;
- Setting up and deploying the Antora toolchains and documentation to the project website;
- Working on supporting libraries;
- Supervising and reviewing the work done by other contributors (Krystian and Fernando); and
- Fixing bugs.

## Boost Libraries

The Boost library I've dedicated the most time to is Boost.URL. The library is in maintenance mode, but there is a constant demand for bug fixes and documentation improvements. Recent commits focus mostly keeping CI up to date and on the Antora+MrDocs workflow. We also implemented fixes that were necessary due to changes in other Boost libraries. Boost.URL introduced ~54 changes related to Antora+MrDocs, CI, and bug fixes since the last report.

## Boost Release Tools

I have integrated the toolchains I developed into the Boost Release Tools, adding support for features desired for the new Boost website, including the Antora+MrDocs workflow.

Since the last report, we've improved the process for the MrDocs Antora extension to find Boost dependencies.

## Boost Website

Among support projects for the new Boost website, I have been particularly involved
with [`website-v2-docs`](https://github.com/boostorg/website-v2-docs), which includes the Boost website documentation as
an Antora project. Its components cover the "User Guide," "Contributor Guide," and "Formal Review" sections.

Since the project's inception, I have been overseeing and reviewing contributions from other team members. Since the last report, my contributions were:

- We updated the Antora UI bundle to resemble the current Boost website style. 
- Multiple updates to the Antora extensions
- Multiple updates to the Antora workflow
- A new Antora section in the contributor guide
- Extensions were moved to the cppalliance GitHub organization
- Support for the BoostLook project in the Antora UI build workflow
- Keeping CI up to date
- `page-toc` and `remove-nav` options with automatic TOC generation
- Refactoring all gulp tasks and scripts
- New gulp tasks for linting and formatting
- Including pagination with parent pages

## C++ Github Actions

[C++ Github Actions](https://github.com/alandefreitas/cpp-actions) is a project I have maintained since 2023. It is a
collection of composable, independent, and reusable GitHub Actions for any C++ project needing testing on various compilers and environments.

MrDocs, Boost.URL, Boost.HTTP, and Boost.Buffers currently use these actions in their CI. These projects provide valuable feedback to improve the actions.

The project includes actions to:

- Generate a Github Actions Matrix for C++ projects;
- Setup C++ compilers;
- Install and setup packages;
- Clone Boost modules;
- Run complete CMake and `b2` workflows;
- Generate changelogs from conventional commits;
- Generate summaries; and
- Generate time-trace reports and flame graphs

The actions are designed to be modular and interoperable. Each action has a specific role, such as configuring an environment or building a C++ project. They can be composed to create customized CI/CD workflows.

Thus, a number of new features and fixes were added to the C++ Actions project since the last report.

- Updated compiler standards table in `cpp-matrix` to ensure compatibility with the latest compilers and improve portability across systems.
- Added support for commit tags in `create-changelog` to support proper changelog generation without conventional commits.
- Simplified options for single- and multi-config generators in `cmake-workflow` to improve configuration correctness.
- Added support for Ubuntu Noble 24.04 in `setup-clang` to keep compatibility with newer Linux distributions.
- Fixed the `cpp-matrix` workflow by marking Ubuntu Mantic as End-of-Life (EOL) to avoid potential issues with outdated dependencies.
- Introduced validation for undefined scopes in `create-changelog` to improve formatting consistency in generated changelogs.
- Added functionality to merge commit footers in `create-changelog` for more detailed and organized changelogs.
- Enhanced `cpp-matrix` with support for handlebars expressions and helpers to define custom matrix entry values.
- Improved `boost-clone` by initializing essential modules.
- Removed an empty group in `setup-clang` to declutter configurations and improve readability.
- Improved value validation in `create-changelog` footers to ensure correctness in generated metadata.
- Simplified the `flamegraph` by refactoring it into a JavaScript action to improve maintainability and efficiency.

Besides these new features, ~18 bug fixes and improvements have been made to the C++ Actions project since the last report. Most work has been done to fix issues revealed by testing the actions in new environments. Since the last report, we have also completed the process of moving all actions to javascript, which allows them to be used in any workflow without extra dependencies.
