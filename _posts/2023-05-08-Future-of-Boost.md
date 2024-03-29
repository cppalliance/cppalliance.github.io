---
layout: post
nav-class: dark
categories: Boost
author-id: vinnie
title: The Future of Boost
---

Greetings! I’m Vinnie Falco, Boost library author, C++ enthusiast, and the founder of The C++ Alliance, a 501(c)(3) non-profit. While some of you are enjoying the C++Now conference this week, I’d like to share some background on our organization and some history, outline a vision and goals for C++ and Boost, and solicit your feedback and support.

# How It Started

I took notice of the C++ Standards Committee (“WG21”) while I was writing Boost.Beast in 2016. Howard Hinnant, a co-workers at Ripple, taught me about writing papers and committee meetings. Beast used Boost.Asio (portable networking for C++) and I was and still am a huge fan of this network library. I learned that Asio was being proposed for standardization. There was even a “Networking TS” document: Asio was very close to becoming part of C++ officially! But the author Christopher Kohlhoff always seemed to not have the time to attend the meetings and push this proposal though.

Something which should not surprise anyone is that I despise paying taxes. In 2017, I had an idea: create a charitable organization which I can donate pre-tax income to, and then I could hire Christopher Kohlhoff as a “staff engineer” to work full time on C++ standardization, and Boost things! I would find the very best C++ people who are already doing open source work, then hire them full-time so they could focus on their open source C++ open work from home, instead of traveling to a boring job in order to make a living.

# A Few Setbacks

In 2018 I offered this opportunity to Chris and he surprisingly turned it down. He actually liked going into an office and interacting with customers and users. He explained that the evolution of Asio and his WG21 work is not bottlenecked by time. Instead, he prefers to “think deeply about things over a long period, and then write something.” Basically the opposite of my strategy, which is to write a bunch of code quickly and then throw out the bad parts.

This is a setback but I am not so easily deterred so I offered the same opportunity to Peter Dimov, an engineer of immense talent whose libraries are legendary. He also declined, explaining that taking a salary would transform a hobby into an obligation, affecting the quality and enjoyment of the work.

Now I’m thinking, well this is a disaster! We had the non-profit in operation officially since March of 2018 (the IRS approved us in September of 2019). We had the C++ language Slack workspace as of November of 2017, transitioned to a paid plan with full history. Our strategy shifted to focus on supporting the Boost Library Collection directly. We hired our first Staff Engineer, Marshall Clow, in April of 2018.

Fast forward and today we have 11 staff members. We have a great CTO/DevOps genius Sam Darwin. And we have Louis Tatta, our CEO that keeps things running smoothly and helps get the most out of every dollar donated. At some point I’ll share a complete list of everything that The C++ Alliance has done since the beginning, but that is the subject of another missive. Today I would like to talk about a vision for Boost.

# The Boost Library Collection

Long-timers know Boost’s history but for those that don’t, Beman Dawes and Robert Klarer came up with the idea of a website offering curated, high quality C++ libraries in May of 1998. They described the “Formal Review,” a social technology where a group of peers would go over a proposed library at an agreed-upon time. They could interrogate the author about the library on the mailing list, and debate things. The outcome is a collection of posts where each reviewer summarizes their critique of the library, including whether or not to “accept” the library (sometimes with conditions). The founding documenting evokes a feeling of something big:

[https://www.boost.org/users/proposal.pdf](https://www.boost.org/users/proposal.pdf)

The collection was named “Boost” and received many great contributions. The authors and reviewers were active in the standardization committee. In December of 2005, Boost.Asio was added after being developed since 2003. In September of 2011 the C++11 standard was published, containing many library components modeled closely or identically to their Boost counterparts. In my opinion, Asio’s efforts at standardization were thwarted by the growth of politics; an inevitable consequence of the bureaucratic ISO structure. 

Boost launched its own conference called BoostCon in 2007 on the heels of its success. Speakers included Scott Meyers, Dave Abrahams, Eric Niebler, Howard Hinnant, and other juggernauts of C++. A new conference called CppCon was launched in 2014 and attracted even larger crowds, as it was focused on C++ in general.

# Trouble Brewing

With the release of C++11, there were now components in Boost which were duplicated in the Standard Library. The C++ committee became more popular and valuable owing to the success of C++11, made possible in part by years of lead-up from the talented Boost engineers. The conferences turned some people into the equivalent of pop stars, appearing as staple keynote speakers.

Library writers discovered it was easier to get a proposal into the C++ standard than it was to get a library through the Formal Review process. They discovered that there was more glory to have a proposal accepted into the official C++ language, than to have their library accepted into Boost. And once their proposal became part of C++, they no longer had to “maintain their code” the way they would if their library got in Boost. A Formal Review evaluates the author somewhat in addition to the library. Because once a library is accepted, it must be maintained and evolved. When an author abandons their Boost library, the community is impoverished as the knowledge and expertise leaves with them. And someone else must take over the maintenance.

In December of 2020, Beman Dawes passed away and Boost suffered a loss which can never be replaced. Beman had an enormous impact on not just the libraries but also C++. He was in WG21 from the very beginning, chaired LWG (the “Library Working Group”) for quite some time, and achieved a long history of open source contributions.

Boost had other problems. Fewer libraries were being proposed, and it took longer to find a volunteer review manager. Mailing list volume declined steadily. At 160+ libraries, users complained that “Boost is too large.” They complained that “many of the libraries are outdated”, that “the documentation is of varying quality”, and that “Boost takes too long to compile.” They complained about the obscure build system and lack of cmake support. The archetype of “never Booster” appeared: individuals or corporations who ban the use of Boost entirely.

Beman was the closest thing resembling a leader, despite Boost being a federation of authors with each having final word over their own library. Beman would solve problems, help with the direction of things, and even “beat the bushes” when it was time for a review by reaching out to his network of contacts and soliciting their participation. Without Beman, Boost lost its leader. Boost lost its Great Founder. And no one has since filled the role.

# The C++ Alliance

At this point, a vision for what our non-profit could do crystallized. We would help C++ in general by refreshing the foundations of Boost, restoring Boost’s prominence in the community, and helping Boost become a leader once again as innovators in C++. To do this, I'll share what we feel are the problems facing Boost, and ways to address some of them. Finally I'd like you to weigh in on all of this and help figure out what is important and what successful execution might look like.

We believe Boost faces these obstacles, organized broadly by category:

### Stagnation
  * There are fewer new libraries proposed.
  * Formal reviews get less participation.
  * Review managers are typically scarce now.
  * The mailing list volume is thinning; younger folks don’t use lists.
  * There is no second order effect: new libraries rarely use Boost.

### Quality
  * Some libraries are unmaintained and create a negative user experience.
  * Users open issues, and no one replies to them.
  * Pull requests are submitted to abandoned repositories.
  * Scant financial resources for infrastructure or staff.

### Documentation
  * The quality of documentation varies greatly across libraries.
  * The rendered pages and content of some documentation looks dated.
  * Some toolchains used are obscure and unmaintained.

### Perception
  * Boost causes long compile times.
  * The libraries have too many interdependencies
  * Supporting old C++ versions is a weakness not a strength.
  * The duplication of std components is wasteful and causes friction.
  * The “Monolithic” distribution of Boost is obsolete.

### Messaging
  * The website is outdated and never receives updates.
  * Boost’s value proposition is not clear (“why use boost?”)
  * There is no clear voice countering misconceptions and irrational phobias.
  * Users receive no guidance about the future, or what is maintained.
  * The libraries have no representation at conferences.

Users have also weighed in with their thoughts on Boost:

[https://www.reddit.com/r/cpp/comments/gfowpq/why_you_dont_use_boost/]([https://www.reddit.com/r/cpp/comments/gfowpq/why_you_dont_use_boost/)

# A Plan

I love C++, supporting users, and the Boost author experience. I think these problems can be solved. But not by demanding that “everyone who maintains a Boost library must do X.” In Boost culture when you want something done you need to do it yourself, then convince the mailing list of the merits of your proposal.

As a library author and contributor, I know that whatever I do will never rise to the same level as the original act of the creation of the Boost Library Collection. But I will be satisfied if I can stoke its fires and bring them back to a roar. To this end the resources of the non-profit are directed into projects we believe will positively affect Boost:

# Website Renovation

Our vision for an updated Boost website is clean and stylish, which speaks to a large and diverse audience. This site will have a design and content that effectively communicates the value proposition of using the Boost Library Collection: that you will write better C++ code, become more productive, and achieve greater success in your career or personal projects. Features will foster participation and revisits, with content updated regularly. The library presentation is elevated with a new visual design language that evokes distinction and appeal, and credits the authors, maintainers, and contributors that bring it to life.

To achieve this vision, you have probably heard that we contracted an outside software firm to build something precisely tailored for our needs. We care too much about Boost to use an ill-fitted, off the shelf product. This website has a lot of software behind it (written in Python as part of a Django framework application) and like most software projects it is late and over budget. I’ll refrain from saying “it’ll be ready soon” and just post a link to the new site instead, hopefully in a few weeks.

I have been personally involved in the design, presentation, and execution of the features of the website, most of which have been cut from the initial release in order to speed things along. The goal is to show the library collection in a way that highlights its strengths and speaks to a desire of every C++ programmer: to find the perfect library they can add as a dependency to help complete their next project. 

The Boost website and the site documentation can be illustrated by retaining a talented digital artist to produce custom assets that are unified in style, colors, and messaging, so that the entire site feels purposeful. This artist will also provide imagery used for our social media campaigns such as the announcements we make on Twitter which some of you might have already seen

[https://twitter.com/Boost_Libraries](https://twitter.com/Boost_Libraries)

I have strived to give every tweet an image to enhance the Boost brand.

Recently an animated discussion on the mailing list took place about adding a forum which does not replace the mailing list but is integrated to work with it. Posts in the forum become posts to the mailing list, and vice versa. Users of the mailing list and users of the forum will have no idea they are interacting, even though they are. This can only be possible if we write the software ourselves, from the ground up, with exactly one constraint: the mailing list will continue to operate exactly as it does today, on an unmodified version of Mailman 3. The mailing list users stay happy, and we can attract new people who prefer a web-based interface.

The C++ Alliance prioritizes its allocation of resources to ensure not only the website’s completion, but also dedicated staff for ongoing maintenance and improvement. The Boost website will rise over time to the same level of quality expected of every Boost library. Community members should feel free to open issues on the website repository with bugs or features, knowing that every issue will be looked at, triaged, and addressed appropriately.

# Documentation Improvement

Our vision for documentation is to ensure that every Boost library has the option to adopt a well-maintained toolchain that is easily deployed, produces high-quality output befitting the Boost brand, is itself well-documented and easy to use, and has behind it full-time staff working continuously to make improvements and provide technical support.

After researching the domain extensively (by just asking Peter Dimov) we have discovered that the markdown format Asciidoc is a very popular format with a simple and well maintained toolchain. Several regularly active Boost authors have already switched their libraries to using Asciidoctor. The authors of the Asciidoctor tool are also the authors of “Antora,” a modular, multi-repository documentation site generator:

[https://docs.antora.org/antora/latest/](https://docs.antora.org/antora/latest/)

We have built a new, modern set of additional scripts capable of building the Boost release and documentation, including the capability of rendering “Antora-enabled Boost library repositories” using this Antora system. The results are beautiful and modern, and the Asciidoctor / Antora toolchain holds the promise of being popular and well-maintained for a long time. The use of Asciidoc or Antora is optional; this is just an additional choice.

Peter Turcan is our full-time Senior Technical Writer who is modernizing the instructions for users, maintainers, contributors, and formal review participants. You can see Peter’s work along with the quality of Antora’s output here (note that the user-interface is stock and will be restyled soon):

[https://docs.cppalliance.org/](https://docs.cppalliance.org/)

The website above has a new full-text search feature (try it!). We are investing in a  search experience which includes the site docs, library docs, library references, and even the public header files. We are also investing in the deployment of a large language model (ChatGPT-style AI) trained in Boost and C++ specifics to answer questions for users. We have a new talented and eager staff engineer working full-time exclusively on this, and I don’t want to steal his thunder so I will let him explain further soon.

Some Boost libraries currently generate their documentation reference pages using Doxygen combined with other obscure tools such as xsltproc or Saxon-HE to render into Boost Quickbook, an obsolete form of markdown which only we use. This Quickbook is rendered into BoostBook, which is a flavor of DocBook. The BoostBook is converted into HTML by a DocBook renderer. This rapidly obsolescing toolchain is painful to work with and is a form of technical debt which costs us.

I have begun work on a new command-line tool called MrDox (“mister docs”) which uses the unstable clang libtooling API to extract the documentation comments and declarations from C++ programs, and turn them into beautiful Asciidoc reference pages. You can see that work here:

[https://github.com/cppalliance/mrdox](https://github.com/cppalliance/mrdox)

The core principles of the design of MrDox is to always understand the very latest C++ constructs and extract them with high fidelity. For example it recognizes conditional noexcept, constexpr, deduction guides, all attributes, and many other things that other documentation toolchains cannot fathom. In a nutshell I intend to bring the same level of Boost quality to the documentation toolchain that Boost has brought to the C++ libraries themselves.

MrDox intends to completely replace Doxygen, xsltproc, Saxon-HE, Quickbook, Boostbook, and Docbook, as the only requirement to render its results is to run the Asciidoctor tool, which has no other dependencies. This toolchain offers modernization and simplification for anyone who opts-in to it, which reduces long-term risks and improves results. This unfortunately delays the development of my other libraries, but enhancements in the documentation toolchain are a force multiplier; many Boost libraries can benefit.

# Continuous Integration

Our vision for continuous integration is to bring the most talented individuals together and combine that with state of the art technology and resources to ensure that every library has at its disposal, access to robust cloud services for continuous integration. These services are the lifeblood of maintaining and communicating the quality of a library. We aim to provide dedicated staff and technical support to fortify Boost in the ever-shifting landscape of free CI services for open source projects.

The infrastructures providing our continuous integration services are the lifeblood of maintaining the high quality of the Boost collection. Library authors test against many versions of C++ and many different compiler versions. And we have many libraries; over 160 of them which all compete for the finite public resources offered by GitHub through GHA, through Azure Pipelines, or Appveyor.

When Travis discontinued its free service, our CTO Sam Darwin deployed Drone ([https://www.drone.io/](https://www.drone.io/)) instances and offered every Boost library a pull request which compiles and runs their tests on our new infrastructure. Although this service is still active and offered today, we are not content to leave it at that. CI services are volatile over time. Some come, some go, and some become overloaded which is the current situation with the public GitHub Actions runners during peak times. The Boost organization GitHub account has over one hundred and sixty libraries each submitting sometimes enormous numbers of jobs which take multiple hours to complete.

Although the GHA environment resources are subjected to recurring oversubscription, we feel that it offers the best framework for composable actions and flexibility. Sam is exploring the possibility of having self-hosted C++ Alliance runners dedicated only to Boost jobs during peak times. Ensuring high availability of CI resources is an ongoing project for us, and we are always evaluating existing and new solutions to provide the best-of-class choices for libraries.

# Library Enhancements

Our vision for the libraries themselves is to preserve unchanged the amazing social technologies invented by the Boost founders which include the Formal Review process, the Release Schedule, the mailing list discussions, and the federated library ownership model. We want to ensure that no library is unmaintained and that every opened issue receives a response. We want the community to respect and admire the formal review process and participate with eagerness not only as reviewers but also as volunteer review managers and participants in the sometimes-heated list discussions. Library membership in the Boost library collection should be seen as the highest level of honor and recognition of effort.

The C++ Alliance has ongoing direct investments in improving existing Boost libraries and writing new ones to be submitted for formal review. Many folks are already aware of the optimization efforts being applied to the Boost.Unordered library, whose plan was written up by Peter Dimov. Joaquín M López Muñoz is providing his mathematical expertise and container experience, while Christian Mazakas (one of our full-time staff engineers) is writing the implementation, tests, and documentation according to specification.

People following Boost.Math might recognize Matt Borland as a regular contributor. He has joined us as a staff engineer and is currently working on a new library to be proposed for Boost: charconv, which is a C++11 port of the eponymous C++17 feature. This library will help libraries and users who may not have access to C++17 enjoy the same features through Boost instead.

# Messaging and Direction

Our vision for Boost includes clear messaging to inform the public on the status of the libraries, the challenges we are facing, and what our future direction might be. We believe in robust two-way communication between library authors and maintainers, and the stakeholders which are largely the people and companies which use the Boost libraries. We believe in having a social media presence that helps convey the prestige and status that comes with the quality Boost libraries offer.

Currently we have only anecdotal evidence of Boost’s adoption (or lack thereof) in various companies and projects. We only hear from the people who complain or open issues, or post to the mailing list. We do not have a concise list of companies using Boost, when new companies adopt Boost, or when companies stop using Boost. We do not have feedback from stakeholders about which Boost libraries they rely on the most, what they would like to see in future versions, or in some cases even if they are having problems with a library or its documentation.

The decentralized model of Boost library development works great for the problems it tries to solve but offers no overall directional guidance for Boost. Today the C++ language is facing unprecedented challenges: the popularity of Rust, the demands for “memory safety”, the rise of Artificial Intelligence capable of writing software independently, and possibility that the bureaucratic structure of WG21 renders it incapable of meeting these challenges in a lively or effective manner.

We believe that Boost can offer the greatest value by focusing in the areas where C++ is strong and without meaningful competition. These include space exploration, game development, high-performance computing, embedded systems, the Internet of Things, robotics and industrial process control, financial services, computer vision and graphics, scientific simulation, and more.

Furthermore the stunning and continued lack of networking in the standard library creates an opportunity for Boost to offer full-stack solutions in areas that speak to the strengths of C++. This is made possible because Boost already offers portable networking through Asio, HTTP and Websocket through Beast, excellent JSON parsing and serialization tailored for network programs, URLs, and more recently a Redis client (Boost.Aedis) and even a MySQL / MariaDB client. We intend to sponsor the development of non-Boost, open source applications and services that target specific underserved markets that would benefit from C++ solutions which use the excellent libraries that exist in Boost.

# Where Do You Fit In?

Our vision, our activity, and our deployed solutions are all “opt-in.” No one controls Boost or its libraries. Change is only possible with consensus of the folks that matter: authors, maintainers, and release managers. If Robert Ramey wants to keep his documentation in hand-written HTML that is entirely his choice; no one dictates what libraries do. We can only offer choices, and hope they will be seen as valuable.

This has been a long read, and I appreciate your investment of time. How do you feel about this vision? What would you change, or add, and what needs work? We welcome feedback, and value the volunteers who share our vision and help us execute it.

I invite you to stay tuned for more great news, coming soon!

Respectfully Yours

Vinnie Falco
