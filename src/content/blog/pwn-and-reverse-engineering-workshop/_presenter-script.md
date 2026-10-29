# Presenter Script — Light Copyedit

This is a lightly cleaned copy of the original script, updated to follow the current slide order. Bracketed text is a presenter cue, not spoken text.

## Slide 1

Hello, and welcome to our workshop, **Binary Exploitation and Reverse Engineering Basics**, sponsored by Shellmates Club.

Today, we’ll talk about these two areas, explain the basics, show some real-world use cases, and walk through an example.

First, I want to thank Shellmates Club for organizing the event and preparing the environment for us.

[Add any other acknowledgements here.]

## Slide 2

Let’s start with the table of contents.

We’ll define reverse engineering, understand why it matters, and look at some real-world examples. Then we’ll cover the fundamentals and basics by walking through a simple program in reverse: starting with a program we know nothing about, breaking it down, and working toward understanding it completely.

## Slide 3

What is reverse engineering?

From the image and definition, we can see that reverse engineering is the process of examining a binary, software program, game, or mobile app with the right tools to understand how it works, even when we don’t have access to its original source code.

Most of the time, reverse engineering starts with a question.

For example, people who use an Algerian restaurant reservation system might ask, “How can I automate a reservation?” A reverse engineer can inspect the app, understand how the reservation happens, and work out how to automate it without using the app manually.

## Slide 4

Another definition is to start with a question about something we don’t understand and reverse engineer it for the purpose of answering that question.

For example, a YouTuber asked: “This TV is so powerful and technologically advanced. It has a camera, a microphone, and an AI assistant. Why is it so cheap? What is it doing that I don’t know about?”

The video’s conclusion was that the TV was collecting information and sending it to LG’s servers. The point is to investigate the question and see what the evidence shows.

## Slide 5

[Introduce the LG incident shown on the slide.]

## Slide 6

Why does reverse engineering matter?

Understanding how something works is powerful. It can help us automate tasks, find bugs and problems in software, and protect systems. It also helps us build a strong mental model for solving problems.

And it’s quite fun, too.

## Slide 7

How do you get started? Honestly, it depends on what interests you.

Reverse engineering is a fast-moving field built around asking questions and finding answers. You can reverse engineer many kinds of things.

For example, mobile reverse engineering can help you find bugs, automate tasks, or understand how apps work. Game reverse engineering can be used to study games, make cheats, and more. Some people focus on malware reverse engineering: observing its behavior and answering questions about what it does and where it came from. You can also reverse engineer desktop applications.

## Slide 8

Here we see a YouTuber whose work focuses on reverse engineering Apple apps and operating systems. They investigate how those products work and look for hidden features.

## Slide 9

Here’s another YouTuber, Nathan Baggs, who focuses on reverse engineering games. The goal isn’t always to crack a game; sometimes it’s to fix bugs.

For example, some older games don’t work on newer versions of Windows. He found that the games expected certain files to exist, but that behavior had changed in newer versions. He fixed the problem and found other examples, too.

## Slide 10

As you can see, there are many resources available in fun and accessible formats. You can choose a domain, search for blogs and articles, or look for YouTube videos. There’s a good chance you’ll find something that teaches you something new about reverse engineering.

## Slide 11

In this workshop, we’ll learn the basics through practice. We’ll focus on reverse engineering a desktop app—a binary—and look at the steps involved.

I could give the same binary to ten different people, and each person might use a different method to reach the same conclusion. The more you know, the more shortcuts you can take.

## Slide 12

**Fundamentals and Basics**

Over time, you’ll pick up these skills. The more you’re exposed to reverse engineering, the better you’ll become.

You’ll need to know which tools to use in each situation. For our program, we’ll need tools that can read a binary, extract information from it, and show us its code in a readable format.

The second fundamental is assembly language. We’ll need to understand assembly instructions because they represent the instructions the CPU runs. Programs compile to machine code, so understanding the basics of assembly gives us a starting point.

The last thing we’ll need to understand is the program environment. When you program in Python, you can import libraries that do work for you automatically. You don’t need to read every line of a library to use it.

The same idea applies to reverse engineering. You don’t need to focus on the whole binary. A lot of its contents may be libraries, files, images, or other material that isn’t relevant to your question. The program’s logic is in there too, and understanding the environment helps you avoid wasting time.

## Slide 13

Here’s our target: a program we don’t know anything about yet.

Our job is to collect as much useful information about it as possible.

## Slide 14

First, let’s ask what type of file it is. Then we’ll look for readable strings and observe its behavior.

[Go to the computer and do the live demo.]

## Slide 15

[Fill in the information from the live demo: file type, readable content, and the app’s behavior.]

## Slide 16

Now let’s use a more advanced tool to read the file’s contents. We’ll open it in ImHex, which can read the file and help us understand its format.

We can see that the file contains numbers, and some of those numbers represent code. That code is machine code, which we can examine as assembly language.

[Show ImHex.]

## Slide 17

```bash
objdump -d -M intel --no-show-raw-insn --visualize-jumps=color --disassembler-color=extended ./vault
```

Opening the file as raw data won’t tell us everything we need, so we’ll use a tool for this kind of analysis: `objdump`. It disassembles the binary and shows the assembly in a more readable format.

There’s a lot of output. This is where our understanding of the program environment comes in. We can ignore standard placeholder code and focus on the main function. We can map out the logic and look at the comparison instruction.

[Show the relevant part of the output and the answer.]

## Slide 18

To focus on the tools even more, here’s another tool that can make this process much easier: Ghidra.

## Slide 19

There’s another way to solve this challenge.

What we’ve done so far—reading the code, using Ghidra, and understanding the assembly—is called static analysis. We examine the program without running it and use the code to work out what it does.

The second method is dynamic analysis.

## Slide 20

Let’s go back to the information we collected at the beginning. We know the app has two outputs, and we know our input gets processed somehow.

If we recognize functions commonly used in C, we might guess that the program prints with `printf` and reads with `scanf`, since those are standard functions in C programs on Linux.

We can guess that the program processes and compares our input at some point. If we stop the program, inspect memory, and watch the code run, we can learn more about what it does.

Now our dynamic-analysis demo begins. We’ll use GDB.

[Start the GDB demo.]

## Slide 21

[Play the video example.]

## Slide 22

Here’s a summary of what we covered in reverse engineering.

- Q&A.

## Slide 23

Now that we’ve talked about reverse engineering, let’s move on to the second half of the workshop: binary exploitation.

Here’s the table of contents.

## Slide 24

Reverse engineering and Pwn share many of the same features and targets, but they have different goals.

**Binary exploitation is the process of finding bugs in binary programs and turning them into exploits to manipulate their behavior.**

We start with a program, find some kind of unintended behavior, and try to turn it into an exploit. The impact could include remote code execution, leaking user information, or gaining access to a system.

## Slide 25

Since Pwn mostly focuses on finding bugs, let’s understand what a bug is.

## Slide 26

For example, people found a bug in a Node.js library that could allow skilled attackers to get remote code execution on affected servers and access them. Many of us use Node.js, or may use it in the future.

This is a real bug and an example from last week.

## Slide 27

**Bug Classes**

The first foundation is reverse engineering: dynamic analysis helps us understand how programs work and how their behavior can be changed at runtime. Since the goal is to cause unintended behavior, we need to understand the program in detail.

The second foundation is tools. We need to know how to use tools to debug and investigate programs. We’ve already seen some of these tools in the reverse engineering section. Understanding tools, including AI tools, can make finding bugs easier.

## Slide 28

In binary exploitation, we don’t need to focus on the entire codebase. We can focus on common bug classes and reduce the search space.

There are many bug classes, and we don’t need to know them all at once. Which ones matter depends on the environment. For example, format-string bugs may be more common in IoT devices and older software.

Race conditions are more relevant in multithreaded applications. In a single-threaded app, there may be less reason to search for that kind of bug. The same idea applies to other bug classes: learn what to look for and when it’s relevant.

## Slide 29

For this workshop, we’ll focus on buffer overflows and see how to tackle a bug class by breaking it into steps.

## Slide 30

To study a bug class, we first need to understand the primitive data types that cause it. In this case, the name gives us a clue.

We’ll learn what a buffer is, what it’s used for, and how we can use it. Then we’ll learn what an overflow is and which memory in the program can be affected. Since the program is in memory, understanding the affected areas can help us see what we might change to affect the program’s behavior.

Then we’ll look at use cases and how researchers have used the bug. This can help us recognize where we might encounter it. For example, if a program doesn’t use buffers, there’s no point in looking for this kind of bug in it; we should consider something else.

The last step is practice. The more you read about bugs, solve them, and reproduce them, the better you’ll get.

## Slide 31

What’s a buffer?

## Slide 32

[Show the buffer graph.]

## Slide 33

What’s a buffer overflow?

## Slide 34

Now let’s understand the memory layout of a program. After we understand what a buffer is and what an overflow means—writing past the limit—we need to know where we’re writing and what kind of memory we’re writing into. That helps us understand what we can change or overwrite.

For example, in a game, we might want to find a bug that changes the score. We need to find where the buffer is, where the score is, and whether the buffer can affect it. The same idea applies to other programs: understanding the memory layout helps us reason about how a bug could be used.

The lines in the memory map represent memory regions. We can read the start address, end address, permissions, and name of each region. At the top, we can see the program’s name, `XP1`.

In the reverse engineering section, we looked at a hex editor and saw that a binary contains libraries, empty space, and other data. At runtime, the program and its dependencies are mapped into memory. We can see regions for libraries such as libc and the dynamic loader (`ld.so`). The heap is used for dynamic memory allocation and can matter for other bug classes. In this example, we’ll focus mainly on the stack and the program’s memory.

## Slide 35

Okay, now let’s work on the bug. We have this program in front of us. We’ll read it and understand what it does.

It has a `main` function and a `secret` variable set to 1234. It also has a character buffer with a size of eight, so the buffer can hold eight bytes.

The program prints the secret and asks us to enter text. It uses the `read` function to read input into the buffer. If you look closely, you can see the overflow: the buffer is eight bytes, but the program allows `read` to read up to 32 bytes. That’s the bug.

In the example shown, we entered four `A` characters. Nothing changed because four bytes fit within the eight-byte buffer. If all 32 requested bytes are read, that is 24 bytes beyond the buffer’s capacity.

Let’s look at a visualization of the program’s memory and see what we can change. First, we’ll enter more than eight bytes and then examine what’s shown.

As you can see, writing more than the buffer can hold overwrites the `secret` variable in this example. Now let’s look at the illustration to understand the overflow and how we can use it.

## Slide 36

[Show the graph and illustration.]

## Slide 37

I hope the general idea is clear. In the simple example, we overwrote a variable. It can be more complex.

For example, imagine an app with a secret variable that checks our password. If we enter the correct password, we get access to more functionality; otherwise, we don’t. If we don’t know the password, we can’t access it normally. A buffer overflow could let us overwrite the check so it works in our favor. This is one of many examples of how a buffer overflow could be used.

## Slide 38

As we understand more about memory, the buffer, and the data around it, we can learn how to manipulate the program and exploit it.

In the next workshop, we’ll look at how to change an application’s control flow so it reaches a `win` function. We’ll also look at what we can do when there isn’t a useful function to jump to. Those are ideas we’ll explore in the practical workshop.

The last step in studying a bug class is practice. The more you practice, the better you’ll get.

[Use GDB.]

## Slide 39

Let me quickly show you another bug class. We’ll speed-run it. This one is quite simple, but that doesn’t mean it never appears in real software: integer vulnerabilities.

[Show the GitLab example.]

## Slide 40

For integer vulnerabilities, check the type and range, arithmetic and conversions, and how the result is used. These details help us understand how an unexpected value can affect the program.

## Slide 41

Now let’s work through the example and see how we can investigate a real-world bug.

PHP2Shell.

## Slide 42

Now let’s look at the impact of the integer vulnerability.

## Slide 43

Q&A and a summary of the Pwn section.

## Slide 44

Resources. The course resources are here: https://al-wasmo.github.io/blog/pwn-and-reverse-engineering-workshop#resources

## Slide 45 — Build Your Online Presence

My advice is to build an online presence. Create a blog or portfolio, share what you’re learning, document your journey, and publish your projects and research.

Your blog can become part of your CV. Research labs want to see examples of your work. The more you document, the easier it is for people to understand your skills, interests, and progress.

Since you’re still learning, documenting that journey lets people see how you’re improving. Instead of only saying that you know reverse engineering or binary exploitation, you can point people to your work and let it speak for itself.

## Slide 46

[Visual transition: Shellmates Club.]

## Slide 47 — Job Market and Bug Bounty

In Algeria, opportunities to advance in this field may be limited because there is currently little interest in cybersecurity. Not many people are willing to spend time learning low-level security. With AI automating more tasks, I think even fewer people may take the time to learn these topics.

But that’s not necessarily a bad thing. These skills are in demand globally, so you aren’t limited to Algeria. You can work remotely, take part in bug bounty programs, or work in research and development.

### Bug Bounty

One opportunity is bug bounty: finding security vulnerabilities and reporting them through a program.

For example, you can look for vulnerabilities in Google software, browsers, and other products through Google’s Vulnerability Reward Programs. Companies also run their own programs for their software and libraries.

A vulnerability in a shared library could affect many products that use it. For example, if many games use the same Steam DLL, a vulnerability in that DLL could affect those games.

You don’t have to work for a company to do this kind of research. You can investigate software on your own and submit a finding through the relevant program.

## Slide 48 — Research, Teaching, and AI

### Research and Development

Another path is working in a vulnerability research lab. Researchers investigate zero-day and one-day vulnerabilities in products such as Apple and Android software and other systems. Some research labs pay well for this work.

They may research Apple and Android software, browsers, operating systems, kernels, and other low-level software. Some labs I know about: [add the names you want to mention.]

### Teaching and Courses

These skills are useful across cybersecurity. As you gain experience, you could run courses and workshops or teach more advanced topics, such as assembly language or vulnerability research. For example, you could teach assembly to the army or teach security teams how to investigate software bugs.

### AI and Your Work

In the AI era, having a strong background and proof of your work can help you stand out. AI can automate some tasks, but documenting your research and showing what you understand can give employers a clearer picture of your abilities. Focus on understanding the topics, building skills, doing research, and documenting your progress—not only collecting certificates or learning tools.

## Slide 49

Thank you for your attention!
