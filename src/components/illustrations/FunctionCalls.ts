// A hand-written stack-argument calling convention, not compiler output for an ABI.
// CALL/RET, 8-byte pushes, return addresses, and RSP changes follow x86-64 semantics.
import { PRESENTATION_STYLES } from "./presentation"
const STACK_BASE = 0x7fff_ffff_e000
const RETURN_ADDRESS = "0x55555555510d"
const CALLER = ["…", "push 1", "push 2", "call add", "mov rax, 2", "…"]
const CALLEE = ["mov rax, [rsp + 8]", "add rax, [rsp + 16]", "ret"]
const STEPS = [
  {
    instruction: "caller-0",
    depth: 3,
    rax: null,
    rip: "0x555555555104",
    note: "",
  },
  {
    instruction: "caller-1",
    depth: 4,
    rax: null,
    rip: "0x555555555106",
    note: "Push b = 1 · RSP − 8",
  },
  {
    instruction: "caller-2",
    depth: 5,
    rax: null,
    rip: "0x555555555108",
    note: "Push a = 2 · RSP − 8",
  },
  {
    instruction: "caller-3",
    depth: 6,
    rax: null,
    rip: "0x555555555200",
    note: "call → push return address, jump to add",
  },
  {
    instruction: "add-0",
    depth: 6,
    rax: 2,
    rip: "0x555555555205",
    note: "[rsp + 8] → a = 2 → RAX",
  },
  {
    instruction: "add-1",
    depth: 6,
    rax: 3,
    rip: "0x55555555520a",
    note: "RAX + b → 2 + 1 = 3",
  },
  {
    instruction: "add-2",
    depth: 5,
    rax: 3,
    rip: RETURN_ADDRESS,
    note: "ret → pop return address into RIP · RAX = 3",
  },
  {
    instruction: "caller-4",
    depth: 5,
    rax: 2,
    rip: "0x555555555114",
    note: "mov rax, 2 → RAX = 2",
  },
  {
    instruction: "caller-5",
    depth: 5,
    rax: 2,
    rip: "…",
    note: "",
  },
]
const stackAddress = (depth: number) =>
  `0x${(STACK_BASE - depth * 8).toString(16)}`
const icon = (path: string) =>
  `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="${path}"/></svg>`

const styles = /* css */ `
  :host {
    --surface: var(--background, light-dark(#fcfcfc, #111111));
    --panel: var(--gray-2, light-dark(#f9f9f9, #191919));
    --ink: var(--foreground, light-dark(#202020, #eeeeee));
    --secondary: var(--muted-foreground, light-dark(#646464, #b4b4b4));
    --line: var(--border, light-dark(#d9d9d9, #3a3a3a));
    --accent: light-dark(#235a83, #aed7ff);
    --return: light-dark(#854309, #f7c48c);
    --highlight: color-mix(in oklab, var(--accent) 10%, var(--surface));
    --return-fill: color-mix(in oklab, var(--return) 10%, var(--surface));
    --mono: var(--font-mono, monospace);
    --row-height: 38px;
    --slot-height: 52px;
    display: block; margin: 0; color: var(--ink);
    font: 14px/1.5 var(--font-sans, system-ui, sans-serif); text-align: left;
  }
  *, *::before, *::after { box-sizing: border-box; }
  figure, h3, h4, p { margin: 0; }
  figure { width: 100%; border: 1px solid var(--line); border-radius: 10px; overflow: clip; background: var(--surface); }
  :host-context(details[data-illustration]) figure { border: 0; border-radius: 0; }
  header { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 16px 24px; }
  h3 { font-size: 18px; font-weight: 600; }
  button { display: inline-flex; justify-content: center; align-items: center; gap: 7px; min-height: 36px; padding: 6px 11px; border: 1px solid var(--line); border-radius: 5px; background: var(--surface); color: inherit; font: 12px var(--font-sans, system-ui, sans-serif); cursor: pointer; }
  button:not(:disabled):hover { border-color: var(--accent); background: var(--highlight); }
  button:disabled { opacity: .4; cursor: default; }
  button svg { width: 14px; height: 14px; fill: none; stroke: currentColor; stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round; }
  :focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }
  .scene-scroll { overflow-x: auto; }
  .scene { display: grid; grid-template-columns: minmax(190px, .85fr) minmax(255px, 1.1fr) minmax(255px, 1.15fr); gap: 20px; min-width: 790px; padding: 8px 24px 24px; }
  h4 { margin-bottom: 16px; font-size: 14px; font-weight: 400; color: var(--secondary); }
  code { font-family: var(--mono); }
  .source-block { padding: 12px 10px; border: 1px solid var(--line); border-radius: 6px; background: var(--panel); }
  .source-line { padding: 7px 3px; font: 14px/1.6 var(--mono); white-space: nowrap; }
  .source-line[data-active] { color: var(--accent); }
  .argument[data-active] { padding: 2px 3px; background: var(--accent); color: var(--surface); border-radius: 3px; }
  .callee-source { margin-top: 18px; }
  .function-name { margin-bottom: 6px; color: var(--secondary); font: 12px var(--mono); }
  .parameters { display: flex; gap: 16px; margin-top: 14px; color: var(--secondary); font: 11px var(--mono); }
  .parameters output { color: var(--ink); }
  .result { display: flex; justify-content: space-between; gap: 10px; margin-top: 18px; padding: 9px 10px; border: 1px solid var(--line); border-radius: 5px; font: 12px var(--mono); }
  .result output { color: var(--accent); }
  .assembly { position: relative; }
  .block-label { padding: 0 8px 8px; color: var(--secondary); font: 11px var(--mono); }
  .block-label.callee { margin-top: 16px; }
  .instruction { position: relative; display: flex; align-items: center; gap: 7px; height: var(--row-height); padding: 0 7px; white-space: nowrap; font: 13px var(--mono); }
  .number { min-width: 10px; color: var(--secondary); font-size: 10px; }
  .arrow { color: var(--accent); visibility: hidden; }
  .instruction[aria-current=step] .arrow { visibility: visible; }
  .instruction[aria-current=step] code { color: var(--accent); font-weight: 600; }
  .instruction-cursor { position: absolute; inset: 0 0 auto; height: var(--row-height); border: 1px solid var(--accent); border-radius: 5px; background: var(--highlight); transition: transform 350ms cubic-bezier(.2,.8,.2,1); pointer-events: none; }
  .registers { display: grid; gap: 6px; margin-top: 18px; }
  .register { display: flex; align-items: center; justify-content: space-between; gap: 6px; padding: 7px 9px; border: 1px solid var(--line); border-radius: 5px; background: var(--panel); font: 10px var(--mono); }
  .register span { color: var(--secondary); }
  .register output { color: var(--ink); }
  .register[data-changed] { border-color: var(--accent); }
  .stack { position: relative; padding-left: 35px; }
  .slots { display: grid; grid-auto-rows: var(--slot-height); gap: 5px; }
  .slot { position: relative; display: flex; flex-direction: column; justify-content: center; gap: 3px; padding: 6px 8px; border: 1px dashed var(--line); border-radius: 5px; background: var(--panel); min-width: 0; }
  .slot[data-used] { border-style: solid; background: var(--surface); }
  .slot[data-kind=argument] { border-color: var(--accent); background: var(--highlight); }
  .slot[data-kind=return] { border-color: var(--return); background: var(--return-fill); }
  .slot .top { display: flex; align-items: center; justify-content: space-between; gap: 6px; }
  .slot .value { font: 16px var(--mono); }
  .slot .label { color: var(--secondary); font-size: 10px; }
  .slot[data-kind=return] .value { color: var(--return); font-size: 10px; }
  .slot[data-kind=return] .label { color: var(--return); }
  .slot .address { color: var(--secondary); font: 9px var(--mono); }
  .slot:not([data-used]) .value { color: var(--secondary); font-size: 11px; }
  .rsp { position: absolute; top: 0; left: 0; height: var(--slot-height); display: flex; align-items: center; color: var(--accent); font: 10px var(--mono); transition: transform 350ms cubic-bezier(.2,.8,.2,1); }
  .status { padding: 0 24px 16px; min-height: 58px; font-size: 13px; }
  .status:empty { display: none; }
  .controls { display: flex; align-items: center; gap: 8px; padding: 14px 24px; border-top: 1px solid var(--line); background: var(--panel); }
  .next { color: var(--surface); background: var(--ink); border-color: var(--ink); }
  .next:not(:disabled):hover { color: var(--surface); background: var(--accent); }
  .count { margin-left: auto; color: var(--secondary); font: 11px var(--mono); }
  :host(:fullscreen), :host([data-expanded]) { display: flex; align-items: safe center; justify-content: center; width: 100%; height: 100%; margin: 0; padding: 16px; overflow: auto; overscroll-behavior: contain; background: var(--surface); --row-height: 42px; --slot-height: 58px; }
  :host(:fullscreen) figure, :host([data-expanded]) figure { max-width: 1500px; flex-shrink: 0; }
  :host([data-expanded]) { position: fixed; inset: 0; z-index: 2147483647; }
  :host(:fullscreen) h3, :host([data-expanded]) h3 { font-size: 24px; }
  :host(:fullscreen) h4, :host([data-expanded]) h4 { font-size: 16px; }
  :host(:fullscreen) .scene, :host([data-expanded]) .scene { min-width: 1060px; }
  :host(:fullscreen) .instruction, :host([data-expanded]) .instruction { font-size: 18px; }
  :host(:fullscreen) .source-line, :host([data-expanded]) .source-line { font-size: 20px; }
  :host(:fullscreen) .slot .value, :host([data-expanded]) .slot .value { font-size: 20px; }
  :host(:fullscreen) .slot[data-kind=return] .value, :host([data-expanded]) .slot[data-kind=return] .value { font-size: 14px; }
  :host(:fullscreen) .slot .address, :host([data-expanded]) .slot .address { font-size: 12px; }
  :host(:fullscreen) .slot .label, :host([data-expanded]) .slot .label { font-size: 13px; }
  :host(:fullscreen) :is(.register, .parameters, .block-label, .function-name), :host([data-expanded]) :is(.register, .parameters, .block-label, .function-name) { font-size: 13px; }
  :host(:fullscreen) .result, :host([data-expanded]) .result { font-size: 18px; }
  :host(:fullscreen) .status, :host([data-expanded]) .status { font-size: 16px; }
  :host(:fullscreen) button, :host([data-expanded]) button { min-height: 42px; font-size: 14px; }
  @media (width < 600px) { header, .controls { padding: 16px; } .scene { padding-inline: 16px; } .status { padding-inline: 16px; } :host(:fullscreen), :host([data-expanded]) { padding: 10px; } }
  @media (prefers-reduced-motion: reduce) { *, *::before, *::after { transition: none !important; animation: none !important; } }
  ${PRESENTATION_STYLES}
`

class FunctionCalls extends HTMLElement {
  static observedAttributes = ["data-expanded"]
  private step = 0
  private events?: AbortController
  private resize?: ResizeObserver
  private animations: Animation[] = []

  attributeChangedCallback() {
    if (this.shadowRoot?.querySelector("[data-action=fullscreen]"))
      this.updateFullscreen()
  }

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" })
    const root = this.shadowRoot!
    const instructions = (lines: string[], block: string) =>
      lines
        .map(
          (line, i) =>
            `<div class="instruction" data-instruction="${block}-${i}" role="listitem"><span class="arrow" aria-hidden="true">→</span><span class="number" aria-hidden="true">${block === "caller" ? i + 1 : ""}</span><code>${line}</code></div>`,
        )
        .join("")
    root.innerHTML = `
      <style>${styles}</style>
      <figure aria-label="Step through a function call and its stack">
        <header><h3>Function Calls</h3><button type="button" data-action="fullscreen" aria-label="Enter fullscreen" title="Fullscreen"></button></header>
        <div class="scene-scroll"><div class="scene">
          <section aria-label="Function call"><h4>Function call</h4>
            <div class="source-block">
              <div class="source-line">…</div>
              <div class="source-line" data-source="call">result = add(<span class="argument" data-argument="a">2</span>, <span class="argument" data-argument="b">1</span>);</div>
              <div class="source-line" data-source="assign">result = 2;</div>
              <div class="source-line">…</div>
            </div>
            <div class="source-block callee-source"><p class="function-name">add(a, b)</p><div class="source-line" data-source="return">return a + b;</div><div class="parameters"><span>a = <output data-parameter="a">—</output></span><span>b = <output data-parameter="b">—</output></span></div></div>
            <div class="result"><span>result</span><output data-result>—</output></div>
          </section>
          <section aria-label="Assembly and registers"><h4>Assembly</h4>
            <div class="assembly"><div class="instruction-cursor" aria-hidden="true"></div>
              <p class="block-label">caller:</p><div role="list" aria-label="Caller instructions">${instructions(CALLER, "caller")}</div>
              <p class="block-label callee">add:</p><div role="list" aria-label="Function instructions">${instructions(CALLEE, "add")}</div>
            </div>
            <div class="registers"><div class="register"><span>RIP · next</span><output data-register="rip"></output></div><div class="register"><span>RSP</span><output data-register="rsp"></output></div><div class="register"><span>RAX</span><output data-register="rax"></output></div></div>
          </section>
          <section aria-label="Stack"><h4>Stack · lower addresses ↓</h4>
            <div class="stack"><span class="rsp" aria-hidden="true">RSP →</span><div class="slots" role="list" aria-label="Stack slots, eight bytes each">${Array.from(
              { length: 8 },
              (_, row) => {
                const depth = row
                return `<div class="slot" data-depth="${depth}" role="listitem"><div class="top"><span class="value"></span><span class="label"></span></div><span class="address">${stackAddress(depth)}</span></div>`
              },
            ).join("")}</div></div>
          </section>
        </div></div>
        <div class="status" role="status" aria-live="polite" aria-atomic="true"></div>
        <div class="controls"><button type="button" data-action="back">${icon("m10 4-4 4 4 4")} Back</button><button type="button" class="next" data-action="next">Next ${icon("m6 4 4 4-4 4")}</button><button type="button" data-action="reset" aria-label="Reset illustration">${icon("M3 6a5 5 0 1 1 0 4M3 2v4h4")} Reset</button><span class="count"></span></div>
      </figure>`
    this.events?.abort()
    this.events = new AbortController()
    const { signal } = this.events
    root.addEventListener(
      "click",
      (event) => {
        const action = (event.target as Element).closest<HTMLElement>(
          "[data-action]",
        )?.dataset.action
        if (action === "fullscreen") {
          void this.toggleFullscreen()
          return
        }
        if (action)
          this.goTo(
            action === "reset" ? 0 : this.step + (action === "next" ? 1 : -1),
          )
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
    this.closest<HTMLDetailsElement>(
      "details[data-illustration]",
    )?.addEventListener("toggle", () => this.cancelAnimations(), { signal })
    this.resize?.disconnect()
    this.resize = new ResizeObserver(() => this.positionPointers())
    this.resize.observe(root.querySelector(".scene")!)
    this.render()
    this.updateFullscreen()
  }

  disconnectedCallback() {
    this.events?.abort()
    this.resize?.disconnect()
    this.cancelAnimations()
  }

  private positionPointers() {
    const root = this.shadowRoot!
    const state = STEPS[this.step]
    const instruction = root.querySelector<HTMLElement>(
      `[data-instruction="${state.instruction}"]`,
    )!
    root.querySelector<HTMLElement>(".instruction-cursor")!.style.transform =
      `translateY(${instruction.offsetTop}px)`
    const slot = root.querySelector<HTMLElement>(
      `[data-depth="${state.depth}"]`,
    )!
    root.querySelector<HTMLElement>(".rsp")!.style.transform =
      `translateY(${slot.offsetTop}px)`
  }

  private render() {
    const root = this.shadowRoot!
    const state = STEPS[this.step]
    const prior = this.step ? STEPS[this.step - 1] : state
    root.querySelectorAll<HTMLElement>(".instruction").forEach((line) => {
      if (line.dataset.instruction === state.instruction)
        line.setAttribute("aria-current", "step")
      else line.removeAttribute("aria-current")
    })
    root
      .querySelectorAll<HTMLElement>(".source-line[data-source]")
      .forEach((line) => {
        line.toggleAttribute(
          "data-active",
          line.dataset.source ===
            (this.step <= 3 || this.step === 6
              ? "call"
              : this.step <= 5
                ? "return"
                : "assign"),
        )
      })
    root
      .querySelector("[data-argument=a]")!
      .toggleAttribute("data-active", this.step === 2)
    root
      .querySelector("[data-argument=b]")!
      .toggleAttribute("data-active", this.step === 1)
    root.querySelector("[data-parameter=a]")!.textContent =
      this.step >= 4 ? "2" : "—"
    root.querySelector("[data-parameter=b]")!.textContent =
      this.step >= 5 ? "1" : "—"
    root.querySelector("[data-result]")!.textContent =
      this.step < 6 ? "—" : this.step === 6 ? "3" : "2"
    for (const register of ["rip", "rsp", "rax"] as const) {
      const output = root.querySelector<HTMLOutputElement>(
        `[data-register=${register}]`,
      )!
      output.textContent =
        register === "rsp"
          ? stackAddress(state.depth)
          : register === "rip"
            ? state.rip
            : state.rax === null
              ? "—"
              : String(state.rax)
      output.parentElement!.toggleAttribute(
        "data-changed",
        register === "rsp"
          ? state.depth !== prior.depth
          : state[register] !== prior[register],
      )
    }
    root.querySelectorAll<HTMLElement>(".slot").forEach((slot) => {
      const depth = Number(slot.dataset.depth)
      const used = depth <= state.depth
      slot.toggleAttribute("data-used", used)
      const kind =
        used && depth === 6 ? "return" : used && depth >= 4 ? "argument" : ""
      slot.dataset.kind = kind
      const value = !used
        ? "unused"
        : depth === 6
          ? RETURN_ADDRESS
          : depth === 5
            ? "2"
            : depth === 4
              ? "1"
              : "aaaaaaaa"
      const label =
        kind === "return"
          ? "return"
          : kind === "argument"
            ? depth === 5
              ? "a"
              : "b"
            : ""
      slot.querySelector(".value")!.textContent = value
      slot.querySelector(".label")!.textContent = label
      slot.setAttribute(
        "aria-label",
        `${stackAddress(depth)}: ${value}${label ? `, ${label}` : ""}${depth === state.depth ? ", RSP" : ""}`,
      )
    })
    root.querySelector(".status")!.textContent = state.note
    root.querySelector<HTMLButtonElement>("[data-action=back]")!.disabled =
      this.step === 0
    root.querySelector<HTMLButtonElement>("[data-action=reset]")!.disabled =
      this.step === 0
    root.querySelector<HTMLButtonElement>("[data-action=next]")!.disabled =
      this.step === STEPS.length - 1
    root.querySelector(".count")!.textContent =
      `${this.step} / ${STEPS.length - 1}`
    this.positionPointers()
  }

  private goTo(step: number) {
    const previous = this.step
    this.step = Math.max(0, Math.min(STEPS.length - 1, step))
    this.cancelAnimations()
    this.render()
    if (
      this.step !== previous + 1 ||
      matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return
    const root = this.shadowRoot!
    const slotDepth =
      this.step <= 3 ? STEPS[this.step].depth : this.step === 6 ? 6 : undefined
    const target =
      slotDepth !== undefined
        ? root.querySelector(`[data-depth="${slotDepth}"]`)!
        : root.querySelector("[data-register=rax]")!.parentElement!
    this.animations.push(
      target.animate(
        [
          {
            opacity: 0.25,
            transform:
              this.step === 6 ? "translateX(-10px)" : "translateY(-10px)",
          },
          { opacity: 1, transform: "translate(0)" },
        ],
        { duration: 400, easing: "cubic-bezier(.2,.8,.2,1)" },
      ),
    )
  }

  private cancelAnimations() {
    this.animations.forEach((animation) => animation.cancel())
    this.animations = []
  }

  private async toggleFullscreen() {
    if (document.fullscreenElement === this) await document.exitFullscreen()
    else if (this.hasAttribute("data-expanded"))
      this.removeAttribute("data-expanded")
    else {
      try {
        await this.requestFullscreen()
      } catch {
        this.setAttribute("data-expanded", "")
      }
    }
    this.updateFullscreen()
  }

  private updateFullscreen() {
    const expanded =
      document.fullscreenElement === this || this.hasAttribute("data-expanded")
    const button = this.shadowRoot!.querySelector<HTMLButtonElement>(
      "[data-action=fullscreen]",
    )!
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
}

if (!customElements.get("function-calls"))
  customElements.define("function-calls", FunctionCalls)
