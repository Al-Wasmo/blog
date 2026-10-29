// Preserve the supplied snapshot as strings, including the high vsyscall addresses.
import { PRESENTATION_STYLES } from "./presentation"
const SNAPSHOT = `
0x555555554000 0x555555555000 r--p 1000 0 exp1
0x555555555000 0x555555556000 r-xp 1000 1000 exp1
0x555555556000 0x555555557000 r--p 1000 2000 exp1
0x555555557000 0x555555558000 r--p 1000 2000 exp1
0x555555558000 0x555555559000 rw-p 1000 3000 exp1
0x555555559000 0x55555557a000 rw-p 21000 0 [heap]
0x7ffff7c00000 0x7ffff7c28000 r--p 28000 0 /usr/lib/x86_64-linux-gnu/libc.so.6
0x7ffff7c28000 0x7ffff7db1000 r-xp 189000 28000 /usr/lib/x86_64-linux-gnu/libc.so.6
0x7ffff7db1000 0x7ffff7e00000 r--p 4f000 1b1000 /usr/lib/x86_64-linux-gnu/libc.so.6
0x7ffff7e00000 0x7ffff7e04000 r--p 4000 1ff000 /usr/lib/x86_64-linux-gnu/libc.so.6
0x7ffff7e04000 0x7ffff7e06000 rw-p 2000 203000 /usr/lib/x86_64-linux-gnu/libc.so.6
0x7ffff7e06000 0x7ffff7e13000 rw-p d000 0 [anon_7ffff7e06]
0x7ffff7fa3000 0x7ffff7fa6000 rw-p 3000 0 [anon_7ffff7fa3]
0x7ffff7fbd000 0x7ffff7fbf000 rw-p 2000 0 [anon_7ffff7fbd]
0x7ffff7fbf000 0x7ffff7fc1000 r--p 2000 0 [vvar]
0x7ffff7fc1000 0x7ffff7fc3000 r--p 2000 0 [vvar_vclock]
0x7ffff7fc3000 0x7ffff7fc5000 r-xp 2000 0 [vdso]
0x7ffff7fc5000 0x7ffff7fc6000 r--p 1000 0 /usr/lib/x86_64-linux-gnu/ld-linux-x86-64.so.2
0x7ffff7fc6000 0x7ffff7ff1000 r-xp 2b000 1000 /usr/lib/x86_64-linux-gnu/ld-linux-x86-64.so.2
0x7ffff7ff1000 0x7ffff7ffb000 r--p a000 2c000 /usr/lib/x86_64-linux-gnu/ld-linux-x86-64.so.2
0x7ffff7ffb000 0x7ffff7ffd000 r--p 2000 36000 /usr/lib/x86_64-linux-gnu/ld-linux-x86-64.so.2
0x7ffff7ffd000 0x7ffff7fff000 rw-p 2000 38000 /usr/lib/x86_64-linux-gnu/ld-linux-x86-64.so.2
0x7ffffffdd000 0x7ffffffff000 rw-p 22000 0 [stack]
0xffffffffff600000 0xffffffffff601000 --xp 1000 0 [vsyscall]
`

// The presenter controls the pace; keep each slide focused on one visual change.
const STEPS = [
  { mode: "all", title: "Process Memory Map" },
  { mode: "pie", title: "PIE · exp1" },
  { mode: "dim", title: "Process Memory Map" },
  { mode: "filtered", title: "exp1 + Stack" },
  { mode: "permissions", title: "Permissions" },
  { mode: "exp1", title: "exp1" },
  { mode: "stack", title: "Stack" },
  { mode: "all", title: "Process Memory Map" },
]

const MAPPINGS = SNAPSHOT.trim()
  .split("\n")
  .map((line) => {
    const [start, end, permissions, size, offset, file] = line
      .trim()
      .split(/\s+/)
    const relevant = file === "exp1" || file === "[stack]"
    const category =
      file === "[stack]"
        ? "stack"
        : file === "[heap]"
          ? "heap"
          : permissions.includes("w") && permissions.includes("x")
            ? "wx"
            : permissions.includes("x")
              ? "code"
              : permissions.includes("w")
                ? "data"
                : "rodata"
    return { start, end, permissions, size, offset, file, relevant, category }
  })

const PIE_MAPPINGS = MAPPINGS.filter((mapping) => mapping.file === "exp1")
const PIE_LABELS = [
  "ELF header",
  "Executable page",
  "Read-only page 1",
  "Read-only page 2",
  "Writable data",
]

const icon = (path: string) =>
  `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="${path}"/></svg>`

const styles = /* css */ `
  :host {
    --surface: var(--background, light-dark(#fcfcfc, #111111));
    --panel: var(--gray-2, light-dark(#f9f9f9, #191919));
    --ink: var(--foreground, light-dark(#202020, #eeeeee));
    --secondary: var(--muted-foreground, light-dark(#646464, #b4b4b4));
    --line: var(--border, light-dark(#d9d9d9, #3a3a3a));
    --box: var(--destructive, light-dark(#ce2c31, #ff9592));
    --box-fill: color-mix(in oklab, var(--box) 6%, var(--surface));
    /* Exact solid text and background colors sampled from the supplied terminal. */
    --map-bg: #1e1e2e;
    --map-rodata: #cdd6f4;
    --map-heap: #89b4fa;
    --map-code: #f38ba8;
    --map-data: #f5c2e7;
    --map-stack: #f9e2af;
    --mono: var(--font-mono, monospace);
    display: block; margin: 0; color: var(--ink); text-align: left;
    font: 14px/1.5 var(--font-sans, system-ui, sans-serif);
  }
  *, *::before, *::after { box-sizing: border-box; }
  [hidden] { display: none !important; }
  figure, h3, p { margin: 0; }
  figure { width: 100%; border: 1px solid var(--line); border-radius: 10px; background: var(--surface); overflow: clip; }
  :host-context(details[data-illustration]) figure { border: 0; border-radius: 0; }
  header { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 16px 24px 0; }
  h3 { font-size: 18px; font-weight: 600; }
  button { display: inline-flex; align-items: center; justify-content: center; gap: 7px; min-height: 36px; padding: 6px 11px; border: 1px solid var(--line); border-radius: 5px; background: var(--surface); color: inherit; font: 12px var(--font-sans, system-ui, sans-serif); cursor: pointer; }
  button:not(:disabled):hover { background: var(--panel); border-color: var(--ink); }
  button:disabled { opacity: .4; cursor: default; }
  button svg { width: 14px; height: 14px; fill: none; stroke: currentColor; stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round; }
  :focus-visible { outline: 2px solid var(--box); outline-offset: 3px; }
  .body { padding: 20px 24px; }
  .map { overflow: auto; max-height: none; border: 1px solid var(--line); border-radius: 6px; background: var(--map-bg); color: var(--map-rodata); --box: var(--map-code); --box-fill: color-mix(in oklab, var(--map-code) 6%, var(--map-bg)); }
  .map-legend { display: flex; flex-wrap: wrap; align-items: center; gap: 7px; padding: 10px 12px; border-bottom: 1px solid color-mix(in oklab, var(--map-rodata) 20%, var(--map-bg)); }
  .map-legend span { padding: 3px 7px; border: 1px solid color-mix(in oklab, currentColor 45%, var(--map-bg)); border-radius: 4px; font: 700 10px var(--mono); }
  .memory-overview { min-width: 950px; padding: 12px 14px; border-bottom: 1px solid color-mix(in oklab, var(--map-rodata) 20%, var(--map-bg)); }
  .overview-axis { display: flex; justify-content: space-between; color: color-mix(in oklab, var(--map-rodata) 68%, var(--map-bg)); font: 10px var(--mono); text-transform: uppercase; }
  .overview-regions { display: grid; gap: 4px; margin: 6px 0; }
  .overview-region { display: grid; grid-template-columns: minmax(135px, .7fr) minmax(0, 2fr) minmax(65px, .35fr); align-items: center; gap: 12px; min-height: 29px; padding: 4px 9px; border: 1px solid color-mix(in oklab, currentColor 38%, var(--map-bg)); border-left: 4px solid currentColor; border-radius: 4px; background: color-mix(in oklab, currentColor 6%, var(--map-bg)); color: var(--map-rodata); font: 12px var(--mono); }
  .overview-region[data-category=stack] { color: var(--map-stack); }
  .overview-region[data-category=heap] { color: var(--map-heap); }
  .overview-region[data-category=code] { color: var(--map-code); }
  .overview-region[data-category=data] { color: var(--map-data); }
  .overview-region strong { font-weight: 650; }
  .overview-range { color: var(--map-rodata); }
  .overview-permissions { text-align: right; }
  .overview-gap { color: color-mix(in oklab, var(--map-rodata) 55%, var(--map-bg)); text-align: center; font: 12px var(--mono); }
  .memory-overview[data-dim] .overview-region:not([data-relevant]) { opacity: .28; }
  [data-category=stack] { color: var(--map-stack); }
  [data-category=heap] { color: var(--map-heap); }
  [data-category=code], [data-category=wx] { color: var(--map-code); }
  [data-category=data] { color: var(--map-data); }
  [data-category=rodata] { color: var(--map-rodata); }
  [data-category=wx] { text-decoration: underline; }
  table { width: 100%; min-width: 1160px; table-layout: fixed; border-collapse: separate; border-spacing: 0; font: 14px/1.35 var(--mono); white-space: nowrap; }
  th { position: sticky; top: 0; z-index: 1; padding: 10px 12px; text-align: right; font-weight: 500; background: var(--map-bg); color: var(--map-rodata); border-bottom: 1px solid color-mix(in oklab, var(--map-rodata) 25%, var(--map-bg)); }
  th:last-child { text-align: left; }
  td { padding: 4px 12px; border-top: 2px solid transparent; border-bottom: 2px solid transparent; text-align: right; font-variant-numeric: tabular-nums; transition: background-color 250ms, color 250ms, opacity 300ms; }
  td:first-child { border-left: 2px solid transparent; }
  td:last-child { border-right: 2px solid transparent; text-align: left; }
  tr[data-muted] { color: var(--map-rodata); background: var(--map-bg); }
  tr[data-muted] td { opacity: .45; }
  tr[data-box] td { background: var(--box-fill); }
  tr[data-box] td:first-child { border-left-color: var(--box); }
  tr[data-box] td:last-child { border-right-color: var(--box); }
  tr[data-box-start] td { border-top-color: var(--box); }
  tr[data-box-end] td { border-bottom-color: var(--box); }
  tr[data-category=stack] td:first-child { border-left: 4px solid var(--map-stack); }
  tr[data-category=heap] td:first-child { border-left: 4px solid var(--map-heap); }
  tr[data-category=code] td:first-child, tr[data-category=wx] td:first-child { border-left: 4px solid var(--map-code); }
  tr[data-category=data] td:first-child { border-left: 4px solid var(--map-data); }
  tr[data-category=rodata] td:first-child { border-left: 4px solid var(--map-rodata); }
  .pie-view { display: grid; grid-template-rows: auto minmax(0, 1fr) auto; gap: 20px; padding: 24px; border: 1px solid var(--line); border-radius: 8px; background: var(--map-bg); color: var(--map-rodata); }
  .pie-intro { display: flex; align-items: center; justify-content: space-between; gap: 18px; }
  .pie-title { display: grid; gap: 5px; }
  .pie-title span, .pie-note, .pie-page small { color: color-mix(in oklab, var(--map-rodata) 72%, var(--map-bg)); }
  .pie-title strong { color: var(--map-code); font: 700 24px var(--mono); }
  .pie-base { padding: 12px 16px; border: 1px solid color-mix(in oklab, var(--map-code) 65%, var(--map-bg)); border-radius: 7px; color: var(--map-code); font: 700 18px var(--mono); white-space: nowrap; }
  .pie-base small { display: block; margin-bottom: 4px; color: color-mix(in oklab, var(--map-rodata) 72%, var(--map-bg)); font: 12px var(--font-sans, system-ui, sans-serif); }
  .pie-pages { display: grid; grid-template-rows: repeat(5, minmax(0, 1fr)); gap: 8px; }
  .pie-page { display: grid; grid-template-columns: minmax(0, 1fr) minmax(100px, .45fr); align-content: center; align-items: center; gap: 5px 14px; padding: 10px 14px; border: 1px solid color-mix(in oklab, currentColor 38%, var(--map-bg)); border-left: 5px solid currentColor; border-radius: 6px; background: color-mix(in oklab, currentColor 5%, var(--map-bg)); }
  .pie-page[data-category=code] { color: var(--map-code); }
  .pie-page[data-category=data] { color: var(--map-data); }
  .pie-page[data-category=rodata] { color: var(--map-rodata); }
  .pie-range { display: flex; align-items: center; justify-content: space-between; gap: 10px; color: var(--map-rodata); font: 13px var(--mono); }
  .pie-bar { grid-column: 1 / -1; height: 12px; overflow: hidden; border-radius: 999px; background: color-mix(in oklab, currentColor 16%, var(--map-bg)); }
  .pie-bar span { display: block; width: 100%; height: 100%; border-radius: inherit; background: currentColor; opacity: .75; }
  .pie-permissions { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
  .pie-permissions code { color: currentColor; font: 700 15px var(--mono); }
  .pie-note { margin: 0; font-size: 14px; }
  .permission-view { display: grid; align-items: center; padding: 36px 24px; border-radius: 6px; background: var(--map-bg); color: var(--map-rodata); }
  .permission-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 20px; }
  .permission { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px; min-height: 240px; text-align: center; }
  .permission code { font: 72px/1 var(--mono); }
  .permission span { font-size: 20px; }
  .permission small { font-size: 13px; }
  .controls { display: flex; align-items: center; gap: 8px; padding: 14px 24px; border-top: 1px solid var(--line); background: var(--panel); }
  .count { margin-left: auto; color: var(--secondary); font: 11px var(--mono); }
  :host(:fullscreen), :host([data-expanded]) { display: flex; align-items: safe center; justify-content: center; width: 100%; height: 100%; margin: 0; padding: 24px; overflow: auto; overscroll-behavior: contain; background: var(--surface); }
  :host([data-expanded]) { position: fixed; inset: 0; z-index: 2147483647; }
  :host(:fullscreen) figure, :host([data-expanded]) figure { max-width: 1500px; flex-shrink: 0; }
  @media (width < 600px) { header { padding: 16px 16px 0; } .body { padding: 16px; } .controls { padding: 14px 16px; } :host(:fullscreen), :host([data-expanded]) { padding: 10px; } }
  @media (prefers-reduced-motion: reduce) { td { transition: none; } }
  ${PRESENTATION_STYLES}
  .map, :host(:is(:fullscreen, [data-expanded])) .map { max-height: none; }
  :host(:is(:fullscreen, [data-expanded])) .pie-view { gap: 26px; padding: 36px; }
  :host(:is(:fullscreen, [data-expanded])) .pie-title strong { font-size: 34px; }
  :host(:is(:fullscreen, [data-expanded])) .pie-title span, :host(:is(:fullscreen, [data-expanded])) .pie-note { font-size: 18px; }
  :host(:is(:fullscreen, [data-expanded])) .pie-base { padding: 16px 20px; font-size: 23px; }
  :host(:is(:fullscreen, [data-expanded])) .pie-page { padding: 14px 18px; }
  :host(:is(:fullscreen, [data-expanded])) .pie-range { font-size: 16px; }
  :host(:is(:fullscreen, [data-expanded])) .pie-permissions code { font-size: 18px; }
  :host(:is(:fullscreen, [data-expanded])) .pie-page small { font-size: 15px; }
  :host(:is(:fullscreen, [data-expanded])) .overview-region { min-height: 34px; font-size: 14px; }
  :host(:is(:fullscreen, [data-expanded])) .overview-axis { font-size: 12px; }
  :host(:is(:fullscreen, [data-expanded])) table { font-size: 15px; }
  @media (width < 700px) { .pie-intro { align-items: flex-start; flex-direction: column; } .pie-base { align-self: stretch; text-align: center; } .pie-view { padding: 14px; } .pie-range { flex-wrap: wrap; font-size: 11px; } }
  :host(:is(:fullscreen, [data-expanded])) .permission { min-height: 340px; }
  :host(:is(:fullscreen, [data-expanded])) .permission code { font-size: clamp(80px, 8vw, 120px); }
  :host(:is(:fullscreen, [data-expanded])) .permission span { font-size: 28px; }
  :host(:is(:fullscreen, [data-expanded])) .permission small { font-size: 17px; }
  @media (width < 600px) { .permission-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } .permission { min-height: 170px; } }
`

class ProcessMemoryMap extends HTMLElement {
  static observedAttributes = ["data-expanded"]

  attributeChangedCallback() {
    if (this.shadowRoot?.querySelector("[data-action=fullscreen]"))
      this.updateFullscreen()
  }

  private step = 0
  private events?: AbortController
  private animations: Animation[] = []
  private transition = 0

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" })
    const root = this.shadowRoot!
    root.innerHTML = `
      <style>${styles}</style>
      <figure aria-label="Process memory map of exp1">
        <header><h3>Process Memory Map</h3><button type="button" data-action="fullscreen" aria-label="Enter fullscreen" title="Fullscreen"></button></header>
        <div class="body">
          <div class="pie-view" role="region" aria-label="PIE image mappings for exp1" hidden>
            <div class="pie-intro">
              <div class="pie-title"><strong>PIE image · exp1</strong><span>Five mapped pages in this process snapshot</span></div>
              <div class="pie-base"><small>Load base</small>0x555555554000</div>
            </div>
            <div class="pie-pages">${PIE_MAPPINGS.map(
              (mapping, index) => `<div class="pie-page" data-category="${mapping.category}">
                <div class="pie-range"><strong>${PIE_LABELS[index]}</strong><code>${mapping.start} → ${mapping.end}</code></div>
                <div class="pie-permissions"><code>${mapping.permissions}</code><small>size 0x${mapping.size} · offset 0x${mapping.offset}</small></div>
                <div class="pie-bar" aria-hidden="true"><span></span></div>
              </div>`,
            ).join("")}</div>
            <p class="pie-note">Each block is one 0x1000-byte mapping. PIE and ASLR can move this image in another run.</p>
          </div>
          <div class="map" role="region" tabindex="0" aria-label="All process memory mappings">
            <div class="map-legend" aria-label="Memory region colors">
              <span data-category="stack">STACK</span><span data-category="heap">HEAP</span><span data-category="code">CODE</span><span data-category="data">DATA</span><span data-category="wx">WX</span><span data-category="rodata">RODATA</span>
            </div>
            <div class="memory-overview" aria-label="Address space overview, grouped and not to scale">
              <div class="overview-axis"><span>Higher addresses</span><span>↓</span></div>
              <div class="overview-regions">
                <div class="overview-region" data-category="code"><strong>[vsyscall]</strong><span class="overview-range">0xffffffffff600000 – 0xffffffffff601000</span><span class="overview-permissions">--xp</span></div>
                <div class="overview-gap">··· large unmapped range ···</div>
                <div class="overview-region" data-category="stack" data-relevant><strong>[stack]</strong><span class="overview-range">0x7ffffffdd000 – 0x7ffffffff000</span><span class="overview-permissions">rw-p</span></div>
                <div class="overview-gap">··· shared libraries and kernel maps ···</div>
                <div class="overview-region" data-category="rodata"><strong>libc · anon · loader · vvar · vdso</strong><span class="overview-range">0x7ffff7c00000 – 0x7ffff7fff000</span><span class="overview-permissions">r--p / r-xp / rw-p</span></div>
                <div class="overview-gap">··· large unmapped range ···</div>
                <div class="overview-region" data-category="heap"><strong>[heap]</strong><span class="overview-range">0x555555559000 – 0x55555557a000</span><span class="overview-permissions">rw-p</span></div>
                <div class="overview-region" data-category="code" data-relevant><strong>exp1 · PIE image</strong><span class="overview-range">0x555555554000 – 0x555555559000</span><span class="overview-permissions">r--p / r-xp / rw-p</span></div>
              </div>
              <div class="overview-axis"><span>↓</span><span>Lower addresses · grouped view, not to scale</span></div>
            </div>
            <table>
              <colgroup><col style="width:18%"><col style="width:18%"><col style="width:7%"><col style="width:7%"><col style="width:8%"><col style="width:42%"></colgroup>
              <thead><tr><th scope="col">Start</th><th scope="col">End</th><th scope="col">Perm</th><th scope="col">Size</th><th scope="col">Offset</th><th scope="col">File</th></tr></thead>
              <tbody>${MAPPINGS.map(
                (
                  mapping,
                  i,
                ) => `<tr data-row="${i}" data-category="${mapping.category}">
                <td>${mapping.start}</td><td>${mapping.end}</td><td>${mapping.permissions}</td><td>${mapping.size}</td><td>${mapping.offset}</td>
                <td>${mapping.file}</td>
              </tr>`,
              ).join("")}</tbody>
            </table>
          </div>
          <div class="permission-view" role="region" aria-label="Memory mapping permissions" hidden>
            <div class="permission-grid">
              <div class="permission"><code>r</code><span>Read</span></div>
              <div class="permission"><code>w</code><span>Write</span></div>
              <div class="permission"><code>x</code><span>Execute</span></div>
              <div class="permission"><code>p</code><span>Private</span><small>Copy-on-write</small></div>
            </div>
          </div>
        </div>
        <div class="controls"><button type="button" data-action="back">${icon("m10 4-4 4 4 4")} Back</button><button type="button" data-action="next">Next ${icon("m6 4 4 4-4 4")}</button><span class="count"></span></div>
      </figure>`
    this.events?.abort()
    this.events = new AbortController()
    const { signal } = this.events
    root.addEventListener(
      "click",
      (event) => {
        const target = event.target as Element
        const action =
          target.closest<HTMLElement>("[data-action]")?.dataset.action
        if (action === "fullscreen") {
          void this.toggleFullscreen()
          return
        }
        if (action === "back" || action === "next")
          this.goTo(this.step + (action === "next" ? 1 : -1))
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
    this.transition++
    this.events?.abort()
    this.cancelAnimations()
  }

  private async goTo(step: number) {
    const transition = ++this.transition
    this.cancelAnimations()
    const root = this.shadowRoot!
    const map = root.querySelector<HTMLElement>(".map")!
    const pieView = root.querySelector<HTMLElement>(".pie-view")!
    const permissions = root.querySelector<HTMLElement>(".permission-view")!
    const rows = [...root.querySelectorAll<HTMLElement>("tr[data-row]")]
    const previous = STEPS[this.step].mode
    const positions = new Map(
      rows
        .filter((row) => !row.hidden && !map.hidden)
        .map((row) => [row, row.getBoundingClientRect().top]),
    )
    // Reserve the existing stage height so the frame and controls do not jump.
    const height = Math.max(
      map.getBoundingClientRect().height,
      pieView.getBoundingClientRect().height,
      permissions.getBoundingClientRect().height,
    )
    map.style.minHeight = `${height}px`
    pieView.style.minHeight = `${height}px`
    permissions.style.minHeight = `${height}px`
    this.step = Math.max(0, Math.min(STEPS.length - 1, step))
    const mode = STEPS[this.step].mode
    const compact = ["filtered", "exp1", "stack"].includes(mode)
    const motion = !matchMedia("(prefers-reduced-motion: reduce)").matches
    const disappearing = rows.filter(
      (row, i) =>
        !row.hidden && !map.hidden && compact && !MAPPINGS[i].relevant,
    )
    if (motion && disappearing.length) {
      this.animations = disappearing.map((row) =>
        row.animate([{ opacity: 1 }, { opacity: 0 }], {
          duration: 180,
          fill: "forwards",
        }),
      )
      await Promise.allSettled(
        this.animations.map((animation) => animation.finished),
      )
      if (transition !== this.transition || !this.isConnected) return
      this.cancelAnimations()
    }
    this.render()
    if (!motion) return
    if (
      mode === "permissions" ||
      mode === "pie" ||
      previous === "permissions" ||
      previous === "pie"
    ) {
      const view =
        mode === "permissions"
          ? permissions
          : mode === "pie"
            ? pieView
            : map
      this.animations.push(
        view.animate([{ opacity: 0 }, { opacity: 1 }], {
          duration: 300,
          easing: "ease-out",
        }),
      )
      return
    }
    for (const row of rows) {
      if (row.hidden) continue
      const oldTop = positions.get(row)
      const movement =
        oldTop === undefined ? 0 : oldTop - row.getBoundingClientRect().top
      if (oldTop === undefined || Math.abs(movement) > 1) {
        this.animations.push(
          row.animate(
            [
              {
                transform: `translateY(${movement}px)`,
                opacity: oldTop === undefined ? 0 : 1,
              },
              { transform: "translateY(0)", opacity: 1 },
            ],
            { duration: 350, easing: "cubic-bezier(.2,.8,.2,1)" },
          ),
        )
      }
    }
  }

  private render() {
    const root = this.shadowRoot!
    const step = STEPS[this.step]
    const compact = ["filtered", "exp1", "stack"].includes(step.mode)
    const pieView = root.querySelector<HTMLElement>(".pie-view")!
    const selected = MAPPINGS.map((mapping) =>
      step.mode === "exp1"
        ? mapping.file === "exp1"
        : step.mode === "stack"
          ? mapping.file === "[stack]"
          : false,
    )
    root.querySelectorAll<HTMLElement>("tr[data-row]").forEach((row, i) => {
      const mapping = MAPPINGS[i]
      row.hidden = compact && !mapping.relevant
      row.toggleAttribute(
        "data-muted",
        step.mode === "dim"
          ? !mapping.relevant
          : ["exp1", "stack"].includes(step.mode) && !selected[i],
      )
      row.toggleAttribute("data-box", selected[i])
      row.toggleAttribute("data-box-start", selected[i] && !selected[i - 1])
      row.toggleAttribute("data-box-end", selected[i] && !selected[i + 1])
    })
    root.querySelector("h3")!.textContent = step.title
    root.querySelector<HTMLElement>(".permission-view")!.hidden =
      step.mode !== "permissions"
    pieView.hidden = step.mode !== "pie"
    const map = root.querySelector<HTMLElement>(".map")!
    map.hidden = step.mode === "permissions" || step.mode === "pie"
    const overview = root.querySelector<HTMLElement>(".memory-overview")!
    overview.hidden = !["all", "dim"].includes(step.mode)
    overview.toggleAttribute("data-dim", step.mode === "dim")
    map.toggleAttribute("data-overview", ["all", "dim"].includes(step.mode))
    map.toggleAttribute("data-compact", compact)
    const mapLabel =
      step.mode === "all"
        ? "All process memory mappings"
        : step.mode === "dim"
          ? "exp1 and stack highlighted, other memory dimmed"
          : `${step.title} memory mappings`
    map.setAttribute("aria-label", mapLabel)
    root.querySelector<HTMLButtonElement>("[data-action=back]")!.disabled =
      this.step === 0
    root.querySelector<HTMLButtonElement>("[data-action=next]")!.disabled =
      this.step === STEPS.length - 1
    root.querySelector(".count")!.textContent =
      `${this.step + 1} / ${STEPS.length}`
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

if (!customElements.get("process-memory-map"))
  customElements.define("process-memory-map", ProcessMemoryMap)
