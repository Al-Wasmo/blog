# Adding an illustration

Build for presentation: large values, readable addresses, clear highlights, and
short action labels. Keep explanatory paragraphs and footnotes out of the UI.
Import `PRESENTATION_STYLES` from `./presentation` and interpolate it last in the
shadow stylesheet. It supplies shared sizing for native fullscreen and student
links using `full=true`. Keep animations and direct step controls prominent.

For slide-by-slide illustrations, extend `StepWalkthrough` and use its `header`
and `controls` helpers. It handles Back, Next, Reset, progress, and both native
and fallback fullscreen. Keep each illustration's stage layout and transitions
in its own component.

Keep the UI, styles, and animation state in its own custom element. Register it
in `Illustrations.astro`, then use this pattern in the Markdown post:

```md
<details data-illustration name="course-illustrations">
<summary>

## Illustration title

</summary>

<your-illustration></your-illustration>

</details>
```

Keep the blank lines around the Markdown heading. It gives the illustration a
heading anchor and adds it to the blog's table of contents. The illustration
index also picks it up automatically. Omit `open` so it starts collapsed.

The shared `name` makes this an accordion. Clicking either table of contents
opens the destination and closes the previous illustration. Every page visit
starts with all illustrations collapsed, including reloads with a saved hash
and pages restored from browser history. Only selecting a title or a contents
link opens an illustration. An explicit `full=true` link is the exception: it
opens its target immediately in a view that fills the browser window.

## Sharing an Illustration

Use the Fullscreen link next to an illustration's title, or append `?full=true`
before the heading anchor:

```text
/blog/pwn-and-reverse-engineering-workshop?full=true#buffers
/blog/pwn-and-reverse-engineering-workshop?full=true#buffer-overflow
/blog/pwn-and-reverse-engineering-workshop?full=true#overwriting-a-secret
/blog/pwn-and-reverse-engineering-workshop?full=true#reverse-engineering-process
/blog/pwn-and-reverse-engineering-workshop?full=true#integer-vulnerability
/blog/pwn-and-reverse-engineering-workshop?full=true#process-memory-map
/blog/pwn-and-reverse-engineering-workshop?full=true#push-pop
/blog/pwn-and-reverse-engineering-workshop?full=true#function-calls
/blog/pwn-and-reverse-engineering-workshop?full=true#overflow-sandbox
/blog/pwn-and-reverse-engineering-workshop?full=true#b0f1-local-variable
/blog/pwn-and-reverse-engineering-workshop?full=true#b0f2-global-variable
/blog/pwn-and-reverse-engineering-workshop?full=true#b0f3-ret2win
/blog/pwn-and-reverse-engineering-workshop?full=true#b0f5-canary
```

The alternate `#buffers-integers?full=true` syntax also works. The aliases
`buffers-integers` and `buffers-strings` select the corresponding buffer type.
Any registered custom element placed in an illustration panel gets a share
link automatically. Exit using Escape or the component's fullscreen button.

This fills the browser window without calling the native Fullscreen API, which
requires a user gesture. Normal component fullscreen buttons still use native
fullscreen when opened from the blog. Use the deployed site's hostname when
sharing links with students; `localhost` points to each student's own machine.

Pause playback when the enclosing `details[data-illustration]` fires a `toggle`
event with `open === false`. Keep playback state so reopening resumes from the
same instruction when the reader presses Play.
