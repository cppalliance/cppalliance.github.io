---
layout: post
nav-class: dark
categories: dmitry
title: Some Thoughts on Documentation
author-id: dmitry
author-name: Dmitry Arkhipov
---

Most of my work during the first quarter of this year involved experimenting
with things which haven't yet reached the state where it would be interesting
to discuss them. But there was a project that at this point is reaching its
finish, and thus let's focus on it. That project is AsciiDoc-based
documentation for Boost.JSON.

Previously the project used a setup that was not too dissimilar to that of many
Boost libraries. Doxygen collected API reference docs from Javadocs comments in
the project sources and outputted a set of XML files, then those XML files were
converted to a Quickbook file. The file was included by the main Quickbook
documentation source, which Quickbook converted into BoostBook (a dialect of
DocBook). Finally, BoostBook XSLT stylesheets were used to transform files from
the previous step to HTML (or some other format, e.g. PDF).

At some point I got frustrated with issues with Docca, the tool we used to
convert Doxygen XML to Quickbook and wrote a Python equivalent. I wrote about
it back in [July 2025](../../../2024/07/12/dmitrys-q2-update.html). As noted there, the
new tool's design allows for changing of output formats and the resulting
structure of the API reference documentation. Specifically, AsciiDoc and
producing one page for a set of function overloads was mentioned. Well, this is
exactly what soon will be used for Boost.JSON's docs. ([Menwhile, here's
a preview](https://1080.json.prtest2.cppalliance.org/libs/json/doc/html/index.html)).

The first step of the change was of course conversion from Quickbook syntax to
AsciiDoc syntax. The next step was making the output multi-page. The default
Asciidoctor HTML backend only produces a single page. I could create multiple
source files and generate a separate page from each one, but that creates two
problems: brittle cross-references between sections and no table of contents
for the entire thing. So, instead I took an existing Asciidoctor plugin,
[asciidoctor-multipage](https://github.com/owenh000/asciidoctor-multipage/),
and using its core idea I wrote my own, as I needed somewhat different
behaviour. The core idea of the plugin is that certain sections are removed
from their parent sections and spawn separate documents.

The third step involved structuring Javadocs comments very differently.
Analysing Cpprefernce pages for overloaded functions I came to the idea that
rather than documenting every overload separately, I could put all
documentation text into the Javadocs comment of the first one, and reference
every overload by their number there. There is a catch, though. Overloads have
different parameter lists and Doxygen warns if a Javadocs comment documents
a parameter that the function doesn't have or doesn't document a parameter it
does have. I worked around that by using most of the description for the first
overload, but collecting parameter list documentation from all overloads. In
the end it came out nicely. The coolest thing about it is that I didn't have to
change anything in my Python version of Docca, everything I needed was possible
with just a custom [Jinja](https://jinja.palletsprojects.com/en/stable/)
template.

The current target for Boost.JSON's documentation pipeline is Doxygen + Python
Docca + Asciidoctor. In the future I'm aiming towards replacing Doxygen with
[Mr.Docs](https://github.com/cppalliance/mrdocs), another exciting project from
the C++ Alliance. I also hope that this change will motivate other projects
to switch to AsciiDoc.
