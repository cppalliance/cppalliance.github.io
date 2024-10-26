---
layout: post
nav-class: dark
categories: dmitry
title: How to Get More Utility from the Debugger in CI
author-id: dmitry
author-name: Dmitry Arkhipov
---

While some of my work in the third quarter of this year was dedicated to more
work on Boost.JSON and Docca, the most interesting thing was definitely
[pretty_printers](https://github.com/cppalliance/pretty_printers), a collection
of utilities and build scripts which help dealing with debugger pretty printers
and visualisers. Although currently it only supports
[GDB](https://www.sourceware.org/gdb/), I'm planning to research
[LLDB](https://lldb.llvm.org/) and
[Natvis](https://learn.microsoft.com/en-us/visualstudio/debugger/create-custom-views-of-native-objects?view=vs-2022)
integration too.

The module naturally emerged from my work on GDB pretty printers for
Boost.JSON. Even if you don't know what pretty printers are, you can probably
guess just by their name: they are helpers that tell the debugger how to output
objects of a particular type. These days standard libraries come with such
helpers, and so when we try printing a container, we get useful information
instead of unintelligible gibberish. If we provide similar helpers for our
libraries we can significantly improve debugging experience for our users.

But writing the helpers is only one half of the task. The other half is getting
the debugger to actually load them. Let's look at the options GDB provides us
for this.

1. The user can manually load an extension that contains our helpers from the
   initialisation file.
2. The debugger can automatically load the extension that matches the name of a
   binary that it loads (either a program or a shared library).
3. The debugger can load the extension from a special section in the loaded
   binary itself.

Option 1 is the most straightforward, and is also the least exciting. Option 2
is actually the one standard libraries go for. But there is a fundamental
problem with it: it doesn't work for static libraries let alone header-only
ones. A static library is never a binary loaded by the debugger, and the
extension file name has to match the name of a loaded binary. Header-only
libraries don't have a corresponding binary at all. The reason it works so well
for standard libraries is that people very rarely link to them statically when
they are actually working on their code, which is when they use a debugger.

This leaves option 3: putting the extension into the binary. GDB documentation
[explains how to do it](https://sourceware.org/gdb/current/onlinedocs/gdb.html/dotdebug_005fgdb_005fscripts-section.html).
The catch is that the extension file needs to be preprocessed to effectively
become an assembler command. This can be automated, though. In August Niall
Douglas [posted on the Boost developers' mailing list](https://lists.boost.org/Archives/boost/2024/08/257480.php)
about his and Braden Ganetsky's work on a script that does such preprocessing
of a GDB extension file for his library. At that point I have experimented a
little bit with such embedding and concluded that this is as good as it gets
with pretty printers deployment. So, the first component of `pretty_printers`
is a script that takes a GDB Python extension file and produces a C file
suitable for embedding into a binary.

But that's not all. In the same mailing list post Niall mentions that the
reason Braden has collaborated with him was bugs he found in the embedding.
This leads us to testing. Boost.JSON is quite rigorously tested. This has been
made possible largely thanks to the C++ Alliance Drone instance. After I
initially wrote GDB pretty printers for Boost.JSON I immediately started
looking for a way to test them. The aforementioned mailing list post shows that
my concern wasn't a purely theoretical one.

After some research I discovered that with certain flags GDB can be run as a
Python interpreter. Hence my original idea for testing pretty printers: a C++
program that sets up objects to print, and an accompanying Python script that
tells GDB where to set breakpoints and what expressions to print, and compares
the output with the expected strings. But I realised that keeping the two files
in sync becomes rather unwieldy very quickly. That led to take 2: put the tests
in the comments of the C++ test program, and generate a corresponding Python
script from it. Not only it resulted in the tests immediately following the
lines creating the objects used in those tests, it also allowed the support for
putting tests in functions, loops, and spreading them across multiple files.
The utility that generates such Python script is the second component of
`pretty_printers`.

This concludes the story of the two utilities contained in `pretty_printers`.
The other important component of this module is the support for CMake and B2
build systems. The support doesn't simply include some boilerplate. The testing
function also tells GDB to whitelist the directory where the tested binary is
located, so that the extensions are loaded. Otherwise the user would have to do
it manually, which is particularly annoying in CI.

After I finished the work on the module, I decided that other libraries could
benefit from it. It was suggested to me that I should submit the module for
review to the Boost community. Previously there hasn't been any Boost tool
reviews, but the Boost community was positive to the idea. I find this to be
a very exciting development.

Another exciting idea I had is to research other potential debugger helpers,
unrelated to pretty printing and visualisation. For example, GDB allows
extensions to register custom commands. There's also the possibility of
orchestrating GDB to analyse a specific situation. E.g. put a breakpoint on
this line, but only after another line was hit. While locally this is easily
done manually, such functionality can be useful when the error only manifests
on a platform you only have access to in CI. Such ideas hint that
`pretty_printers` is a misnomer, and the module should be called something
different. Maybe `debugger_utils`?
