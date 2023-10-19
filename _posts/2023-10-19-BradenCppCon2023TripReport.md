---
layout: post
nav-class: dark
categories: braden
title: CppCon 2023 Trip Report
author-id: braden
---

CppCon 2023 was my first time attending this conference in person (instead of in my dreams), and it was everything I was hoping for and more. I have spent many, many hours watching conference talks on YouTube, and I'm sure most of them have been from CppCon. For a professional C++ developer, it's an experience like no other. Here I'll briefly outline my experience throughout the week.

# Some of the main talks

There are a lot of talks happening at CppCon. Most of the time there are 4 simultaneous talks, which I've been told is less than previous years. In the past they've had 5 at once. I wanted to attend them all, so I had to make some tough choices. I'll watch the rest of them on YouTube as they come out. For now, I'll outline 3 of the talks that had an impact on me.

Disclaimer: These are all my own opinions, and I did not consult with the speakers before mentioning their talks here. I mention them because I liked them, and hopefully someone reading this will like them too.

Filip Sajdak gave a talk all about how he reimplemented cppfront's "is" and "as" operators, titled "Advancing cppfront with Modern C++: Refining the Implementation of is, as, and UFCS". From my memory, this talk focused mainly on properly using concepts and function overload sets for implementing generic functionality. I loved this talk. It scratched that specific part of my brain that craves perfection in generic code. Frankly, it was beautiful to see how concept subsumption allowed the implementation to be much more readable than it used to be. I especially liked the trick of using a lambda to pass a concept as a template parameter, which isn't possible in the language right now. All in all, a great talk. I highly recommend watching once it's available.

The talk titled "C++ Modules: Getting Started Today" from Andreas Weis helped to continue fueling my interest in C++ modules. It was a nice breakdown of how modules work in terms of the build process and why modules will be a benefit to all of our code bases. Even more importantly in my opinion, the talk went into detail about the various types of module files and how to use them today. I see this talk as a great resource to help people dive into the world of modules, and I can't wait to share it with my coworkers to make modules less scary. Very few of us are out here writing new code completely from scratch, we all need to manage older code while progressing towards the future.

Speaking of old code, I absolutely loved Laura Savino's talk titled "Coping With Other People's Code". Thankfully this talk was a plenary, so I didn't need to make any hard choices and skip anything else. I enjoyed how Laura intertwined the stories of legacy code with the stories of home improvement. Sometimes, a $25 bandaid fix that saves you $5000 in the future is exactly the type of fix you need. We shouldn't feel ashamed that it's not the most "correct" fix, we should instead feel proud that we're able to save the $5000. This also applies to legacy code and "letting things go", instead of only settling for the most perfect solution. Sometimes there are bigger fish to fry.

I liked Laura's focus on the more "human" aspects of software development. Something I often say is, "we don't work *with* code, we work *on* code *with* people", and I felt this same idea in the talk. There can be more important things than work, like spending time with family. More specifically, it was refreshing to hear Laura talk about fathers taking time off work and spending time with their children. I think there's nothing more important, and I'm glad to hear this same sentiment shared in a plenary talk. This one is already available on YouTube as I'm writing this, and I highly recommend it. (https://youtu.be/qyz6sOVON68)

# My lightning talk

The lightning talks, if you haven't heard of them, are rapid-fire 5 minute talks that happened on the Wednesday and Thursday evening. There were 15 of them per night. They'll be released on YouTube as individual videos, but in real life they were back-to-back.

I gave a lightning talk! That's why I'm mentioning it here. It was one of the most exciting parts of the conference, standing up in front of a few hundred people (I assume) and giving a talk on something I'm passionate about.

My talk was about a cool trick I found that shortens the names of your types in expression template code. I've been writing a lot of expression template code over the past year and a half, and this trick has helped me reduce my compile times, since the compiler doesn't need to copy around these massive type names internally. Unfortunately, as of the time of me writing this, I have only figured out how to get this trick to work in MSVC. It's pretty easy to do type name shortening/erasure in any of the compilers, but only for a specific type at a time, not for a generic type that comes from expression templates and overloaded operators. I hope I can figure out how to do something similar in the other big compilers as well.

This talk was especially exhilarating because I submitted it before I found the trick. On the Monday night of CppCon, I had this idea for a way to shorten my type names, and I didn't know if it worked. Armed with complete ignorance, I submitted my talk and then started panicking to try and get it to work. I made some new connections with people during the next few days while discussing this problem. There's nothing like a good "nerd snipe" to bring us together.

In my opinion, if you have the opportunity to give a talk and you're on the fence about whether or not you should, just do it. It's a great opportunity to share something you're passionate about. I'm happy that I did it!

# The "hallway track"

This is a funny term I heard while at CppCon. The conversation went something like this.

Me: "The talks are almost starting. Which one are you going to?"

Other: "I'm not sure. Right now, the hallway track is looking pretty appealing."

Me: "Hallway track?"

Other: "Yeah I met so-and-so earlier today and I wanted to keep talking to them, so we'll see."

Then it dawned on me what this person was talking about. They were referring to having conversations with other people, and cheekily calling it the "hallway track". I like that term, so I'm going to keep using it.

To me, this is the most important part of the conference. All the talks can be watched later on YouTube. It's not exactly the same, you don't get to feel the energy of the room and look around and see everyone else equally as engaged in the topic, but it's pretty similar. The real importance of CppCon is meeting other professionals in the field with the same passions. Forging connections. It's the biggest part of CppCon that's irreplaceable.

It was nice to have face-to-face conversations about expression templates with people who know a lot about the subject. Or to have conversations about the pedantics of such-and-such language construct, or this build system, or that compiler. This isn't something I get to do every day. I like feeling a sense of broader community of being a C++ developer and enthusiast. Yes I already knew that this community exists, and yes I interact with people online, but doing it in person was completely different. The sense of community feels much more visceral and less abstract.

Not to mention the strange feeling of being face-to-face with people who are well known in the C++ community. I was sitting at a talk, and I suddenly realized I was sitting directly behind Bjarne Stroustrup himself. I was standing in the hallway and talking with a few people, and then Jason Turner walked up and joined the conversation. Now, I don't think idolizing people is healthy in general, but it's definitely a shock to see these people in person who I've only ever watched through a screen.

This whole experience has given me a sense of belonging in the wider C++ community. I'm thankful that I got the opportunity to attend CppCon 2023, and I look forward to strengthening the connections I made and building more in the future.
