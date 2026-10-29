<details data-illustration data-slide="1" name="course-illustrations">
<summary>

## Slide 1: Welcome

</summary>

<div class="illustration-body">

Hello, and welcome to our **Pwn and Reverse Engineering Workshop**!

First of all, thank you for joining us this morning and taking the time to learn something new. I hope we all learn something from today's workshop.

I'd also like to thank **Shellmates Club** for organizing the workshop and handling the promotion and setup for us.

</div>
</details>

<!-- Slide 2 is intentionally omitted. Presenter notes are in _slide-02-presenters.md. -->

<details data-illustration data-slide="3" name="course-illustrations">
<summary>

## Slide 3: What to Expect

</summary>

<div class="illustration-body">

This workshop covers the basics you need to get started with **reverse engineering** and **binary exploitation**, also called **pwn**.

We won't have time to explore every topic in depth. The first part will focus on the theory, with a few examples to show how the ideas work.

To get the most out of the workshop, listen closely and ask questions whenever something is unclear. You don't have to wait until the end.

### The Plan

We'll start with **90 minutes of theory**:

| Topic | Time |
| --- | --- |
| Reverse engineering basics and examples | 40 minutes |
| Binary exploitation basics and examples | 40 minutes |
| Questions, spread throughout both sections | 5 minutes |
| Learning resources and upcoming workshops | 5 minutes |

The final five minutes will include QR codes for further learning resources and more workshops organized for you.

After that, we'll spend **about 90 minutes practicing**. We'll solve beginner-friendly challenges and apply what we learned in the theory session.

I'll ask you questions during the practical session, too. So if something doesn't make sense, ask me before I ask you! :)

</div>
</details>

<details data-illustration data-slide="4" name="course-illustrations">
<summary>

## Slide 4: What Is Reverse Engineering?

</summary>

<div class="illustration-body">

Let's start with **reverse engineering**, or **RE**.

Reverse engineering is the process of studying an application to understand how it works without having its original source code or design.

Imagine a program that asks you for a secret number. You can run it and see whether your guess is correct, but you can't see the code that checks it.

As a reverser, you work backward:

1. Observe what the program does.
2. Find where it reads and checks your input.
3. Study that check to understand the rule.
4. Use what you learned to predict which input it will accept.

The goal is to explain **how and why the program behaves the way it does**.

</div>
</details>

<details data-illustration data-slide="5" name="course-illustrations">
<summary>

## Slide 5: What Can We Reverse?

</summary>

<div class="illustration-body">

The same process applies to different kinds of software. Here are a few examples.

### A Mobile Application

Suppose we want to automate a repetitive action in a test application. We can observe what happens when we press a button, inspect the code behind that action, and identify the inputs and requests involved.

**Question:** What does the application do when I press this button?

### A Desktop Application

A practice application asks for a license key. We can find the success and failure messages, trace the code that reaches them, and work out how the application checks a key. This is the idea behind a **crackme** challenge.

**Question:** What makes the application accept or reject my input?

### A Game

In a small offline practice game, we can change the player's score or health and observe which memory values change. Then we can trace the instructions that update those values.

**Question:** Where is this value stored, and which code changes it?

Different applications, but the same habit: ask a specific question, collect evidence, and follow the program's behavior.

</div>
</details>

<details data-illustration data-slide="6" name="course-illustrations">
<summary>

## Slide 6: From C to a Binary

</summary>

<div class="illustration-body">

Before we reverse a program, let's understand how one is built.

We start with a simple C program:

```c title="check.c"
#include <stdio.h>

int main(void) {
    int input;

    printf("Enter the secret number: ");
    if (scanf("%d", &input) != 1) {
        return 1;
    }

    if (input == 1337) {
        puts("Correct!");
    } else {
        puts("Try again.");
    }

    return 0;
}
```

On a Linux system with GCC, we can build it with:

```sh
gcc -O0 -g -o check check.c
```

This produces a **binary** named `check`. The compiler translates our code into machine instructions, and the linker combines it with the other pieces needed to build the executable.

### What Is Inside the Binary?

A binary contains bytes. Some represent executable instructions; others contain data, strings, or information about the file itself.

If we open it in a hex editor, we see those bytes written as numbers. The CPU interprets instruction bytes according to its **instruction set**, such as x86-64.

An instruction can take several bytes. For a simple x86 example, the byte `90` represents `nop`: an instruction that does no work before execution continues.

### Turning Bytes into Assembly

A **disassembler** translates instruction bytes into readable assembly. For our example, we can use:

```sh
objdump -d -M intel check
```

We'll see more than just our `main` function. Executables also contain startup code and other supporting code. That code has a purpose, but for this example, we'll focus on `main` first.

### Finding the Check

Near the input check, we might find an instruction like this:

```asm
cmp DWORD PTR [rbp-0x4], 0x539
```

This is a representative example; the exact instructions and stack offsets depend on the compiler and build settings.

`cmp` compares two values. Here, `0x539` is hexadecimal for **1337**, and a conditional jump after the comparison chooses which path to take.

Even before we understand every instruction, that number gives us a useful lead. We trace how it relates to the input and predict that entering `1337` will print `Correct!`.

That investigation is **static analysis**: studying the file and its code without running it. Running the program afterward lets us check our prediction.

</div>
</details>

<details data-illustration data-slide="7" name="course-illustrations">
<summary>

## Slide 7: Dynamic Analysis

</summary>

<div class="illustration-body">

Static analysis tells us what the code looks like. **Dynamic analysis** means studying the program while it runs.

We can pause execution, inspect memory and registers, and step through instructions to see what actually happens.

### A Game Example

Think back to the offline practice game. We can note the player's health, take some damage, and compare the memory before and after. Repeating the process helps us narrow down where the value is stored.

Then we can investigate which instruction writes to that location.

### A GDB Example

For our C program, we can use **GDB**, a debugger:

```sh
gdb ./check
```

Inside GDB:

```text
break main
run
```

The program stops at `main`. From there, we can use:

| Command | Purpose |
| --- | --- |
| `next` | Execute the next source line, stepping over function calls |
| `print input` | Inspect the input variable after it has been assigned |
| `disassemble main` | View the assembly for `main` |
| `info registers` | Inspect the CPU registers |
| `stepi` | Execute one machine instruction |
| `continue` | Resume execution until the next stop or program exit |

Now we can enter a number, pause near the comparison, and observe how the program chooses its next branch.

Static and dynamic analysis work together: one helps us form a hypothesis, and the other helps us check it.

</div>
</details>

<details data-illustration data-slide="8" name="course-illustrations">
<summary>

## Slide 8: The Same Questions, Different Targets

</summary>

<div class="illustration-body">

Different targets need different tools, but the questions often stay the same:

- Where does the input come from?
- Where is it stored?
- Which code transforms or checks it?
- What decides whether we reach the success or failure path?

Getting better at reverse engineering means learning to ask questions that move the investigation forward.

You also need to recognize the conventions of your target:

- **Function prologues and epilogues:** how a function sets up and cleans up its stack frame. These patterns can change or disappear with optimization.
- **Registers and calling conventions:** which registers an architecture provides, how arguments are passed, and where return values go.
- **File formats:** how an executable is organized, such as ELF on Linux or PE on Windows.
- **Tools:** which disassemblers and debuggers support the target you are studying.

You don't need to memorize everything today. Start with a clear question, find the relevant code, and build your understanding one step at a time.

</div>
</details>

<details data-illustration data-slide="9" name="course-illustrations">
<summary>

## Slide 9: From RE to Pwn

</summary>

<div class="illustration-body">

That's the basic idea of reverse engineering: understanding how a program works by studying its code and behavior.

Now let's move on to **pwn**.

We'll keep using the same skills—reading assembly, inspecting memory, and debugging—but we'll use them to investigate what happens when a program handles something incorrectly.

</div>
</details>

<details data-illustration data-slide="10" name="course-illustrations">
<summary>

## Slide 10: What Is Binary Exploitation?

</summary>

<div class="illustration-body">

**Binary exploitation**, often called **pwn** in CTFs, is the process of using a vulnerability in a program to make it behave in an unintended way.

For example, a program might write past the end of a buffer. Depending on the program and its protections, that bug could let us change nearby data or influence which code runs next.

Understanding the program helps us identify the bug. Exploitation means working out whether that bug gives us useful control and how to demonstrate it in a challenge.

We'll start with how memory and the stack work, then use simple examples to connect the theory to practice.

</div>
</details>
