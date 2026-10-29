import { StepWalkthrough } from "./StepWalkthrough"
import {
  setSolveStep,
  solveStyles,
  solveTemplate,
} from "./PwnSolveWalkthrough"

const byteCells = (values: string[], marker = "") =>
  values
    .map(
      (value) =>
        `<span class="byte" ${marker ? `data-${marker}=""` : ""}>${value}</span>`,
    )
    .join("")

const stackRow = (
  name: string,
  values: string[],
  offset: string,
  marker = "",
) => `<div class="stack-row" ${marker ? `data-${marker}=""` : ""}>
  <span class="stack-name">${name}</span>
  <div class="bytes">${byteCells(values, marker === "guard" ? "guard" : marker === "wrong" ? "wrong" : marker === "buffer" ? "filled" : "")}</div>
  <span class="stack-offset">${offset}</span>
</div>`

const styles = /* css */ `
  .screen { display: grid; gap: 12px; }
  .stack-view { display: grid; gap: 6px; }
  .stack-direction { display: flex; justify-content: space-between; color: var(--secondary); font: 11px var(--mono); }
  .stack-row { display: grid; grid-template-columns: minmax(125px, .9fr) minmax(0, 2fr) minmax(75px, .6fr); align-items: center; gap: 9px; padding: 6px 8px; border: 1px solid var(--line); border-radius: 6px; background: var(--surface); }
  .stack-name { font: 12px var(--mono); }
  .stack-offset { color: var(--secondary); font: 11px var(--mono); text-align: right; white-space: nowrap; }
  .stack-row .bytes { --count: 8; }
  .stack-row .byte { min-height: 34px; }
  .stack-row[data-buffer] { border-color: var(--accent); background: var(--accent-fill); }
  .stack-row[data-guard] { border-color: var(--accent); background: var(--accent-fill); }
  .stack-row[data-wrong] { border-color: var(--danger); background: var(--danger-fill); }
  .stack-row[data-wrong] .byte, .byte[data-wrong] { border-color: var(--danger); background: var(--danger-fill); color: var(--danger); }
  .byte[data-guard] { border-color: var(--accent); background: var(--accent-fill); color: var(--accent); }
  .stack-label { display: flex; justify-content: space-between; gap: 10px; color: var(--secondary); font: 11px var(--mono); }
  .readout { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 12px; border: 1px solid var(--line); border-radius: 7px; background: var(--surface); }
  .readout span { color: var(--secondary); font-size: 12px; }
  .readout code { color: var(--accent); font: 700 15px var(--mono); }
  .flow { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 8px; }
  .flow-node { display: grid; justify-items: center; gap: 5px; min-width: 100px; padding: 10px 12px; border: 1px solid var(--line); border-radius: 7px; background: var(--surface); text-align: center; }
  .flow-node strong { font: 700 14px var(--mono); }
  .flow-node span { color: var(--secondary); font-size: 11px; }
  .flow-node[data-fail] { border-color: var(--danger); background: var(--danger-fill); }
  .flow-node[data-fail] strong { color: var(--danger); }
  .flow-node[data-win] { border-color: var(--accent); background: var(--accent-fill); }
  .flow-node[data-win] strong { color: var(--accent); }
  .arrow { color: var(--accent); font: 18px var(--mono); }
  .assembly { display: grid; gap: 4px; padding: 10px 12px; border: 1px solid var(--line); border-radius: 7px; background: var(--surface); font: 12px/1.5 var(--mono); }
  .assembly-line { display: grid; grid-template-columns: 75px minmax(0, 1fr); gap: 9px; }
  .assembly-address { color: var(--secondary); }
  .assembly-line[data-fail] code { color: var(--danger); font-weight: 700; }
  .payload-grid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 6px; }
  .payload-part { display: grid; align-content: center; justify-items: center; gap: 5px; min-width: 0; min-height: 90px; padding: 8px 5px; border: 1px solid var(--line); border-radius: 7px; background: var(--surface); text-align: center; }
  .payload-part small { color: var(--secondary); font-size: 10px; }
  .payload-part code { font: 700 12px var(--mono); overflow-wrap: anywhere; }
  .payload-part[data-guard] { border-color: var(--accent); background: var(--accent-fill); }
  .payload-part[data-guard] code { color: var(--accent); }
  .payload-part[data-dest] { border-color: var(--danger); background: var(--danger-fill); }
  .payload-part[data-dest] code { color: var(--danger); }
  .payload-total { padding: 9px; border: 1px solid var(--line); border-radius: 6px; color: var(--secondary); font: 12px var(--mono); text-align: center; }
  .result-route { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 8px; }
  .result-route span { padding: 10px 13px; border: 1px solid var(--line); border-radius: 6px; background: var(--surface); font: 14px var(--mono); }
  .result-route [data-win] { border-color: var(--accent); background: var(--accent-fill); color: var(--accent); }
  .stack-row[data-rip] { border-color: var(--danger); background: var(--danger-fill); }
  .stack-row[data-rip] .byte { border-color: var(--danger); background: var(--danger-fill); color: var(--danger); }
  :host(:is(:fullscreen, [data-expanded])) .stack-direction, :host(:is(:fullscreen, [data-expanded])) .stack-offset { font-size: 14px; }
  :host(:is(:fullscreen, [data-expanded])) .stack-row { padding: 9px 12px; }
  :host(:is(:fullscreen, [data-expanded])) .stack-name { font-size: 15px; }
  :host(:is(:fullscreen, [data-expanded])) .stack-row .byte { min-height: 46px; font-size: 16px; }
  :host(:is(:fullscreen, [data-expanded])) .readout code { font-size: 20px; }
  :host(:is(:fullscreen, [data-expanded])) .flow-node { min-width: 130px; padding: 14px; }
  :host(:is(:fullscreen, [data-expanded])) .flow-node strong { font-size: 18px; }
  :host(:is(:fullscreen, [data-expanded])) .flow-node span { font-size: 14px; }
  :host(:is(:fullscreen, [data-expanded])) .assembly { gap: 7px; padding: 14px 16px; font-size: 16px; }
  :host(:is(:fullscreen, [data-expanded])) .payload-part { min-height: 116px; }
  :host(:is(:fullscreen, [data-expanded])) .payload-part small { font-size: 13px; }
  :host(:is(:fullscreen, [data-expanded])) .payload-part code { font-size: 16px; }
  :host(:is(:fullscreen, [data-expanded])) .payload-total { font-size: 16px; }
  :host(:is(:fullscreen, [data-expanded])) .result-route span { padding: 14px 18px; font-size: 18px; }
  @media (width < 760px) {
    .stack-row { grid-template-columns: minmax(100px, .9fr) minmax(0, 2fr); gap: 6px; }
    .stack-row .bytes { grid-column: 1 / -1; }
    .stack-offset { grid-column: 2; grid-row: 1; }
    .payload-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .payload-part:last-child { grid-column: 1 / -1; }
  }
`

const canaryBytes = ["00", "??", "??", "??", "??", "??", "??", "??"]

const steps = [
  {
    title: "The program leaks its canary",
    visual: `<div class="screen">
      <div class="source">
        <div class="source-line"><span class="line-no">05</span><code>void <span data-highlight>win</span>() { ... }</code></div>
        <div class="source-line"><span class="line-no">11</span><code>void <span data-risk>vuln</span>() {</code></div>
        <div class="source-line"><span class="line-no">12</span><code>  char buffer[<span data-highlight>8</span>];</code></div>
        <div class="source-line"><span class="line-no">13</span><code>  unsigned long canary;</code></div>
        <div class="source-line"><span class="line-no">15</span><code>  movq %fs:0x28 → canary</code></div>
        <div class="source-line"><span class="line-no">16</span><code>  printf("Canary: 0x%016lx\\n", canary);</code></div>
        <div class="source-line"><span class="line-no">21</span><code>  read(0, buffer, <span data-risk>64</span>);</code></div>
      </div>
      <div class="readout"><span>printed every run · value varies</span><code>8-byte guard</code></div>
    </div>`,
    commands: ["disas vuln", "checksec"],
    output: "buffer = $rbp - 0x10\nsaved guard = $rbp - 0x8\nwin = 0x4011f6 · canary found · NX · No PIE",
    caption: "The program prints a copy of the stack guard before reading input.",
  },
  {
    title: "Inspect the stack",
    visual: `<div class="stack-view">
      <div class="stack-direction"><span>Higher addresses</span><span>↓ stack grows lower</span></div>
      ${stackRow("return address", ["DD", "12", "40", "00", "00", "00", "00", "00"], "rbp + 0x8")}
      ${stackRow("saved RBP", Array(8).fill("??"), "rbp")}
      ${stackRow("compiler canary", canaryBytes, "rbp − 0x8", "guard")}
      ${stackRow("buffer[8]", Array(8).fill("??"), "rbp − 0x10", "buffer")}
      ${stackRow("printed canary copy", canaryBytes, "rbp − 0x18", "guard")}
      <div class="stack-direction"><span>Lower addresses</span><span>sample layout from this build</span></div>
    </div>`,
    commands: ["stack"],
    output: "rbp-0x18  canary copy\nrbp-0x10  buffer[8]\nrbp-0x08  saved guard\nrbp+0x00  saved RBP\nrbp+0x08  return address",
    caption: "The printed copy sits below the buffer; the compiler’s guard sits just above it.",
  },
  {
    title: "A wrong canary stops the return",
    visual: `<div class="screen">
      <div class="stack-view">
        <div class="stack-label"><span>Overflow input</span><span>read limit: 64 bytes</span></div>
        ${stackRow("buffer[8]", Array(8).fill("41"), "offset 0", "buffer")}
        ${stackRow("saved guard", Array(8).fill("41"), "offset 8", "wrong")}
      </div>
      <div class="flow"><div class="flow-node"><strong>read()</strong><span>guard overwritten</span></div><b class="arrow">→</b><div class="flow-node"><strong>compare</strong><span>values differ</span></div><b class="arrow">→</b><div class="flow-node" data-fail><strong>__stack_chk_fail</strong><span>abort</span></div></div>
      <div class="assembly">
        <div class="assembly-line"><span class="assembly-address">0x4012a2</span><code>mov rax, [rbp-0x8]</code></div>
        <div class="assembly-line"><span class="assembly-address">0x4012a6</span><code>sub rax, fs:0x28</code></div>
        <div class="assembly-line"><span class="assembly-address">0x4012af</span><code>je 0x4012b6</code></div>
        <div class="assembly-line" data-fail><span class="assembly-address">0x4012b1</span><code>call __stack_chk_fail</code></div>
      </div>
    </div>`,
    commands: ["run"],
    output: "*** stack smashing detected ***\nProgram received SIGABRT",
    caption: "The compiler compares the saved guard with fs:0x28 before returning.",
  },
  {
    title: "Copy the leaked canary",
    visual: `<div class="screen">
      <div class="payload-grid">
        <div class="payload-part"><small>buffer · offset 0</small><code>A × 8</code></div>
        <div class="payload-part" data-guard><small>canary · offset 8</small><code>p64(leak)</code></div>
        <div class="payload-part"><small>saved RBP · offset 16</small><code>B × 8</code></div>
        <div class="payload-part"><small>saved RIP · offset 24</small><code>0x40101a</code></div>
        <div class="payload-part" data-dest><small>next address · offset 32</small><code>0x4011f6</code></div>
      </div>
      <div class="stack-row" data-guard><span class="stack-name">guard bytes in memory</span><div class="bytes">${byteCells(canaryBytes, "guard")}</div><span class="stack-offset">little-endian</span></div>
      <div class="payload-total">40 bytes total · the leak and payload must use the same run</div>
    </div>`,
    commands: ["p/x canary"],
    output: "Use the 8-byte value printed by this process\np64(value) → saved guard",
    caption: "Keep the guard unchanged, then place a ret gadget before win() for stack alignment.",
  },
  {
    title: "Return to win",
    visual: `<div class="screen">
      <div class="result-route"><span>guard matches</span><b class="arrow">→</b><span>vuln returns</span><b class="arrow">→</b><span>ret · 0x40101a</span><b class="arrow">→</b><span data-win>win() · 0x4011f6</span></div>
      <div class="result"><strong>You reached the WIN function!</strong><code>0x4011f6</code></div>
    </div>`,
    commands: ["run"],
    output: "Canary: <value from this run>\nEnter text:\nYou reached the WIN function!",
    caption: "The matching guard lets vuln return through the alignment gadget into win().",
  },
]

class CanarySolve extends StepWalkthrough {
  protected readonly stepCount = steps.length

  protected template() {
    return solveTemplate("B0F5 · Canary", this.stepCount, "canary solve")
  }

  protected styles() {
    return `${solveStyles}${styles}`
  }

  protected renderStep() {
    const current = steps[this.step]!
    setSolveStep(
      this.shadowRoot!,
      current.title,
      current.visual,
      current.commands,
      current.output,
      current.caption,
    )
  }
}

if (!customElements.get("canary-solve"))
  customElements.define("canary-solve", CanarySolve)
