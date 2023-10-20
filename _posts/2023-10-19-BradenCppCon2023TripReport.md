---
layout: post
nav-class: dark
categories: braden
title: CppCon 2023 Trip Report
author-id: braden
---

CppCon 2023 was my first time attending this conference in person (instead of in my dreams), and it was everything I hoped for and more. I have spent many hours watching conference talks on YouTube, and I'm sure most of them have been from CppCon. For a professional C++ developer, it's an experience like no other. Here I'll outline my experience throughout the week.

# Talks I Loved

There are many talks happening at CppCon. Most of the time there are 4 simultaneous talks, which I've been told is less than previous years where they've had 5 at once. I wanted to attend them all, so I had to make some tough choices. I'll watch the rest of them on YouTube as they come out. Here I'll outline 3 of the talks that had an impact on me.

## "Advancing cppfront with Modern C++: Refining the Implementation of is, as, and UFCS"

Filip Sajdak gave this talk all about how he reimplemented cppfront's "is" and "as" operators. From my memory, this talk focused mainly on properly using concepts and function overload sets for implementing generic functionality. I loved it. It scratched that specific part of my brain that craves perfection in generic code. It was beautiful to see how concept subsumption allowed the implementation to be much more readable than it used to be. I especially liked the trick of using a lambda to pass a concept as a template parameter, which isn't possible in the language right now. I recommend watching once it's available.

## "C++ Modules: Getting Started Today"

This talk from Andreas Weis helped to continue fueling my interest in C++ modules. It was a nice breakdown of how modules work in terms of the build process and why modules will be a benefit to all of our code bases. Even more importantly, the talk went into detail about the various types of module files and how to use them today. I see this talk as a great resource to help people dive into the world of modules, and I can't wait to share it with my coworkers to make modules less scary. Very few of us are out here writing new code from scratch, we all need to manage older code while progressing towards the future. It's well worth watching once it's available.

## "Coping With Other People's Code"

Speaking of old code, I absolutely loved Laura Savino's talk. Thankfully this talk was a plenary, so I didn't need to make any hard choices and skip anything else. I enjoyed how Laura intertwined the stories of legacy code with the stories of home improvement. Sometimes, a $25 bandaid fix that saves you $5000 in the future is exactly the type of fix you need. We shouldn't feel ashamed that it's not the most "correct" fix, we should instead feel proud that we're able to save the $5000. This also applies to legacy code and "letting things go", instead of only settling for the most perfect solution. Sometimes there are bigger fish to fry.

I liked Laura's focus on the more human aspects of software development. Something I often say is, "we don't work *with* code, we work *on* code *with* people", and I felt this same idea in the talk. There can be more important things than work, like spending time with family. More specifically, it was refreshing to hear Laura talk about fathers taking time off work and spending time with their children. I think there's nothing more important, and I'm glad to hear this same sentiment shared in a plenary talk. This one is already [available on YouTube](https://youtu.be/qyz6sOVON68) as I'm writing this, and I highly recommend it.

# My Lightning Talk

The lightning talks, if you haven't heard of them, are rapid-fire 5 minute talks. They'll be released on YouTube as individual videos, but in real life they were back-to-back, on 2 of the nights.

I gave a lightning talk! It was one of the most exciting parts of the conference, standing up in front of a few hundred people (I assume) and giving a talk on something I'm passionate about.

I called it, "Help! My expression template type names are too long!"

My talk was about a cool trick I found that shortens the names of your types in expression template code. I've been writing a lot of expression template code over the past year and a half, and this can help me reduce my compile times, since the compiler doesn't need to copy around these massive type names internally. Unfortunately, as of the time of me writing this, I have only figured out how to get this trick to work in MSVC. It's pretty easy to do type name shortening/erasure in any of the compilers, but only for a specific type at a time, not for a generic type that comes from expression templates and overloaded operators. I hope I can figure out how to do something similar in the other big compilers as well.

This talk was especially exhilarating because I submitted it before I found the trick. On the Monday night of CppCon, I had this idea for a way to shorten my type names, and I didn't know if it worked. Armed with ignorance, I submitted my talk and then started panicking to try and make it work. I made some new connections with people during the next few days while discussing this problem. There's nothing like a good "nerd snipe" to bring us together.

If you have the opportunity to give a talk and you're on the fence about whether you should, just do it. It's a great opportunity to share something you're passionate about. I'm happy I did it!

# The Hallway Track

This is a funny term I heard while at CppCon. The conversation went something like this.

Me: "The talks are almost starting. Which one are you going to?"

Other: "I'm not sure. Right now, the hallway track is looking pretty appealing."

Me: "Hallway track?"

Other: "Yeah I met so-and-so earlier today and I wanted to keep talking to them, so we'll see."

Then it dawned on me what this person was talking about. They were referring to having conversations with other people, and cheekily calling it the "hallway track". I like that term, so I'm going to keep using it.

To me this is the most important part. All the talks can be watched later on YouTube. It's not the same, you don't get to feel the energy of the room and look around to see everyone else equally as engaged, but you still receive the talk. The real importance of CppCon is meeting other professionals in your field with the same passions. Forging connections. It's the biggest part of CppCon that's irreplaceable online.

It was nice to have face-to-face conversations about expression templates with people who know a lot about the subject. Or to have conversations about the pedantics of such-and-such language construct, or this build system, or that compiler. This isn't something I get to do every day. I like feeling a sense of broader community of being a C++ developer and enthusiast. Yes I already knew that this community exists, and yes I interact with people online, but doing it in person was completely different. The sense of community is much more immediate and tangible.

Not to mention the strange feeling of being face-to-face with people who are well known in the C++ community. I was sitting at a talk, and I suddenly realized I was sitting directly behind Bjarne Stroustrup himself. Another time, I was standing in the hallway talking with a few people, and then Jason Turner walked up and joined the conversation. Now, I don't think idolizing people is healthy in general, but it's definitely a shock to see these people in person who I've only ever watched through a screen.

# Summary

The talks were amazing, especially giving a talk of my own. Even more importantly I made some new connections and friends. Nothing beats meeting people face-to-face, it makes the sense of community feel more visceral.

This whole experience has given me a sense of belonging in the C++ world. After CppCon 2023, I feel inspired to start a local meetup to build more community. I'm thankful that I got the opportunity to attend, and I look forward to strengthening the connections I made.

![CppCon 2023 Opening](/images/posts/braden/2023-10-19-CppCon2023Opening.jpg)
