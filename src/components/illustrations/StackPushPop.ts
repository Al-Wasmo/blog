// A self-contained illustration: <stack-push-pop></stack-push-pop>.
// Shadow DOM keeps its styles and controls independent of the surrounding post.
import { PRESENTATION_STYLES } from "./presentation"
const BASE = 0x7fff_e000
const SLOT_COUNT = 8
const INITIAL = [0x61616161, 0x62626262, 0x64646464, 0x71717171]
const PROGRAM = ["…", "push 1", "push 2", "pop rax", "pop rbx", "…"]
const NOTES = [
  "",
  "push 1 → RSP − 8",
  "push 2 → RSP − 8",
  "pop rax → RAX = 2 · RSP + 8",
  "pop rbx → RBX = 1 · RSP + 8",
  "RAX = 2 · RBX = 1",
]

const address = (depth: number) => `0x${(BASE - depth * 8).toString(16)}`
const hex = (value: number) => `0x${value.toString(16)}`
const bytes = (value: number) =>
  Array.from({ length: 8 }, (_, i) =>
    Math.floor(value / 256 ** i)
      .toString(16)
      .slice(-2)
      .padStart(2, "0"),
  ).join(" ")

function stateAt(step: number) {
  const memory = [...INITIAL, null, null, null, null] as (number | null)[]
  if (step >= 1) memory[4] = 1
  if (step >= 2) memory[5] = 2
  return {
    memory,
    depth: [3, 4, 5, 4, 3, 3][step],
    rax: step >= 3 ? 2 : null,
    rbx: step >= 4 ? 1 : null,
  }
}

const styles = /* css */ `
  :host {
    --surface: var(--background, light-dark(#fcfcfc, #111111));
    --panel: var(--gray-2, light-dark(#f9f9f9, #191919));
    --ink: var(--foreground, light-dark(#202020, #eeeeee));
    --secondary: var(--muted-foreground, light-dark(#646464, #b4b4b4));
    --line: var(--border, light-dark(#d9d9d9, #3a3a3a));
    --ref-green: light-dark(#356017, #b7df86);
    --ref-orange: light-dark(#92420d, #f5bc86);
    --accent: var(--ref-green);
    --popped: var(--ref-orange);
    --accent-fill: color-mix(in oklab, var(--accent) 10%, var(--surface));
    --mono: var(--font-mono, monospace);
    --row-height: 42px;
    --slot-height: 44px;
    display: block;
    margin: 1.75rem 0;
    color: var(--ink);
    font: 14px/1.5 var(--font-sans, system-ui, sans-serif);
    text-align: left;
    overflow-wrap: normal;
  }
  *, *::before, *::after { box-sizing: border-box; }
  button { font: inherit; color: inherit; }
  button { cursor: pointer; }
  button:disabled { cursor: default; opacity: .4; }
  :focus-visible { outline: 2px solid var(--accent); outline-offset: 4px; }
  figure { width: 100%; margin: 0; border: 1px solid var(--line); border-radius: 10px; background: var(--surface); overflow: clip; }
  :host-context(details[data-illustration]) figure { border: 0; border-radius: 0; }
  .heading { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 14px 24px; }
  h3 { margin: 0; font-size: 18px; line-height: 1.3; font-weight: 600; }
  .fullscreen { min-width: 36px; padding: 8px; }
  .scene { display: grid; grid-template-columns: minmax(0, .9fr) minmax(0, 1.1fr); gap: 28px; padding: 24px; }
  .section-label { margin: 0 0 12px; color: var(--secondary); font-size: 12px; }
  .code { position: relative; display: grid; grid-auto-rows: var(--row-height); gap: 4px; }
  .cursor { position: absolute; inset: 0 0 auto; height: var(--row-height); border: 1px solid color-mix(in oklab, var(--accent) 45%, var(--surface)); border-radius: 6px; background: var(--accent-fill); transition: transform 350ms cubic-bezier(.2,.8,.2,1); pointer-events: none; }
  .instruction { position: relative; display: flex; align-items: center; gap: 12px; padding: 0 12px; font: 14px var(--mono); white-space: pre; }
  .arrow { color: var(--accent); visibility: hidden; font-size: 18px; }
  .instruction[aria-current=step] .arrow { visibility: visible; }
  .instruction[aria-current=step] code { color: var(--accent); font-weight: 600; }
  .registers { display: grid; gap: 8px; margin-top: 22px; }
  .register { display: flex; justify-content: space-between; align-items: center; gap: 8px; min-height: 32px; padding: 5px 10px; background: var(--panel); border: 1px solid var(--line); border-radius: 5px; font: 11px var(--mono); }
  .register span { color: var(--secondary); }
  .register output { font-size: 12px; }
  .register.changed { border-color: var(--popped); }
  .register.changed output { color: var(--popped); }
  .memory-heading { display: flex; justify-content: space-between; gap: 8px; }
  .memory-heading .section-label:last-child { font-size: 11px; }
  .memory { position: relative; padding-left: 44px; }
  .slots { display: grid; grid-auto-rows: var(--slot-height); gap: 5px; }
  .slot { display: flex; flex-direction: column; justify-content: center; gap: 2px; padding: 6px 10px; border: 1px dashed var(--line); border-radius: 5px; background: var(--panel); transition: border-color 250ms, background-color 250ms; min-width: 0; }
  .slot-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; font-family: var(--mono); }
  .value { font-size: 13px; font-weight: 600; }
  .address { color: var(--secondary); font-size: 10px; }
  .slot[data-used] { border-style: solid; background: var(--surface); }
  .slot[data-top] { border-color: var(--accent); background: var(--accent-fill); }
  .slot:not([data-used]) .value { color: var(--secondary); font-size: 11px; font-weight: 400; }
  .rsp { position: absolute; top: 0; left: 0; height: var(--slot-height); display: flex; align-items: center; gap: 3px; color: var(--accent); font: 11px var(--mono); transition: transform 400ms cubic-bezier(.2,.8,.2,1); }
  .status { margin: 0 24px; padding: 14px 0; min-height: 52px; }
  .status p { margin: 0; font-size: 13px; }
  .status:has(p:empty) { display: none; }
  .controls { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; padding: 14px 24px; background: var(--panel); border-top: 1px solid var(--line); }
  button { display: inline-flex; justify-content: center; align-items: center; gap: 7px; min-height: 36px; padding: 6px 11px; border: 1px solid var(--line); border-radius: 5px; background: var(--surface); font-size: 12px; }
  button:not(:disabled):hover { background: var(--accent-fill); border-color: var(--accent); }
  .play { min-width: 82px; background: var(--ink); color: var(--surface); border-color: var(--ink); }
  .play:not(:disabled):hover { background: var(--accent); border-color: var(--accent); color: var(--surface); }
  button svg { width: 13px; height: 13px; fill: none; stroke: currentColor; stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round; }
  .count { margin-left: auto; color: var(--secondary); font: 11px var(--mono); }
  :host(:fullscreen), :host([data-expanded]) {
    display: flex;
    align-items: safe center;
    justify-content: center;
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 24px;
    overflow: auto;
    overscroll-behavior: contain;
    background: var(--surface);
    --row-height: 54px;
    --slot-height: 56px;
  }
  :host([data-expanded]) { position: fixed; inset: 0; z-index: 2147483647; }
  :host(:fullscreen) figure, :host([data-expanded]) figure { max-width: 1100px; flex-shrink: 0; }
  :host(:fullscreen) .instruction, :host([data-expanded]) .instruction { font-size: 18px; }
  :host(:fullscreen) .value, :host([data-expanded]) .value { font-size: 17px; }
  :host(:fullscreen) .address, :host([data-expanded]) .address { font-size: 12px; }
  @media (width < 600px) {
    .heading, .controls { padding: 16px; }
    .scene { gap: 16px; padding: 20px 16px; }
    .status { margin-inline: 16px; }
    h3 { font-size: 18px; }
    .instruction { gap: 7px; padding-inline: 7px; font-size: 12px; }
    .memory { padding-left: 34px; }
    .rsp { font-size: 10px; }
    .slot { padding-inline: 7px; }
    .address { font-size: 9px; }
  }
  @media (width < 430px) {
    .scene { grid-template-columns: 1fr; }
    :host { --row-height: 34px; --slot-height: 40px; }
    .instruction { font-size: 13px; }
    .registers { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; margin-top: 14px; }
    .register { flex-direction: column; align-items: start; gap: 3px; padding: 7px; }
    .register output { font-size: 10px; }
    .register:first-child output { font-size: 9px; }
    .memory-heading { margin-top: 2px; }
    .value { font-size: 12px; }
    .address { font-size: 10px; }
    .status { min-height: 64px; }
  }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { transition: none !important; animation: none !important; }
  }
  ${PRESENTATION_STYLES}
`

const icon = (path: string) =>
  `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="${path}"/></svg>`

class StackPushPop extends HTMLElement {
  static observedAttributes = ["data-expanded"]

  attributeChangedCallback() {
    if (this.shadowRoot?.querySelector("[data-action=fullscreen]"))
      this.updateFullscreen()
  }

  private step = 0
  private playing = false
  private timer: ReturnType<typeof setTimeout> | undefined
  private events?: AbortController
  private animations: Animation[] = []
  private resize?: ResizeObserver

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" })
    const root = this.shadowRoot!
    root.innerHTML = `
      <style>${styles}</style>
      <figure aria-label="Interactive x86-64 stack push and pop illustration">
        <header class="heading">
          <h3>Push &amp; Pop</h3>
          <button type="button" class="fullscreen" data-action="fullscreen" aria-label="Enter fullscreen" title="Fullscreen"></button>
        </header>
        <div class="scene">
          <section aria-label="Instructions and registers">
            <p class="section-label">Instructions</p>
            <div class="code" role="list" aria-label="Assembly instructions">
              <div class="cursor" aria-hidden="true"></div>
              ${PROGRAM.map(
                (instruction, i) => `
                <div class="instruction" role="listitem" data-step="${i}">
                  <span class="arrow" aria-hidden="true">→</span>
                  <code>${instruction}</code>
                </div>`,
              ).join("")}
            </div>
            <div class="registers" aria-label="Register values">
              <div class="register"><span>RSP</span><output data-register="rsp"></output></div>
              <div class="register"><span>RAX</span><output data-register="rax"></output></div>
              <div class="register"><span>RBX</span><output data-register="rbx"></output></div>
            </div>
          </section>
          <section aria-label="Live stack memory">
            <div class="memory-heading"><p class="section-label">Stack</p><p class="section-label">Lower addresses ↓</p></div>
            <div class="memory">
              <div class="rsp" aria-hidden="true">RSP →</div>
              <div class="slots" role="list" aria-label="Stack slots, higher addresses first">
                ${Array.from({ length: SLOT_COUNT }, (_, row) => {
                  const depth = row
                  return `<div class="slot" role="listitem" data-depth="${depth}">
                    <div class="slot-top"><span class="value"></span><span class="address">${address(depth)}</span></div>
                  </div>`
                }).join("")}
              </div>
            </div>
          </section>
        </div>
        <div class="status" role="status" aria-live="polite" aria-atomic="true"><p></p></div>
        <div class="controls" role="group" aria-label="Animation controls">
          <button type="button" class="play" data-action="play" aria-label="Play animation"></button>
          <button type="button" data-action="back" aria-label="Previous instruction">${icon("M10 4 6 8l4 4M3 4v8")} Back</button>
          <button type="button" data-action="next" aria-label="Next instruction">Step ${icon("m6 4 4 4-4 4M13 4v8")}</button>
          <button type="button" data-action="reset" aria-label="Reset animation">${icon("M3 6a5 5 0 1 1 0 4M3 2v4h4")}</button>
          <span class="count" aria-label="Instruction progress"></span>
        </div>
      </figure>`

    this.events?.abort()
    this.events = new AbortController()
    const { signal } = this.events
    root.addEventListener(
      "click",
      (event) => {
        const action = (event.target as Element).closest<HTMLButtonElement>(
          "[data-action]",
        )?.dataset.action
        if (!action) return
        if (action === "fullscreen") {
          void this.toggleFullscreen()
          return
        }
        if (action === "play") {
          if (this.playing) this.pause()
          else {
            if (this.step === PROGRAM.length - 1) this.goTo(0)
            this.playing = true
            this.updateControls()
            this.schedule()
          }
        } else {
          this.pause()
          this.goTo(
            action === "reset" ? 0 : this.step + (action === "next" ? 1 : -1),
          )
        }
      },
      { signal },
    )
    document.addEventListener(
      "fullscreenchange",
      () => this.updateFullscreen(),
      { signal },
    )
    document.addEventListener(
      "keydown",
      (event) => {
        if (event.key === "Escape" && this.hasAttribute("data-expanded")) {
          this.removeAttribute("data-expanded")
          this.updateFullscreen()
          root
            .querySelector<HTMLButtonElement>("[data-action=fullscreen]")!
            .focus()
        }
      },
      { signal },
    )
    document.addEventListener(
      "visibilitychange",
      () => {
        if (document.hidden) this.pause()
      },
      { signal },
    )
    const panel = this.closest<HTMLDetailsElement>("details[data-illustration]")
    panel?.addEventListener(
      "toggle",
      () => {
        if (!panel.open) this.pause()
      },
      { signal },
    )
    this.resize?.disconnect()
    this.resize = new ResizeObserver(() => this.render())
    this.resize.observe(root.querySelector(".scene")!)
    this.updateFullscreen()
    this.render()
  }

  disconnectedCallback() {
    this.pause()
    this.events?.abort()
    this.resize?.disconnect()
    this.animations.forEach((animation) => animation.cancel())
  }

  private schedule() {
    clearTimeout(this.timer)
    this.timer = setTimeout(() => {
      this.goTo(this.step + 1)
      if (this.step === PROGRAM.length - 1) this.pause()
      else this.schedule()
    }, 1400)
  }

  private async toggleFullscreen() {
    if (document.fullscreenElement === this) {
      await document.exitFullscreen()
    } else if (this.hasAttribute("data-expanded")) {
      this.removeAttribute("data-expanded")
    } else {
      try {
        await this.requestFullscreen()
      } catch {
        // Keep the expanded view available in browsers without fullscreen support.
        this.setAttribute("data-expanded", "")
      }
    }
    this.updateFullscreen()
  }

  private updateFullscreen() {
    const button = this.shadowRoot!.querySelector<HTMLButtonElement>(
      "[data-action=fullscreen]",
    )!
    const expanded =
      document.fullscreenElement === this || this.hasAttribute("data-expanded")
    button.innerHTML = expanded
      ? icon("M2 6h4V2M10 2v4h4M14 10h-4v4M6 14v-4H2")
      : icon("M6 2H2v4M10 2h4v4M14 10v4h-4M6 14H2v-4")
    button.setAttribute(
      "aria-label",
      expanded ? "Exit fullscreen" : "Enter fullscreen",
    )
    button.setAttribute("aria-pressed", String(expanded))
    button.title = expanded ? "Exit fullscreen (Esc)" : "Fullscreen"
  }

  private pause() {
    clearTimeout(this.timer)
    this.playing = false
    this.updateControls()
  }

  private goTo(next: number) {
    next = Math.max(0, Math.min(PROGRAM.length - 1, next))
    const previous = this.step
    this.step = next
    this.animations.forEach((animation) => animation.cancel())
    this.animations = []
    this.render()
    if (
      next !== previous + 1 ||
      matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return

    const root = this.shadowRoot!
    if (next === 1 || next === 2) {
      const slot = root.querySelector(`[data-depth="${next + 3}"]`)!
      this.animations.push(
        slot.animate(
          [
            { opacity: 0, transform: "translateY(-14px) scale(.96)" },
            { opacity: 1, transform: "translateY(0) scale(1)" },
          ],
          { duration: 450, easing: "cubic-bezier(.2,.8,.2,1)" },
        ),
      )
    } else if (next === 3 || next === 4) {
      const register = root.querySelector(
        `[data-register="${next === 3 ? "rax" : "rbx"}"]`,
      )!.parentElement!
      this.animations.push(
        register.animate(
          [
            { transform: "translateX(8px)", opacity: 0.35 },
            { transform: "translateX(0)", opacity: 1 },
          ],
          { duration: 450, easing: "ease-out" },
        ),
      )
      const slot = root.querySelector(`[data-depth="${next === 3 ? 5 : 4}"]`)!
      this.animations.push(
        slot.animate(
          [
            {
              backgroundColor: "var(--accent-fill)",
              transform: "translateX(0)",
            },
            { transform: "translateX(-8px)", opacity: 0.3, offset: 0.45 },
            { transform: "translateX(0)", opacity: 1 },
          ],
          { duration: 500, easing: "ease-out" },
        ),
      )
    }
  }

  private updateControls() {
    const root = this.shadowRoot
    if (!root) return
    const play = root.querySelector<HTMLButtonElement>("[data-action=play]")!
    play.innerHTML = this.playing
      ? `${icon("M5 3v10M11 3v10")} Pause`
      : `${icon("m5 3 8 5-8 5Z")} ${this.step === 5 ? "Replay" : "Play"}`
    play.setAttribute(
      "aria-label",
      this.playing
        ? "Pause animation"
        : this.step === 5
          ? "Replay animation"
          : "Play animation",
    )
    root.querySelector<HTMLButtonElement>("[data-action=back]")!.disabled =
      this.step === 0
    root.querySelector<HTMLButtonElement>("[data-action=next]")!.disabled =
      this.step === 5
    root.querySelector<HTMLButtonElement>("[data-action=reset]")!.disabled =
      this.step === 0 && !this.playing
    root.querySelector(".count")!.textContent = `${this.step} / 5`
  }

  private render() {
    const root = this.shadowRoot!
    const state = stateAt(this.step)
    root.querySelectorAll<HTMLElement>(".instruction").forEach((row, i) => {
      if (i === this.step) row.setAttribute("aria-current", "step")
      else row.removeAttribute("aria-current")
    })
    const current = root.querySelector<HTMLElement>(
      `[data-step="${this.step}"]`,
    )!
    root.querySelector<HTMLElement>(".cursor")!.style.transform =
      `translateY(${current.offsetTop}px)`
    root.querySelectorAll<HTMLElement>(".slot").forEach((slot) => {
      const depth = Number(slot.dataset.depth)
      const value = state.memory[depth]
      const used = depth <= state.depth
      slot.toggleAttribute("data-used", used)
      slot.toggleAttribute("data-top", depth === state.depth)
      const label = used
        ? depth < INITIAL.length
          ? ["aaaa", "bbbb", "dddd", "qqqq"][depth]
          : String(value)
        : "—"
      slot.querySelector(".value")!.textContent = label
      slot.title =
        value === null
          ? "Unused memory"
          : `${bytes(value)}${used ? "" : " (no longer on the stack)"}`
      slot.setAttribute(
        "aria-label",
        `${address(depth)}: ${label}${!used && value !== null ? `, previous value ${value} remains in memory` : ""}${depth === state.depth ? ", top of stack, RSP" : ""}`,
      )
    })
    const top = root.querySelector<HTMLElement>(
      `[data-depth="${state.depth}"]`,
    )!
    root.querySelector<HTMLElement>(".rsp")!.style.transform =
      `translateY(${top.offsetTop}px)`
    root.querySelector("[data-register=rsp]")!.textContent = address(
      state.depth,
    )
    for (const name of ["rax", "rbx"] as const) {
      const output = root.querySelector<HTMLOutputElement>(
        `[data-register=${name}]`,
      )!
      output.textContent = state[name] === null ? "—" : hex(state[name]!)
      output.parentElement!.classList.toggle(
        "changed",
        this.step === (name === "rax" ? 3 : 4),
      )
    }
    root.querySelector(".status p")!.textContent = NOTES[this.step]
    this.updateControls()
  }
}

if (!customElements.get("stack-push-pop")) {
  customElements.define("stack-push-pop", StackPushPop)
}
