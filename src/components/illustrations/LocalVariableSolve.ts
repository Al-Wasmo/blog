import { StepWalkthrough } from "./StepWalkthrough"
import {
  setSolveStep,
  solveStyles,
  solveTemplate,
} from "./PwnSolveWalkthrough"

const byteCells = (
  values: string[],
  kind: "pad" | "target" | "empty" = "pad",
) =>
  values
    .map(
      (value) =>
        `<span class="byte" ${kind === "target" ? 'data-target=""' : kind === "pad" ? 'data-filled=""' : ""}>${value}</span>`,
    )
    .join("")

const bufferCells = (values: string[], written: number) =>
  values
    .map(
      (value, index) =>
        `<span class="byte" ${index < written ? 'data-filled=""' : ""}>${value}</span>`,
    )
    .join("")

const stackView = (
  buffer: string[],
  secret: string[],
  note: string,
  written: number,
) => `<div class="stack-frame">
  <div class="stack-direction"><span>Higher addresses</span><span>↓ stack grows toward lower addresses</span></div>
  <div class="stack-row"><span class="stack-label">return address · sample</span><div class="bytes">${byteCells(["A5", "12", "40", "00", "00", "00", "00", "00"], "empty")}</div><span class="stack-offset">rbp + 0x8</span></div>
  <div class="stack-row"><span class="stack-label">saved RBP · sample</span><div class="bytes">${byteCells(["A0", "E2", "FF", "FF", "FF", "7F", "00", "00"], "empty")}</div><span class="stack-offset">rbp</span></div>
  <div class="stack-row" data-secret><span class="stack-label">secret · int</span><div class="bytes">${byteCells(secret, "target")}</div><span class="stack-offset">rbp − 0x4</span></div>
  <div class="stack-row" data-buffer><span class="stack-label">buffer[8]</span><div class="bytes">${bufferCells(buffer, written)}</div><span class="stack-offset">rbp − 0xc</span></div>
  <div class="stack-direction"><span>Lower addresses</span><span>${note}</span></div>
</div>`

const styles = /* css */ `
  .challenge-layout { display: grid; gap: 11px; }
  .stack-frame { display: grid; gap: 7px; }
  .stack-direction { display: flex; justify-content: space-between; color: var(--secondary); font: 11px var(--mono); }
  .stack-row { display: grid; grid-template-columns: minmax(110px, .85fr) minmax(0, 2fr) minmax(80px, .7fr); align-items: center; gap: 10px; padding: 7px 9px; border: 1px solid var(--line); border-radius: 6px; background: var(--surface); }
  .stack-row[data-buffer] { border-color: var(--accent); background: var(--accent-fill); }
  .stack-row[data-secret] { border-color: var(--danger); background: var(--danger-fill); }
  .stack-label { font: 12px var(--mono); }
  .stack-row .bytes { --count: 8; }
  .stack-row[data-secret] .bytes { --count: 4; }
  .stack-row .byte { min-height: 34px; }
  .stack-row[data-secret] .byte { border-color: var(--danger); color: var(--danger); }
  .stack-offset { color: var(--secondary); font: 11px var(--mono); text-align: right; white-space: nowrap; }
  .hex-value { display: flex; align-items: center; justify-content: center; gap: 10px; padding: 10px; border: 1px solid var(--danger); border-radius: 7px; background: var(--danger-fill); font: 15px var(--mono); }
  .hex-value strong { color: var(--danger); }
  .layout-facts { display: flex; align-items: center; justify-content: space-between; gap: 9px; color: var(--secondary); font: 11px var(--mono); }
  .payload-view { display: grid; justify-items: stretch; gap: 12px; }
  .outcome { display: grid; justify-items: center; gap: 9px; }
  .outcome strong { color: var(--accent); font-size: 23px; }
  .outcome .check { padding: 10px 15px; border: 1px solid var(--accent); border-radius: 7px; background: var(--accent-fill); color: var(--accent); font: 16px var(--mono); }
  :host(:is(:fullscreen, [data-expanded])) .stack-direction, :host(:is(:fullscreen, [data-expanded])) .stack-offset { font-size: 15px; }
  :host(:is(:fullscreen, [data-expanded])) .stack-row { padding: 10px 13px; }
  :host(:is(:fullscreen, [data-expanded])) .stack-label { font-size: 17px; }
  :host(:is(:fullscreen, [data-expanded])) .stack-row .byte { min-height: 48px; font-size: 17px; }
  :host(:is(:fullscreen, [data-expanded])) .hex-value { font-size: 21px; }
  :host(:is(:fullscreen, [data-expanded])) .layout-facts { font-size: 15px; }
  :host(:is(:fullscreen, [data-expanded])) .outcome strong { font-size: 32px; }
  :host(:is(:fullscreen, [data-expanded])) .outcome .check { font-size: 21px; }
  @media (width < 760px) {
    .stack-row { grid-template-columns: 1fr auto; gap: 6px; }
    .stack-row .bytes { grid-column: 1 / -1; grid-row: 2; }
    .stack-offset { grid-column: 2; grid-row: 1; }
  }
`

const steps = [
  {
    title: "Read the challenge",
    visual: `<div class="challenge-layout">
      <div class="source">
        <div class="source-line"><span class="line-no">06</span><code>volatile int secret = <span data-highlight>0</span>;</code></div>
        <div class="source-line"><span class="line-no">07</span><code>char buffer[<span data-highlight>8</span>];</code></div>
        <div class="source-line"><span class="line-no">12</span><code>read(0, buffer, <span data-risk>32</span>);</code></div>
        <div class="source-line"><span class="line-no">14</span><code>if (secret == <span data-highlight>1234</span>)</code></div>
      </div>
      <div class="target-check"><span>Goal</span><strong>change local secret to 1234</strong></div>
    </div>`,
    commands: ["list 5"],
    output: "buffer holds 8 bytes\nread accepts up to 32",
    caption: "The input can write beyond the local buffer before the check.",
  },
  {
    title: "Inspect the stack",
    visual: stackView(
      ["41", "41", "41", "41", "··", "··", "··", "··"],
      ["00", "00", "00", "00"],
      "sample frame · four input bytes",
      4,
    ),
    commands: ["x/12bx &buffer"],
    output: "buffer: 41 41 41 41 ?? ?? ?? ??\nsecret: 00 00 00 00",
    caption: "The stack rows show the eight-byte buffer beside the local secret.",
  },
  {
    title: "Overwrite the secret",
    visual: `<div class="payload-view">
      ${stackView(Array(8).fill("41"), ["D2", "04", "00", "00"], "overflow reaches the next local", 8)}
      <div class="hex-value"><span>1234</span><span>→</span><strong>0x000004D2</strong></div>
      <div class="layout-facts"><span>input bytes · little-endian</span><strong>41 × 8 · D2 04 00 00</strong></div>
    </div>`,
    commands: ["x/12bx &buffer"],
    output: "41 41 41 41 41 41 41 41\nD2 04 00 00",
    caption: "Eight A bytes fill the buffer; the next four bytes encode 1234 as 0x000004D2.",
  },
  {
    title: "Verify the overwrite",
    visual: `<div class="outcome"><div class="target-check"><span>Pwndbg</span><strong>secret = 1234</strong></div><strong>Correct password!</strong><div class="check">secret == 1234</div></div>`,
    commands: ["p/x secret", "p/d secret"],
    output: "$1 = 0x4d2\n$2 = 1234\nCorrect password!",
    caption: "Pwndbg shows the same value in hexadecimal and decimal.",
  },
]

class LocalVariableSolve extends StepWalkthrough {
  protected readonly stepCount = steps.length

  protected template() {
    return solveTemplate("B0F1 · Local Variable", this.stepCount, "Local variable solve")
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

if (!customElements.get("local-variable-solve"))
  customElements.define("local-variable-solve", LocalVariableSolve)
