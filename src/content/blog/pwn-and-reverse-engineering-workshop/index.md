---
title: "Reverse Engineering and Binary Exploitation Basics"
description: "Workshop slides, interactive illustrations, Pwndbg walkthroughs of beginner pwn challenges, and starter resources for reverse engineering and binary exploitation."
date: 2026-10-29
draft: false
image: ./assets/banner.png
authors:
  - t4k1
tags:
  - reverse-engineering
  - pwn
  - workshop
---

## TL;DR

I was invited to lead a workshop on pwn and reverse engineering for complete beginners, to help them prepare for the BSides CTF and explore the world of cybersecurity.

This post contains the slides I used, along with the illustrations and resources I shared during the workshop.

The goal wasn’t to teach these complex topics in depth. I wanted to plant a seed of motivation and give attendees a clearer picture of pwn and reverse engineering. I’m not sure I succeeded ;D.


## Workshop Slides

<workshop-slides></workshop-slides>

## Explanatory Illustrations

<details data-illustration name="course-illustrations">
<summary>

### Process Memory Map

</summary>

<process-memory-map>
  <p>Explore exp1's executable code, read-only content, writable data, and the stack. Enable JavaScript to highlight each region in the memory map.</p>
</process-memory-map>

</details>

<details data-illustration name="course-illustrations">
<summary>

### Reverse Engineering Process

</summary>

<reverse-engineering-process>
  <p>Follow one unknown program from file identification through strings, assembly, and Ghidra, then compare static analysis with running it in GDB.</p>
</reverse-engineering-process>

</details>

<details data-illustration name="course-illustrations">
<summary>

### Buffers

</summary>

<c-buffer>
  <p>A buffer occupies consecutive bytes within memory. Choose int or string to see its layout, with surrounding memory before and after it.</p>
</c-buffer>

</details>

<details data-illustration name="course-illustrations">
<summary>

### Buffer Overflow

</summary>

<overflow-walkthrough>
  <p>Step from four input bytes to a full eight-byte buffer, then watch more input cross into the next memory region.</p>
</overflow-walkthrough>

</details>

<details data-illustration name="course-illustrations">
<summary>

### Overwriting a Secret

</summary>

<secret-overwrite>
  <p>Explore a theoretical stack layout using the workshop challenge’s eight-byte buffer and target secret value of 1234.</p>
</secret-overwrite>

</details>

<details data-illustration name="course-illustrations">
<summary>

### Integer Vulnerability

</summary>

<integer-vulnerability>
  <p>Follow the workshop’s 999 + 1 example through a three-digit value’s range and wraparound result.</p>
</integer-vulnerability>

</details>

<details data-illustration name="course-illustrations">
<summary>

### Function Calls

</summary>

<function-calls>
  <p>Step through pushing arguments, calling add, saving the return address, executing the function, and returning to the caller.</p>
</function-calls>

</details>

<details data-illustration name="course-illustrations">
<summary>

### Push & Pop

</summary>

<stack-push-pop>
  <p>Enable JavaScript to explore the interactive stack illustration.</p>
</stack-push-pop>

</details>

<details data-illustration name="course-illustrations">
<summary>

### Overflow Sandbox

</summary>

<buffer-overflow>
  <p>Try the configurable integer and string overflow examples with different capacities and memory layouts.</p>
</buffer-overflow>

</details>

## Challenge Walkthroughs

Step through four Pwn workshop binaries with Pwndbg: inspect the challenge, map the relevant memory, build the input, and verify the result.

<details data-illustration name="pwn-challenge-walkthroughs">
<summary>

### B0F1 Local Variable

</summary>

<local-variable-solve>
  <p>Use Pwndbg to inspect the stack frame and overwrite the local secret in the B0F1 challenge.</p>
</local-variable-solve>

</details>

<details data-illustration name="pwn-challenge-walkthroughs">
<summary>

### B0F2 Global Variable

</summary>

<global-variable-solve>
  <p>Use Pwndbg to locate the global buffer and secret in writable program memory, then follow the input through the overwrite.</p>
</global-variable-solve>

</details>

<details data-illustration name="pwn-challenge-walkthroughs">
<summary>

### B0F3 Ret2Win

</summary>

<ret2win-solve>
  <p>Use Pwndbg to check protections, measure the saved return address offset, find win(), and verify control flow.</p>
</ret2win-solve>

</details>

<details data-illustration name="pwn-challenge-walkthroughs">
<summary>

### B0F5 Canary

</summary>

<canary-solve>
  <p>Inspect the leaked canary, follow the stack check on a mismatch, then preserve the guard to return to win().</p>
</canary-solve>

</details>

## Resources

### Reverse Engineering Starter Pack

1. [OpenSecurityTraining2](https://ost2.fyi/) — Learn assembly, CPU architecture, memory, and debugging.
2. [pwn.college](https://pwn.college/) — Hands-on reverse engineering and program analysis.
3. [picoCTF](https://picoctf.org/) — Beginner-friendly reversing challenges.
4. [Crackmes.one](https://crackmes.one/) — Practice reversing real binaries, from easy to advanced.
5. [Malware Unicorn RE101](https://malwareunicorn.org/workshops/re101) — Practical introduction to reverse engineering with debuggers and disassemblers.

**Next level:** [FLARE-ON](https://flare-on.com/) · [Reversing.kr](https://reversing.kr/) · [Challenges.re](https://challenges.re/)

### Binary Exploitation (Pwn) Starter Pack

1. [OpenSecurityTraining2](https://ost2.fyi/) — Understand assembly, stack, registers, and memory.
2. [pwn.college](https://pwn.college/) — Structured binary exploitation lessons and challenges.
3. [picoCTF](https://picoctf.org/) — Easy Pwn challenges for beginners.
4. [Nightmare](https://guyinatuxedo.github.io/) — Binary exploitation tutorials with guided challenges.
5. [ROP Emporium](https://ropemporium.com/) — Learn stack exploitation and return-oriented programming.

**Next level:** [ir0nstone Notes](https://ir0nstone.gitbook.io/notes/) · [CryptoCat](https://www.youtube.com/@_CryptoCat) · [pwnable.kr](https://pwnable.kr/) · [how2heap](https://github.com/shellphish/how2heap)
