// A teaching simulation, not execution of C: out-of-bounds C writes are undefined.
// The neighboring data and its placement are chosen to make overwrites visible.
import { PRESENTATION_STYLES } from "./presentation"
const BASES = { pie: 0x5555_5555_8000, stack: 0x7fff_ffff_e100 }
const START = 16
const NUMBERS = [10, 20, 30, 40, 50, 60, 70]
const NEIGHBORS = [1111, 2222, 3333, 4444]
const escapeHtml = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ]!,
  )
const icon = (path: string) =>
  `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="${path}"/></svg>`
const littleEndian = (value: number, width: number) =>
  Array.from(
    { length: width },
    (_, byte) => Math.floor(value / 256 ** byte) % 256,
  )
const charLiteral = (value: number) =>
  value === 0
    ? "'\\0'"
    : `'${String.fromCharCode(value).replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`

const css = /* css */ `
  :host {
    --surface: var(--background, light-dark(#fcfcfc, #111111));
    --panel: var(--gray-2, light-dark(#f9f9f9, #191919));
    --ink: var(--foreground, light-dark(#202020, #eeeeee));
    --secondary: var(--muted-foreground, light-dark(#646464, #b4b4b4));
    --line: var(--border, light-dark(#d9d9d9, #3a3a3a));
    --accent: light-dark(#235a83, #aed7ff);
    --danger: var(--destructive, light-dark(#ce2c31, #ff9592));
    --buffer-fill: color-mix(in oklab, var(--accent) 10%, var(--surface));
    --overflow-fill: color-mix(in oklab, var(--danger) 12%, var(--surface));
    --mono: var(--font-mono, monospace);
    display: block; margin: 0; color: var(--ink);
    font: 14px/1.5 var(--font-sans, system-ui, sans-serif); text-align: left;
  }
  *, *::before, *::after { box-sizing: border-box; }
  [hidden] { display: none !important; }
  h3, p, pre, figure { margin: 0; }
  figure { width: 100%; border: 1px solid var(--line); border-radius: 10px; background: var(--surface); overflow: clip; }
  :host-context(details[data-illustration]) figure { border: 0; border-radius: 0; }
  header { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 16px 24px 0; }
  h3 { font-size: 18px; font-weight: 600; }
  button, select, input { font: inherit; color: inherit; }
  button { display: inline-flex; align-items: center; justify-content: center; gap: 7px; min-height: 36px; padding: 6px 11px; border: 1px solid var(--line); border-radius: 5px; background: var(--surface); font-size: 12px; cursor: pointer; }
  button:disabled { opacity: .4; cursor: default; }
  button:not(:disabled):hover { background: var(--buffer-fill); border-color: var(--accent); }
  button svg { width: 14px; height: 14px; fill: none; stroke: currentColor; stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round; }
  :focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }
  .body { padding: 20px 24px; }
  .settings { display: flex; flex-wrap: wrap; align-items: center; gap: 12px 18px; margin-bottom: 16px; }
  label { display: flex; align-items: center; gap: 8px; color: var(--secondary); font-size: 12px; white-space: nowrap; }
  select, input { min-height: 34px; max-width: 100%; padding: 5px 8px; border: 1px solid var(--line); border-radius: 5px; color: var(--ink); background: var(--surface); font: 12px var(--mono); }
  input { width: 150px; }
  pre { padding: 14px 16px; border: 1px solid var(--line); border-radius: 6px; background: var(--panel); overflow-x: auto; }
  code { font: 13px var(--mono); }
  pre code { white-space: pre; }
  .input-line { display: flex; flex-wrap: wrap; gap: 6px 10px; margin-block: 12px; font: 12px var(--mono); }
  .input-line > span:first-child { color: var(--secondary); }
  .incoming { display: inline-flex; gap: 4px; flex-wrap: wrap; }
  .incoming span { min-width: 21px; padding: 2px 4px; text-align: center; border-radius: 3px; }
  .incoming [data-done] { color: var(--secondary); }
  .incoming [data-current] { background: var(--accent); color: var(--surface); }
  .incoming [data-current][data-overflow] { background: var(--danger); }
  .status { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; min-height: 40px; margin-bottom: 12px; font-size: 12px; }
  .status code { font-size: 12px; white-space: nowrap; }
  .status .result { white-space: nowrap; }
  .status[data-overflow] { color: var(--danger); }
  .memory { overflow-x: auto; overscroll-behavior-inline: contain; }
  table { border-collapse: collapse; table-layout: fixed; width: 100%; min-width: 620px; }
  th { padding: 4px 8px 8px; text-align: left; font-size: 10px; font-weight: 400; color: var(--secondary); }
  th:first-child { width: 120px; }
  th:last-child { width: 96px; }
  td { padding: 0 8px; border-top: 1px solid var(--line); }
  .address { display: grid; gap: 2px; color: var(--secondary); font: 10px/1.5 var(--mono); white-space: nowrap; }
  .address .owner { color: var(--ink); }
  .bytes { display: grid; grid-template-columns: repeat(8, minmax(28px, 1fr)); }
  .unit { display: inline-flex; flex-direction: column; align-items: center; justify-content: center; min-height: 48px; color: var(--secondary); background: var(--panel); font: 12px var(--mono); white-space: nowrap; overflow-wrap: normal; }
  .unit[data-buffer] { color: var(--accent); background: var(--buffer-fill); }
  .unit[data-written] { color: var(--ink); }
  .unit[data-overflow] { color: var(--danger); background: var(--overflow-fill); }
  .unit[data-current] { outline: 1px solid currentColor; outline-offset: -1px; }
  .unit[data-boundary] { border-left: 2px dashed var(--danger); }
  del { display: block; color: var(--secondary); font-size: 10px; }
  .ascii { font: 12px var(--mono); white-space: pre; color: var(--secondary); }
  .ascii [data-buffer] { color: var(--accent); background: var(--buffer-fill); }
  .ascii [data-overflow] { color: var(--danger); background: var(--overflow-fill); }
  .stack { display: grid; min-width: 620px; gap: 5px; }
  .slot { display: flex; align-items: center; gap: 16px; min-height: 58px; padding: 7px 14px; border: 1px solid var(--line); border-radius: 5px; background: var(--panel); white-space: nowrap; }
  .slot-values { display: flex; flex: 1; min-width: 0; }
  .slot .unit { flex: var(--span) 1 0; min-width: 0; min-height: 40px; font-size: 16px; }
  .slot .address { flex-shrink: 0; text-align: right; font-size: 11px; }
  .ellipsis { padding: 4px; color: var(--secondary); text-align: center; font-family: var(--mono); }
  .controls { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; padding: 14px 24px; border-top: 1px solid var(--line); background: var(--panel); }
  .write { color: var(--surface); background: var(--ink); border-color: var(--ink); }
  .write:not(:disabled):hover { color: var(--surface); background: var(--accent); }
  .controls[data-overflow] .write { background: var(--danger); border-color: var(--danger); }
  .count { margin-left: auto; color: var(--secondary); font: 11px var(--mono); }
  :host(:fullscreen), :host([data-expanded]) { display: flex; align-items: safe center; justify-content: center; width: 100%; height: 100%; padding: 24px; margin: 0; overflow: auto; overscroll-behavior: contain; background: var(--surface); }
  :host([data-expanded]) { position: fixed; inset: 0; z-index: 2147483647; }
  :host(:fullscreen) figure, :host([data-expanded]) figure { max-width: 1100px; flex-shrink: 0; }
  @media (width < 600px) { header { padding: 16px 16px 0; } .body { padding: 16px; } .controls { padding: 14px 16px; } :host(:fullscreen), :host([data-expanded]) { padding: 10px; } }
  @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation: none !important; transition: none !important; } }
  ${PRESENTATION_STYLES}
`

class BufferOverflow extends HTMLElement {
  static observedAttributes = ["data-expanded"]

  attributeChangedCallback() {
    if (this.shadowRoot?.querySelector("[data-action=fullscreen]"))
      this.updateFullscreen()
  }

  private kind = "int"
  private layout: keyof typeof BASES = "stack"
  private intCapacity = 4
  private stringCapacity = 8
  private text = "HELLO WORLD"
  private step = 0
  private events?: AbortController
  private animations: Animation[] = []

  private get strings() {
    return this.kind === "string"
  }
  private get width() {
    return this.strings ? 1 : 4
  }
  private get capacity() {
    return this.strings ? this.stringCapacity : this.intCapacity
  }
  private get input() {
    return this.strings
      ? [...this.text].map((char) => char.charCodeAt(0)).concat(0)
      : NUMBERS
  }

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" })
    const root = this.shadowRoot!
    root.innerHTML = `
      <style>${css}</style>
      <figure aria-label="Interactive integer and string overflow sandbox">
        <header><h3>Overflow Sandbox</h3><button type="button" data-action="fullscreen" aria-label="Enter fullscreen" title="Fullscreen"></button></header>
        <div class="body">
          <div class="settings">
            <label>Memory<select data-setting="layout" aria-label="Memory layout"><option value="pie">PIE</option><option value="stack">Stack</option></select></label>
            <label>Type<select data-setting="kind" aria-label="Buffer type"><option value="int">int</option><option value="string">string</option></select></label>
            <label>Elements<select data-setting="int-capacity" aria-label="Integer buffer size">${[2, 4, 6].map((size) => `<option value="${size}">${size}</option>`).join("")}</select></label>
            <label>Capacity<select data-setting="string-capacity" aria-label="String buffer size">${[4, 8, 12].map((size) => `<option value="${size}">${size} bytes</option>`).join("")}</select></label>
            <label>Input<input data-setting="text" type="text" maxlength="24" spellcheck="false" autocomplete="off" aria-label="String to copy into the buffer, ASCII"></label>
          </div>
          <pre><code class="declaration"></code></pre>
          <div class="input-line"><span>Input</span><div class="incoming" aria-label="Values to write"></div></div>
          <div class="status" role="status" aria-live="polite" aria-atomic="true"><code class="statement"></code><span class="result"></span></div>
          <div class="memory" role="region" tabindex="0" aria-label="Buffer and neighboring data"></div>
        </div>
        <div class="controls">
          <button class="write" type="button" data-action="write">Write next ${icon("m6 4 4 4-4 4")}</button>
          <button type="button" data-action="undo">${icon("m10 4-4 4 4 4")} Undo</button>
          <button type="button" data-action="reset" aria-label="Reset memory">${icon("M3 6a5 5 0 1 1 0 4M3 2v4h4")} Reset</button>
          <span class="count"></span>
        </div>
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
        if (!action) return
        const before = this.step
        this.step =
          action === "reset"
            ? 0
            : Math.max(
                0,
                Math.min(
                  this.input.length,
                  this.step + (action === "write" ? 1 : -1),
                ),
              )
        this.render(action === "write" && this.step > before)
      },
      { signal },
    )
    root.addEventListener(
      "change",
      (event) => {
        const input = event.target as HTMLSelectElement
        if (input.tagName !== "SELECT") return
        if (input.dataset.setting === "layout")
          this.layout = input.value === "pie" ? "pie" : "stack"
        else {
          if (input.dataset.setting === "kind") this.kind = input.value
          if (input.dataset.setting === "int-capacity")
            this.intCapacity = Number(input.value)
          if (input.dataset.setting === "string-capacity")
            this.stringCapacity = Number(input.value)
          this.step = 0
        }
        this.render()
      },
      { signal },
    )
    root.querySelector<HTMLInputElement>("input")!.addEventListener(
      "input",
      (event) => {
        const input = event.target as HTMLInputElement
        this.text = input.value.replace(/[^\x20-\x7e]/g, "").slice(0, 24)
        input.value = this.text
        this.step = 0
        this.render()
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
    this.render()
    this.updateFullscreen()
  }

  disconnectedCallback() {
    this.events?.abort()
    this.cancelAnimations()
  }

  private render(animate = false) {
    this.cancelAnimations()
    const root = this.shadowRoot!
    const strings = this.strings
    const width = this.width
    const input = this.input
    const capacityBytes = this.capacity * width
    const end = START + capacityBytes
    const neighborBytes = Math.max(
      strings ? 8 : 16,
      (input.length - this.capacity) * width,
    )
    const size = Math.ceil((end + neighborBytes + 16) / 8) * 8
    const original = Array<number>(size).fill(0x61)
    original.fill(0, START, end)
    for (let i = 0; i < neighborBytes; i++) {
      original[end + i] = strings
        ? "SECRET!!".charCodeAt(i % 8)
        : littleEndian(NEIGHBORS[Math.floor(i / 4) % NEIGHBORS.length], 4)[
            i % 4
          ]
    }
    const memory = [...original]
    for (let i = 0; i < this.step; i++) {
      littleEndian(input[i], width).forEach((value, byte) => {
        memory[START + i * width + byte] = value
      })
    }
    const address = (offset: number) =>
      `0x${(BASES[this.layout] + offset).toString(16)}`
    const overwritten = Math.max(0, this.step * width - capacityBytes)
    const current = START + (this.step - 1) * width
    const attributes = (offset: number, span = 1) => {
      const buffer = offset >= START && offset < end
      const written = offset >= START && offset < START + this.step * width
      const overflow = written && offset >= end
      return `${buffer ? " data-buffer" : ""}${written ? " data-written" : ""}${overflow ? " data-overflow" : ""}${this.step > 0 && offset < current + width && offset + span > current ? " data-current" : ""}${offset === end ? " data-boundary" : ""}`
    }
    const owner = (offset: number) => {
      const labels: string[] = []
      if (offset <= START && offset + 8 > START) labels.push("buffer")
      if (offset <= end && offset + 8 > end) labels.push("neighbor")
      return labels.join(" / ")
    }
    const char = (value: number) =>
      value === 0
        ? "\\0"
        : value >= 32 && value <= 126
          ? String.fromCharCode(value)
          : "."
    const readInt = (bytes: number[], offset: number) =>
      bytes
        .slice(offset, offset + 4)
        .reduce((sum, value, i) => sum + value * 256 ** i, 0)
    const rows = Array.from({ length: size / 8 }, (_, row) =>
      this.layout === "stack" ? size - (row + 1) * 8 : row * 8,
    )
    if (this.layout === "stack") {
      root.querySelector(".memory")!.innerHTML =
        `<div class="stack" role="list"><div class="ellipsis" role="presentation">…</div>${rows
          .map((offset) => {
            const parts: string[] = []
            let column = 0
            while (column < 8) {
              const location = offset + column
              const data = location >= START && location < end + neighborBytes
              if (!data) {
                const span = Math.min(
                  8 - column,
                  location < START ? START - location : 8,
                )
                parts.push(
                  `<span class="unit" style="--span:${span}">${"a".repeat(span)}</span>`,
                )
                column += span
                continue
              }
              const span = strings ? 1 : 4
              const value = strings
                ? char(memory[location])
                : String(readInt(memory, location))
              const old = strings
                ? char(original[location])
                : String(readInt(original, location))
              const overwrittenHere =
                location >= end && location < START + this.step * width
              parts.push(
                `<span class="unit"${attributes(location, span)} style="--span:${span}" title="${address(location)}">${overwrittenHere ? `<del>${escapeHtml(old)}</del>` : ""}<span>${escapeHtml(value)}</span></span>`,
              )
              column += span
            }
            return `<div class="slot" role="listitem"><div class="slot-values">${parts.join("")}</div><span class="address"><span>${address(offset)}</span><span class="owner">${owner(offset)}</span></span></div>`
          })
          .join("")}<div class="ellipsis" role="presentation">…</div></div>`
    } else {
      root.querySelector(".memory")!.innerHTML =
        `<table><thead><tr><th scope="col">Address</th><th scope="col"><div class="bytes">${Array.from({ length: 8 }, (_, i) => `<span>+${i}</span>`).join("")}</div></th><th scope="col">ASCII</th></tr></thead><tbody>${rows
          .map(
            (offset) =>
              `<tr><td><span class="address"><span>${address(offset)}</span><span class="owner">${owner(offset)}</span></span></td><td><div class="bytes">${memory
                .slice(offset, offset + 8)
                .map((value, column) => {
                  const location = offset + column
                  const overwrittenHere =
                    location >= end && location < START + this.step * width
                  return `<span class="unit"${attributes(location)} title="${address(location)}">${overwrittenHere ? `<del>${original[location].toString(16).padStart(2, "0")}</del>` : ""}<span>${value.toString(16).padStart(2, "0")}</span></span>`
                })
                .join("")}</div></td><td class="ascii">${memory
                .slice(offset, offset + 8)
                .map(
                  (value, column) =>
                    `<span${attributes(offset + column)}>${escapeHtml(value >= 32 && value <= 126 ? String.fromCharCode(value) : ".")}</span>`,
                )
                .join("")}</td></tr>`,
          )
          .join("")}</tbody></table>`
    }
    root.querySelector(".declaration")!.textContent =
      `${strings ? "char" : "int"} buffer[${this.capacity}] = {0};`
    root.querySelector(".incoming")!.innerHTML = input
      .map(
        (value, i) =>
          `<span${i < this.step ? " data-done" : ""}${i === this.step - 1 ? " data-current" : ""}${i >= this.capacity ? " data-overflow" : ""}>${escapeHtml(strings ? char(value) : String(value))}</span>`,
      )
      .join("")
    root.querySelector(".statement")!.textContent =
      this.step === 0
        ? ""
        : `buffer[${this.step - 1}] = ${strings ? charLiteral(input[this.step - 1]) : input[this.step - 1]};`
    root.querySelector(".result")!.textContent = overwritten
      ? `Overflow · ${overwritten} byte${overwritten === 1 ? "" : "s"} overwritten`
      : this.step === 0
        ? ""
        : "Inside buffer"
    root
      .querySelector(".status")!
      .toggleAttribute("data-overflow", overwritten > 0)
    root
      .querySelector(".controls")!
      .toggleAttribute(
        "data-overflow",
        this.step >= this.capacity && this.step < input.length,
      )
    for (const setting of [
      "layout",
      "kind",
      "int-capacity",
      "string-capacity",
    ]) {
      const select = root.querySelector<HTMLSelectElement>(
        `[data-setting="${setting}"]`,
      )!
      select.value = String(
        setting === "layout"
          ? this.layout
          : setting === "kind"
            ? this.kind
            : setting === "int-capacity"
              ? this.intCapacity
              : this.stringCapacity,
      )
      select.closest<HTMLElement>("label")!.hidden =
        setting === "int-capacity"
          ? strings
          : setting === "string-capacity"
            ? !strings
            : false
    }
    const textInput = root.querySelector<HTMLInputElement>("input")!
    textInput.closest<HTMLElement>("label")!.hidden = !strings
    textInput.value = this.text
    root.querySelector<HTMLButtonElement>("[data-action=write]")!.disabled =
      this.step === input.length
    root.querySelector<HTMLButtonElement>("[data-action=undo]")!.disabled =
      this.step === 0
    root.querySelector<HTMLButtonElement>("[data-action=reset]")!.disabled =
      this.step === 0
    root.querySelector(".count")!.textContent = `${this.step} / ${input.length}`
    if (animate && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      root
        .querySelectorAll<HTMLElement>(".unit[data-current]")
        .forEach((cell, i) => {
          this.animations.push(
            cell.animate(
              [
                { opacity: 0.2, transform: "translateX(-10px) scale(.94)" },
                { opacity: 1, transform: "translateX(0) scale(1)" },
              ],
              {
                duration: 450,
                delay: i * 50,
                easing: "cubic-bezier(.2,.8,.2,1)",
                fill: "backwards",
              },
            ),
          )
        })
    }
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

if (!customElements.get("buffer-overflow"))
  customElements.define("buffer-overflow", BufferOverflow)
