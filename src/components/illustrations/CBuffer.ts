// A contiguous memory window with an embedded buffer: <c-buffer></c-buffer>.
import { PRESENTATION_STYLES } from "./presentation"
const MEMORY_BASES = { pie: 0x5555_5555_8000, stack: 0x7fff_ffff_e100 }
const BUFFER_OFFSET = 16
const CAPACITIES = [4, 8, 12, 16, 24]
const escapeHtml = (text: string) =>
  text.replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[char]!,
  )
const icon = (path: string) =>
  `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="${path}"/></svg>`

const styles = /* css */ `
  :host {
    --surface: var(--background, light-dark(#fcfcfc, #111111));
    --panel: var(--gray-2, light-dark(#f9f9f9, #191919));
    --ink: var(--foreground, light-dark(#202020, #eeeeee));
    --secondary: var(--muted-foreground, light-dark(#646464, #b4b4b4));
    --line: var(--border, light-dark(#d9d9d9, #3a3a3a));
    --ref-blue: light-dark(#235a83, #aed7ff);
    --ref-amber: light-dark(#854309, #f7c48c);
    --accent: var(--ref-blue);
    --terminator: var(--ref-amber);
    --highlight: color-mix(in oklab, var(--accent) 10%, var(--surface));
    --mono: var(--font-mono, monospace);
    display: block;
    margin: 0;
    color: var(--ink);
    font: 14px/1.5 var(--font-sans, system-ui, sans-serif);
    text-align: left;
    overflow-wrap: normal;
  }
  *, *::before, *::after { box-sizing: border-box; }
  [hidden] { display: none !important; }
  h3, p, figure { margin: 0; }
  button, input, select { font: inherit; color: inherit; }
  button { cursor: pointer; }
  button:disabled { opacity: .4; cursor: default; }
  :focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }
  figure { width: 100%; border: 1px solid var(--line); border-radius: 10px; overflow: clip; background: var(--surface); }
  :host-context(details[data-illustration]) figure { border: 0; border-radius: 0; }
  header { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 16px 24px 0; }
  h3 { font-size: 18px; font-weight: 600; }
  button { display: inline-flex; align-items: center; justify-content: center; gap: 7px; min-height: 36px; padding: 6px 11px; border: 1px solid var(--line); border-radius: 5px; background: var(--surface); font-size: 12px; }
  button:not(:disabled):hover { border-color: var(--accent); background: var(--highlight); }
  button svg { width: 14px; height: 14px; fill: none; stroke: currentColor; stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round; }
  .body { padding: 20px 24px; min-width: 0; }
  .settings { display: flex; flex-wrap: wrap; align-items: center; gap: 12px 18px; margin-bottom: 16px; }
  label { display: flex; align-items: center; gap: 8px; color: var(--secondary); font-size: 12px; }
  select, input { min-height: 34px; border: 1px solid var(--line); border-radius: 5px; padding: 5px 8px; background: var(--surface); color: var(--ink); font: 12px var(--mono); max-width: 100%; }
  input { width: 150px; }
  pre { padding: 16px; margin: 0 0 16px; border: 1px solid var(--line); border-radius: 6px; background: var(--panel); overflow-x: auto; }
  code { font-family: var(--mono); }
  pre code { font-size: 14px; white-space: pre; }
  .type { color: var(--accent); }
  .literal { color: var(--terminator); }
  .memory { overflow-x: auto; border-block: 1px solid var(--line); }
  table { width: 100%; border-collapse: collapse; min-width: 490px; table-layout: fixed; }
  th { font-weight: 400; text-align: left; }
  thead th { padding: 4px 8px 8px; font-size: 10px; color: var(--secondary); }
  th:first-child { width: 120px; }
  th:last-child { width: 96px; }
  tbody td { padding: 0 8px; border-top: 1px solid var(--line); }
  .range { display: grid; gap: 1px; font: 10px/1.6 var(--mono); color: var(--secondary); }
  .range span:first-child { color: var(--ink); }
  .range .buffer-start { color: var(--accent); font-weight: 600; }
  .bytes { display: grid; grid-template-columns: repeat(8, minmax(28px, 1fr)); }
  .byte { display: flex; justify-content: center; align-items: center; min-height: 48px; padding: 0; border: 0; border-radius: 0; background: var(--panel); color: var(--secondary); font: 12px var(--mono); }
  .byte[data-index] { background: var(--highlight); color: var(--accent); }
  .byte[data-active] { background: var(--accent); color: var(--surface); }
  .byte[data-active]:not(:disabled):hover { background: var(--accent); color: var(--surface); }
  .byte[data-null] { box-shadow: inset 0 -3px var(--terminator); }
  .ascii { white-space: pre; font: 12px var(--mono); color: var(--secondary); }
  .ascii span[data-index] { color: var(--accent); background: var(--highlight); }
  .ascii span[data-active] { color: var(--surface); background: var(--accent); }
  .memory[data-stack] { border: 0; }
  .stack-slots { display: grid; gap: 5px; }
  .stack-row { display: flex; align-items: center; gap: 16px; min-height: 54px; padding: 8px 14px; border: 1px solid var(--line); border-radius: 5px; background: var(--panel); }
  .stack-row[data-buffer] { border-color: var(--accent); background: var(--highlight); }
  .stack-value { display: flex; align-items: center; flex: 1; min-width: 0; font: 16px var(--mono); }
  .stack-filler { flex: var(--span) 1 0; color: var(--secondary); text-align: center; }
  .stack-element { flex: var(--span) 1 0; min-width: 0; min-height: 34px; padding: 3px 0; border: 0; background: transparent; color: var(--accent); font: 16px var(--mono); }
  .stack-element[data-active], .stack-element[data-active]:not(:disabled):hover { background: var(--accent); color: var(--surface); }
  .stack-element[data-null] { box-shadow: inset 0 -2px var(--terminator); }
  .stack-address { flex-shrink: 0; color: var(--secondary); font: 10px var(--mono); }
  .stack-ellipsis { padding: 4px 14px; color: var(--secondary); font: 16px var(--mono); text-align: center; }
  .controls { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; padding: 14px 24px; border-top: 1px solid var(--line); background: var(--panel); }
  .play { min-width: 80px; background: var(--ink); color: var(--surface); border-color: var(--ink); }
  .play:not(:disabled):hover { background: var(--accent); color: var(--surface); }
  .position { margin-left: auto; color: var(--secondary); font: 11px var(--mono); }
  :host(:fullscreen), :host([data-expanded]) { display: flex; align-items: safe center; justify-content: center; width: 100%; height: 100%; margin: 0; padding: 24px; overflow: auto; overscroll-behavior: contain; background: var(--surface); }
  :host([data-expanded]) { position: fixed; inset: 0; z-index: 2147483647; }
  :host(:fullscreen) figure, :host([data-expanded]) figure { max-width: 1100px; flex-shrink: 0; }
  :host(:fullscreen) .byte, :host([data-expanded]) .byte { min-height: 42px; font-size: 16px; }
  @media (width < 600px) {
    header { padding: 16px 16px 0; }
    .body { padding: 16px; }
    .controls { padding: 14px 16px; }
    :host(:fullscreen), :host([data-expanded]) { padding: 10px; }
  }
  @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation: none !important; transition: none !important; } }
  ${PRESENTATION_STYLES}
`

class CBuffer extends HTMLElement {
  static observedAttributes = ["data-expanded"]

  attributeChangedCallback() {
    if (this.shadowRoot?.querySelector("[data-action=fullscreen]"))
      this.updateFullscreen()
  }

  private memoryType: keyof typeof MEMORY_BASES = "pie"
  private kind = "int"
  private count = 5
  private capacity = 8
  private text = "hello"
  private selected = 0
  private playing = false
  private timer?: ReturnType<typeof setTimeout>
  private events?: AbortController
  private animations: Animation[] = []

  private get strings() {
    return this.kind === "string"
  }
  private get width() {
    return this.strings ? 1 : 4
  }
  private get length() {
    return this.strings ? this.capacity : this.count
  }

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" })
    const root = this.shadowRoot!
    root.innerHTML = `
      <style>${styles}</style>
      <figure aria-label="A C buffer inside contiguous memory">
        <header><h3>Buffers</h3><button type="button" data-action="fullscreen" aria-label="Enter fullscreen" title="Fullscreen"></button></header>
        <div class="body">
          <div class="settings">
              <label>Memory<select data-setting="memory" aria-label="Memory layout"><option value="pie">PIE</option><option value="stack">Stack</option></select></label>
              <label>Type<select data-setting="kind" aria-label="Buffer type"><option value="int">int</option><option value="string">string</option></select></label>
              <label>Text<input type="text" data-setting="text" spellcheck="false" autocomplete="off" aria-label="String contents, ASCII"></label>
              <label>Capacity<select data-setting="capacity" aria-label="String buffer capacity">${CAPACITIES.map((size) => `<option value="${size}">${size} bytes</option>`).join("")}</select></label>
              <label>Elements<select data-setting="count" aria-label="Integer buffer element count">${[3, 5, 8].map((size) => `<option value="${size}">${size}</option>`).join("")}</select></label>
          </div>
          <pre aria-label="C declaration"><code class="source"></code></pre>
          <div class="memory" tabindex="0" role="region" aria-label="Contiguous memory dump with eight bytes per row">
            <table>
              <thead><tr><th scope="col" class="address-heading">Address ↓</th><th scope="col"><div class="bytes">${Array.from({ length: 8 }, (_, i) => `<span>+${i}</span>`).join("")}</div></th><th scope="col">ASCII</th></tr></thead>
              <tbody></tbody>
            </table>
            <div class="stack-slots" role="list" aria-label="Stack slots" hidden></div>
          </div>
        </div>
        <div class="controls" role="group" aria-label="Buffer animation controls">
          <button type="button" class="play" data-action="play"></button>
          <button type="button" data-action="back" aria-label="Previous element">${icon("m10 4-4 4 4 4")} Back</button>
          <button type="button" data-action="next" aria-label="Next element">Step ${icon("m6 4 4 4-4 4")}</button>
          <button type="button" data-action="reset" aria-label="Reset selection" title="Reset">${icon("M3 6a5 5 0 1 1 0 4M3 2v4h4")}</button>
          <span class="position"></span>
        </div>
      </figure>`
    this.events?.abort()
    this.events = new AbortController()
    const { signal } = this.events
    root.addEventListener(
      "click",
      (event) => {
        const target = event.target as Element
        const action =
          target.closest<HTMLButtonElement>("[data-action]")?.dataset.action
        if (action === "fullscreen") {
          void this.toggleFullscreen()
          return
        }
        if (action === "play") {
          if (this.playing) this.pause()
          else {
            if (this.selected === this.length - 1) this.select(0)
            this.playing = true
            this.updateControls()
            this.schedule()
          }
          return
        }
        const row = target.closest<HTMLElement>("[data-index]")
        if (row || action) {
          this.pause()
          this.select(
            row
              ? Number(row.dataset.index)
              : action === "reset"
                ? 0
                : this.selected + (action === "next" ? 1 : -1),
            true,
          )
        }
      },
      { signal },
    )
    root.addEventListener(
      "change",
      (event) => {
        const setting = event.target as HTMLSelectElement
        if (setting.tagName !== "SELECT") return
        this.pause()
        if (setting.dataset.setting === "memory")
          this.memoryType = setting.value === "stack" ? "stack" : "pie"
        if (setting.dataset.setting === "kind") this.kind = setting.value
        if (setting.dataset.setting === "count")
          this.count = Number(setting.value)
        if (setting.dataset.setting === "capacity")
          this.capacity = Number(setting.value)
        this.selected = 0
        this.renderMemory(true)
      },
      { signal },
    )
    root.querySelector<HTMLInputElement>("input")?.addEventListener(
      "input",
      (event) => {
        const input = event.target as HTMLInputElement
        this.pause()
        this.text = input.value
          .replace(/[^\x20-\x7e]/g, "")
          .slice(0, this.capacity - 1)
        input.value = this.text
        this.selected = 0
        this.renderMemory(true)
      },
      { signal },
    )
    document.addEventListener(
      "fullscreenchange",
      () => this.updateFullscreen(),
      { signal },
    )
    document.addEventListener(
      "visibilitychange",
      () => {
        if (document.hidden) this.pause()
      },
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
    const panel = this.closest<HTMLDetailsElement>("details[data-illustration]")
    panel?.addEventListener(
      "toggle",
      () => {
        if (!panel.open) this.pause()
      },
      { signal },
    )
    this.renderMemory()
    this.updateFullscreen()
  }

  disconnectedCallback() {
    this.pause()
    this.events?.abort()
    this.cancelAnimations()
  }

  private renderMemory(animate = false) {
    this.cancelAnimations()
    const root = this.shadowRoot!
    const address = (offset: number) =>
      `0x${(MEMORY_BASES[this.memoryType] + offset).toString(16)}`
    const width = this.width
    const total = this.length * width
    const type = this.strings ? "char" : "int"
    const values = Array.from({ length: this.length }, (_, i) =>
      this.strings ? this.text.charCodeAt(i) || 0 : (i + 1) * 10,
    )
    root.querySelector(".source")!.innerHTML = this.strings
      ? `<span class="type">char</span> buffer[${this.capacity}] = <span class="literal">${escapeHtml(JSON.stringify(this.text))}</span>;`
      : `<span class="type">${type}</span> buffer[${this.count}] = {<span class="literal">${values.join(", ")}</span>};`
    root.querySelector(".address-heading")!.textContent =
      this.memoryType === "stack" ? "Stack grows ↓" : "Address ↓"
    root.querySelector<HTMLSelectElement>("[data-setting=memory]")!.value =
      this.memoryType
    const windowSize = Math.ceil((BUFFER_OFFSET + total + 16) / 8) * 8
    const stack = this.memoryType === "stack"
    const memoryRegion = root.querySelector<HTMLElement>(".memory")!
    memoryRegion.toggleAttribute("data-stack", stack)
    memoryRegion.setAttribute(
      "aria-label",
      stack ? "Stack view" : "Contiguous memory dump with eight bytes per row",
    )
    root.querySelector<HTMLTableElement>("table")!.hidden = stack
    root.querySelector<HTMLElement>(".stack-slots")!.hidden = !stack
    const memory = Array<number>(windowSize).fill(stack ? 0x61 : 0x64)
    values.forEach((value, index) => {
      for (let byte = 0; byte < width; byte++) {
        memory[BUFFER_OFFSET + index * width + byte] =
          Math.floor(value / 256 ** byte) % 256
      }
    })
    root.querySelector("tbody")!.innerHTML = Array.from(
      { length: windowSize / 8 },
      (_, row) => {
        const offset =
          this.memoryType === "stack" ? windowSize - (row + 1) * 8 : row * 8
        const cells = memory.slice(offset, offset + 8).map((value, column) => {
          const location = offset + column
          const inBuffer =
            location >= BUFFER_OFFSET && location < BUFFER_OFFSET + total
          const index = Math.floor((location - BUFFER_OFFSET) / width)
          const terminator =
            this.strings && location === BUFFER_OFFSET + this.text.length
          const attrs = inBuffer
            ? ` data-index="${index}"${terminator ? " data-null" : ""}`
            : ""
          const hex = value.toString(16).padStart(2, "0")
          const title = `${address(location)}${inBuffer ? ` · buffer[${index}]${terminator ? " · null terminator" : ""}` : " · surrounding memory"}`
          return {
            hex: inBuffer
              ? `<button type="button" class="byte"${attrs} title="${title}" aria-label="${title}: ${hex}">${hex}</button>`
              : `<span class="byte" title="${title}">${hex}</span>`,
            ascii: `<span${attrs} title="${title}">${escapeHtml(value >= 32 && value <= 126 ? String.fromCharCode(value) : ".")}</span>`,
          }
        })
        return `<tr><td><div class="range"><span>${address(offset)}</span><span>${offset ? `addr + ${offset}` : "addr"}</span>${offset === BUFFER_OFFSET ? '<span class="buffer-start">← buffer</span>' : ""}</div></td><td><div class="bytes">${cells.map((cell) => cell.hex).join("")}</div></td><td class="ascii">${cells.map((cell) => cell.ascii).join("")}</td></tr>`
      },
    ).join("")
    root.querySelector(".stack-slots")!.innerHTML = stack
      ? `<div class="stack-ellipsis" role="presentation">…</div>${Array.from(
          { length: windowSize / 8 },
          (_, row) => {
            const offset = windowSize - (row + 1) * 8
            const parts: string[] = []
            let column = 0
            while (column < 8) {
              const location = offset + column
              const inBuffer =
                location >= BUFFER_OFFSET && location < BUFFER_OFFSET + total
              if (inBuffer) {
                const index = Math.floor((location - BUFFER_OFFSET) / width)
                const span = Math.min(width, 8 - column)
                const terminator = this.strings && index === this.text.length
                const label = this.strings
                  ? index < this.text.length
                    ? this.text[index]
                    : "\\0"
                  : String(values[index])
                parts.push(
                  `<button type="button" class="stack-element" data-index="${index}"${terminator ? " data-null" : ""} style="--span:${span}" title="${address(location)} · buffer[${index}]" aria-label="buffer[${index}]: ${escapeHtml(label)}">${escapeHtml(label)}</button>`,
                )
                column += span
              } else {
                const span = Math.min(
                  8 - column,
                  location < BUFFER_OFFSET ? BUFFER_OFFSET - location : 8,
                )
                parts.push(
                  `<span class="stack-filler" style="--span:${span}">${"a".repeat(span)}</span>`,
                )
                column += span
              }
            }
            const containsBuffer =
              offset < BUFFER_OFFSET + total && offset + 8 > BUFFER_OFFSET
            return `<div class="stack-row" role="listitem"${containsBuffer ? " data-buffer" : ""}><div class="stack-value">${parts.join("")}</div><span class="stack-address">${address(offset)}</span></div>`
          },
        ).join("")}<div class="stack-ellipsis" role="presentation">…</div>`
      : ""
    root.querySelector<HTMLSelectElement>("[data-setting=kind]")!.value =
      this.kind
    for (const setting of ["text", "capacity", "count"]) {
      root
        .querySelector<HTMLElement>(`[data-setting=${setting}]`)!
        .closest<HTMLElement>("label")!.hidden =
        setting === "count" ? this.strings : !this.strings
    }
    if (this.strings) {
      const input = root.querySelector<HTMLInputElement>("input")!
      input.value = this.text
      input.maxLength = this.capacity - 1
      const select = root.querySelector<HTMLSelectElement>(
        "[data-setting=capacity]",
      )!
      select.value = String(this.capacity)
      for (const option of select.options)
        option.disabled = Number(option.value) < this.text.length + 1
    } else {
      root.querySelector<HTMLSelectElement>("[data-setting=count]")!.value =
        String(this.count)
    }
    this.select(this.selected, animate)
  }

  private select(index: number, animate = false) {
    this.cancelAnimations()
    this.selected = Math.max(0, Math.min(this.length - 1, index))
    const root = this.shadowRoot!
    root.querySelectorAll<HTMLElement>("[data-index]").forEach((row) => {
      const active = Number(row.dataset.index) === this.selected
      row.toggleAttribute("data-active", active)
      if (row.tagName === "BUTTON")
        row.setAttribute("aria-pressed", String(active))
    })
    this.updateControls()
    if (animate && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      root
        .querySelectorAll<HTMLElement>(
          `${this.memoryType === "stack" ? ".stack-element" : ".byte"}[data-index="${this.selected}"]`,
        )
        .forEach((byte, i) => {
          this.animations.push(
            byte.animate(
              [
                { opacity: 0.25, transform: "translateY(6px)" },
                { opacity: 1, transform: "translateY(0)" },
              ],
              {
                duration: 350,
                delay: i * 45,
                easing: "ease-out",
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

  private updateControls() {
    const root = this.shadowRoot
    if (!root) return
    const end = this.selected === this.length - 1
    const play = root.querySelector<HTMLButtonElement>("[data-action=play]")!
    play.innerHTML = this.playing
      ? `${icon("M5 3v10M11 3v10")} Pause`
      : `${icon("m5 3 8 5-8 5Z")} ${end ? "Replay" : "Play"}`
    play.setAttribute(
      "aria-label",
      this.playing
        ? "Pause animation"
        : end
          ? "Replay animation"
          : "Play animation",
    )
    root.querySelector<HTMLButtonElement>("[data-action=back]")!.disabled =
      this.selected === 0
    root.querySelector<HTMLButtonElement>("[data-action=next]")!.disabled = end
    root.querySelector<HTMLButtonElement>("[data-action=reset]")!.disabled =
      this.selected === 0 && !this.playing
    root.querySelector(".position")!.textContent =
      `${this.selected + 1} / ${this.length}`
  }

  private schedule() {
    clearTimeout(this.timer)
    this.timer = setTimeout(() => {
      this.select(this.selected + 1, true)
      if (this.selected === this.length - 1) this.pause()
      else this.schedule()
    }, 1200)
  }

  private pause() {
    clearTimeout(this.timer)
    this.playing = false
    this.updateControls()
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

if (!customElements.get("c-buffer")) customElements.define("c-buffer", CBuffer)
