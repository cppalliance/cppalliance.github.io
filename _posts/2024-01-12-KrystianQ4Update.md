---
layout: post
nav-class: dark
categories: krystian
title: Krystian's Q4 Update
author-id: krystian
---

Much like the last, my primary focus this quarter was on MrDocs, with some additional work done on Boost.StaticString and clang.

## MrDocs

The last significant feature MrDocs needed in order to produce documentation on par with Docca was the ability to render overload set. At a glance this may appear trivial, but MrDocs was designed to render documentation on a per-declaration basis: each declaration would result in a single documentation section being emitted by a generator. This is problematic for overload sets, as an overload sets are not declarations. I ended implementing them as a "view" of the lookup table for a particular scope.

Besides implementing support for rendering overload sets, I further expanded the kinds of declarations supported by MrDocs to include friend declarations, deduction guides, and enumerators. Previously, enumerators were stored as a non-`Info` type, meaning they could not be found by the name lookup mechanism when referenced with `@ref`/`@copydoc`. Adding support for friend declarations also had its own set of challenges due to a lack of support by the clang USR generator. As an interim solution, I'm generating pseudo-USRs for friends by concatenating the USR of their lexical scope with the USR of the referenced declaration or type. While this is sufficient for now, it will ultimately be necessary to submit patches to clang to fix the plethora of bugs in USR generation, as well as add support for newer C++ features such as constraints.

Another problem area I addressed was the representation of qualified names for symbols that were not extracted. Previously, three different kinds of `TypeInfo` were used to represent "terminal" types (i.e. typenames): `BuiltinTypeInfo` for builtin types, `TagTypeInfo` for class and enumeration types, and `SpecializationTypeInfo` for class template specializations. These types were awkward to work with, required a non-trivial amount of boilerplate, and were incapable of representing a typename that was qualified by a nested-name-specifier that named a symbol that was not extracted. To remedy this, I created a `SymbolName` type that can represent a qualified-id naming any symbol and replaced the three terminal `TypeInfo` kinds with `NamedTypeInfo`.

## Clang

On the clang side of things, I continued work on fixing C++ conformance issues. This included diagnosing friend function specialization definitions (e.g. `friend void f<int>() { }`), diagnosing unexpanded packs in function template explicit specializations (e.g. `template<> void f<Ts>();` where `Ts` is a pack), and improving diagnostics for unexpanded packs in class/variable template partial/explicit specializations.

In terms of in-progress patches, I am currently working on a patch that will significantly improve dependent name lookup -- both in terms of conformance and diagnostics. Currently, even obviously ill-formed constructs such as:
```cpp
template<typename T>
struct A
{
    auto f()
    {
        return this->x;
    }
};
```
are not diagnosed until the template is instantiated. Although this behavior is conforming, in less contrived scenarios, it would be far better to avoid an avalanche of diagnositic messages by diagnosing this at the point of definition. This is possible primarily due to [[temp.dep.type] p6](http://eel.is/c++draft/temp.dep.type#6):

> If, for a given set of template arguments, a specialization of a template is instantiated that refers to a member of the current instantiation with a qualified name, the name is looked up in the template instantiation context.
If the result of this lookup differs from the result of name lookup in the template definition context, name lookup is ambiguous.

and [[temp.dep.type] p5](http://eel.is/c++draft/temp.dep.type#5):

> A qualified name is dependent if
> - [...]
> - its lookup context is the current instantiation and has at least one dependent base class, and qualified name lookup for the name finds nothing

This guarantees that, within the definition of a template, if the
lookup context of a qualified name is that that template:
- if lookup finds any member of the template, then the result of lookup in the instantiation context must also find that member, or
- if lookup finds nothing, then the program is ill-formed unless the name is found in a dependent base class.
